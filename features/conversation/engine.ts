import type { ConsentMode, EvaluationResult, ProfileAnswers, Question, Scenario } from "./domain";
import { consentQuestion, questionBank } from "./questions";

const MAX_FOLLOW_UP_QUESTIONS = 5;

export function selectQuestions(scenario: Scenario, consent: ConsentMode): Question[] {
  if (consent === "PENDING") return [consentQuestion];
  if (consent === "DECLINED") return [];

  const knownProfile = consent === "USE_KNOWN_DATA" ? scenario.knownProfile : {};

  return scenario.requiredFields
    .filter((field) => knownProfile[field] === undefined)
    .slice(0, MAX_FOLLOW_UP_QUESTIONS)
    .map((field) => questionBank[field]);
}

const intentionScores: Record<string, number> = {
  "0_3": 30,
  "3_6": 26,
  "6_12": 16,
  "12_PLUS": 8,
};

const incomeScores: Record<string, number> = {
  HIGH: 28,
  MID: 24,
  LOW: 15,
  UNKNOWN: 8,
};

const obligationScores: Record<string, number> = {
  LOW: 7,
  MEDIUM: 4,
  HIGH: 0,
  UNKNOWN: 2,
};

const savingsScores: Record<string, number> = {
  READY: 20,
  PARTIAL: 12,
  NONE: 2,
  UNKNOWN: 4,
};

export function evaluateProfile(
  scenario: Scenario,
  consent: ConsentMode,
  declaredAnswers: ProfileAnswers,
): EvaluationResult {
  if (consent === "DECLINED") {
    return {
      leadId: scenario.leadId,
      readinessScore: 0,
      confidenceScore: 1,
      route: "OPTED_OUT",
      projectIds: [],
      factors: [],
      blockers: ["No se autorizó continuar con la orientación"],
      nextAction: "Finalizar comunicaciones",
    };
  }

  const knownProfile = consent === "USE_KNOWN_DATA" ? scenario.knownProfile : {};
  const profile = { ...knownProfile, ...declaredAnswers };
  const selectedQuestions = selectQuestions(scenario, consent);
  const answeredSelected = selectedQuestions.filter((question) => declaredAnswers[question.id as keyof ProfileAnswers] !== undefined).length;

  const intention = intentionScores[profile.horizon ?? ""] ?? 0;
  const capacity = (incomeScores[profile.incomeRange ?? ""] ?? 0) + (obligationScores[profile.obligations ?? "UNKNOWN"] ?? 0);
  const preparation = savingsScores[profile.savings ?? "UNKNOWN"] ?? 0;
  const participation = selectedQuestions.length === 0 ? 15 : Math.round((answeredSelected / selectedQuestions.length) * 15);
  const readinessScore = Math.min(100, intention + capacity + preparation + participation);
  const availableSignals = Object.values(profile).filter(Boolean).length;
  const confidenceScore = Math.min(0.95, Number((0.45 + availableSignals * 0.06).toFixed(2)));

  let route: EvaluationResult["route"] = "NEEDS_DATA";
  if (readinessScore >= 75 && profile.affiliation === "NON_AFFILIATE") route = "NON_AFFILIATE_PRIORITY";
  else if (readinessScore >= 75) route = "ADVISOR_NOW";
  else if (profile.savings === "NONE") route = "NURTURE_FINANCIAL";
  else if (profile.horizon === "12_PLUS") route = "NURTURE_LONG_TERM";
  else if (profile.subsidyInterest === "WANTS_REVIEW" || profile.subsidyInterest === "NOT_REVIEWED") route = "NURTURE_BENEFITS";

  const projectIds = route === "ADVISOR_NOW" && profile.location === "SOACHA" ? ["versalles"] : [];
  const factors = [
    intention >= 26 ? "Horizonte de compra cercano" : "Horizonte de compra gradual",
    capacity >= 28 ? "Capacidad preliminar favorable" : "Capacidad por fortalecer o validar",
    preparation >= 12 ? "Ahorro en construcción o disponible" : "Ahorro inicial por fortalecer",
  ];
  const blockers = [
    ...(profile.savings === "NONE" ? ["Ahorro inicial insuficiente"] : []),
    ...(profile.subsidyInterest === "WANTS_REVIEW" || profile.subsidyInterest === "NOT_REVIEWED" ? ["Beneficios pendientes de validación"] : []),
  ];
  const nextActions: Record<EvaluationResult["route"], string> = {
    ADVISOR_NOW: "Agendar una conversación con un asesor",
    NON_AFFILIATE_PRIORITY: "Validar la ruta comercial para no afiliados",
    NURTURE_FINANCIAL: "Definir una meta de ahorro y fecha de revisión",
    NURTURE_BENEFITS: "Revisar beneficios potenciales y requisitos",
    NURTURE_LONG_TERM: "Programar seguimiento por hitos",
    NEEDS_DATA: "Completar la información pendiente",
    OPTED_OUT: "Finalizar comunicaciones",
  };

  return {
    leadId: scenario.leadId,
    readinessScore,
    confidenceScore,
    route,
    projectIds,
    factors,
    blockers,
    nextAction: nextActions[route],
  };
}

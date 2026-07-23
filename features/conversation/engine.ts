import type {
  ConsentMode,
  EvaluationResult,
  ProfileAnswers,
  ProfileField,
  Question,
  Scenario,
} from "./domain";
import { consentQuestion, questionBank } from "./questions";

const MAX_FOLLOW_UP_QUESTIONS = 5;
const MAX_TOTAL_COMMITMENT_RATIO = 0.4;

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

const incomeEstimates: Record<string, number> = {
  LOW: 2_000_000,
  MID: 4_000_000,
  HIGH: 6_000_000,
};

const commitmentRatios: Record<string, number> = {
  LOW: 0.1,
  MEDIUM: 0.225,
  HIGH: 0.35,
  UNKNOWN: 0.2,
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
  if (consent === "DECLINED") return buildOptedOutResult(scenario);

  const knownProfile = consent === "USE_KNOWN_DATA" ? scenario.knownProfile : {};
  const profile = { ...knownProfile, ...declaredAnswers };
  const selectedQuestions = selectQuestions(scenario, consent);
  const answeredSelected = selectedQuestions.filter(
    (question) => declaredAnswers[question.id as keyof ProfileAnswers] !== undefined,
  ).length;

  const capacity = calculateCapacity(profile);
  const intention = intentionScores[profile.horizon ?? ""] ?? 0;
  const capacityScore =
    capacity.status === "STRONG" ? 28
      : capacity.status === "MODERATE" ? 18
        : capacity.status === "LIMITED" ? 8
          : 6;
  const preparation = savingsScores[profile.savings ?? "UNKNOWN"] ?? 0;
  const participation = selectedQuestions.length === 0
    ? 15
    : Math.round((answeredSelected / selectedQuestions.length) * 15);
  const readinessScore = Math.min(100, intention + capacityScore + preparation + participation);
  const availableSignals = Object.values(profile).filter(Boolean).length;
  const confidenceScore = Math.min(0.95, Number((0.45 + availableSignals * 0.06).toFixed(2)));

  const route = selectRoute(readinessScore, profile);
  const commercialRoute = route === "ADVISOR_NOW" || route === "NON_AFFILIATE_PRIORITY";
  const projectIds = commercialRoute && profile.location === "SOACHA" ? ["versalles"] : [];
  const benefitSignals = {
    confirmed: profile.subsidyInterest === "HAS"
      ? ["Beneficio reportado por el prospecto; requiere verificación documental"]
      : [],
    potential: consent === "USE_KNOWN_DATA" && scenario.knownBenefits.length
      ? scenario.knownBenefits
      : profile.affiliation === "AFFILIATE"
        ? ["Subsidio familiar de vivienda por validar", "Acompañamiento Pertenecer"]
      : profile.subsidyInterest === "WANTS_REVIEW"
        ? ["Subsidio familiar de vivienda por validar"]
        : [],
  };
  const factors = [
    intention >= 26 ? "Horizonte de compra cercano" : "Horizonte de compra gradual",
    capacity.status === "STRONG"
      ? "Margen preliminar de cuota favorable bajo la regla del 40 %"
      : "Margen de cuota por fortalecer o validar",
    preparation >= 12 ? "Ahorro en construcción o disponible" : "Ahorro inicial por fortalecer",
  ];
  const blockers = [
    ...(profile.savings === "NONE" ? ["Ahorro inicial insuficiente"] : []),
    ...(benefitSignals.potential.length ? ["Beneficios pendientes de validación"] : []),
    ...(capacity.status === "LIMITED" ? ["Las obligaciones actuales dejan un margen reducido para vivienda"] : []),
  ];
  const nextActions: Record<EvaluationResult["route"], string> = {
    ADVISOR_NOW: "Contactar, validar financiación y proponer visita",
    NON_AFFILIATE_PRIORITY: "Asignar asesor y validar la ruta disponible para no afiliados",
    NURTURE_FINANCIAL: "Definir meta de ahorro y revisión en tres meses",
    NURTURE_BENEFITS: "Validar beneficios potenciales y requisitos",
    NURTURE_LONG_TERM: "Programar seguimiento según su horizonte de compra",
    NEEDS_DATA: "Completar la información financiera pendiente",
    OPTED_OUT: "Finalizar comunicaciones",
  };
  const followUp = buildFollowUp(scenario.capturedAt, route);

  return {
    leadId: scenario.leadId,
    readinessScore,
    confidenceScore,
    priority: readinessScore >= 75 ? "HIGH" : readinessScore >= 50 ? "MEDIUM" : "LOW",
    route,
    projectIds,
    capacity,
    benefitSignals,
    profileSnapshot: profile,
    knownDataUsed: consent === "USE_KNOWN_DATA"
      ? Object.keys(scenario.knownProfile) as ProfileField[]
      : [],
    factors,
    blockers,
    commercialSummary: buildCommercialSummary(scenario, profile, route, capacity.estimatedHousingPayment),
    nextAction: nextActions[route],
    followUpAt: followUp.at,
    advanceCondition: followUp.condition,
  };
}

function buildFollowUp(
  capturedAt: string,
  route: EvaluationResult["route"],
): { at: string | null; condition: string } {
  const configuration: Record<EvaluationResult["route"], { days: number | null; condition: string }> = {
    ADVISOR_NOW: { days: 0, condition: "Validar financiación y confirmar interés en una visita" },
    NON_AFFILIATE_PRIORITY: { days: 0, condition: "Confirmar ruta disponible para no afiliados" },
    NURTURE_FINANCIAL: { days: 90, condition: "Contar con una meta de ahorro activa y evidenciar avance" },
    NURTURE_BENEFITS: { days: 14, condition: "Completar la validación preliminar de beneficios" },
    NURTURE_LONG_TERM: { days: 90, condition: "Acercarse a un horizonte de compra menor a doce meses" },
    NEEDS_DATA: { days: 3, condition: "Completar ingresos y obligaciones pendientes" },
    OPTED_OUT: { days: null, condition: "Solo reactivar si el prospecto inicia una nueva conversación" },
  };
  const selected = configuration[route];
  if (selected.days === null) return { at: null, condition: selected.condition };

  const date = new Date(capturedAt);
  date.setUTCDate(date.getUTCDate() + selected.days);
  return { at: date.toISOString(), condition: selected.condition };
}

function calculateCapacity(profile: ProfileAnswers): EvaluationResult["capacity"] {
  const monthlyIncomeEstimate = incomeEstimates[profile.incomeRange ?? ""] ?? 0;
  const currentCommitmentRatio = commitmentRatios[profile.obligations ?? "UNKNOWN"] ?? 0.2;
  const maximumHousingRatio = monthlyIncomeEstimate > 0
    ? Math.max(0, MAX_TOTAL_COMMITMENT_RATIO - currentCommitmentRatio)
    : 0;
  const estimatedHousingPayment =
    Math.round((monthlyIncomeEstimate * maximumHousingRatio) / 50_000) * 50_000;
  const status =
    monthlyIncomeEstimate === 0 ? "UNKNOWN"
      : maximumHousingRatio >= 0.25 && estimatedHousingPayment >= 1_000_000 ? "STRONG"
        : maximumHousingRatio >= 0.12 ? "MODERATE"
          : "LIMITED";

  return {
    monthlyIncomeEstimate,
    currentCommitmentRatio,
    maximumHousingRatio,
    estimatedHousingPayment,
    status,
  };
}

function selectRoute(
  readinessScore: number,
  profile: ProfileAnswers,
): EvaluationResult["route"] {
  if (readinessScore >= 75 && profile.affiliation === "NON_AFFILIATE") return "NON_AFFILIATE_PRIORITY";
  if (readinessScore >= 75) return "ADVISOR_NOW";
  if (profile.savings === "NONE") return "NURTURE_FINANCIAL";
  if (profile.horizon === "12_PLUS") return "NURTURE_LONG_TERM";
  if (profile.subsidyInterest === "WANTS_REVIEW" || profile.subsidyInterest === "NOT_REVIEWED") {
    return "NURTURE_BENEFITS";
  }
  return "NEEDS_DATA";
}

function buildCommercialSummary(
  scenario: Scenario,
  profile: ProfileAnswers,
  route: EvaluationResult["route"],
  estimatedHousingPayment: number,
): string {
  const source = scenario.leadSource === "META" ? "pauta de Meta" : "canal orgánico";
  const timing = profile.horizon === "0_3" ? "en menos de tres meses"
    : profile.horizon === "3_6" ? "entre tres y seis meses"
      : profile.horizon === "6_12" ? "entre seis y doce meses"
        : "a largo plazo";
  const payment = estimatedHousingPayment > 0
    ? `una cuota orientativa máxima de ${new Intl.NumberFormat("es-CO", {
        style: "currency",
        currency: "COP",
        maximumFractionDigits: 0,
      }).format(estimatedHousingPayment)}`
    : "capacidad pendiente de completar";
  const disposition = route === "ADVISOR_NOW" || route === "NON_AFFILIATE_PRIORITY"
    ? "Está listo para una conversación comercial."
    : "Debe continuar en nutrición antes del contacto de cierre.";

  return `${scenario.displayName} llegó desde ${source}, quiere avanzar ${timing} y registra ${payment}. ${disposition}`;
}

function buildOptedOutResult(scenario: Scenario): EvaluationResult {
  return {
    leadId: scenario.leadId,
    readinessScore: 0,
    confidenceScore: 1,
    priority: "LOW",
    route: "OPTED_OUT",
    projectIds: [],
    capacity: {
      monthlyIncomeEstimate: 0,
      currentCommitmentRatio: 0,
      maximumHousingRatio: 0,
      estimatedHousingPayment: 0,
      status: "UNKNOWN",
    },
    benefitSignals: { confirmed: [], potential: [] },
    profileSnapshot: {},
    knownDataUsed: [],
    factors: [],
    blockers: ["No se autorizó continuar con la orientación"],
    commercialSummary: "El prospecto decidió no continuar. No realizar contacto derivado de esta sesión.",
    nextAction: "Finalizar comunicaciones",
    followUpAt: null,
    advanceCondition: "Solo reactivar si el prospecto inicia una nueva conversación",
  };
}

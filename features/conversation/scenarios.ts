import type { ProfileAnswers, Scenario } from "./domain";

export const scenarios = {
  jonathan: {
    id: "jonathan",
    leadId: "lead-jonathan",
    displayName: "Jonathan",
    leadSource: "META",
    capturedAt: "2026-07-23T08:30:00.000-05:00",
    routeLabel: "Afiliado listo",
    description: "Lead de pauta con afiliación, hogar e ingresos conocidos. Debemos descubrir intención, capacidad disponible y ubicación.",
    knownProfile: {
      affiliation: "AFFILIATE",
      incomeRange: "MID",
      householdSize: "3",
    },
    knownBenefits: ["Subsidio familiar de vivienda por validar", "Acompañamiento Pertenecer"],
    engagementSignals: ["Respondió una pauta de vivienda", "Solicitó información del proyecto Versalles"],
    campaignProjectId: "versalles",
    requiredFields: ["dreamGoal", "horizon", "location", "obligations", "savings"],
  },
  laura: {
    id: "laura",
    leadId: "lead-laura",
    displayName: "Laura",
    leadSource: "ORGANIC",
    capturedAt: "2026-07-23T09:10:00.000-05:00",
    routeLabel: "No afiliada con capacidad",
    description: "Lead orgánico no afiliado. La calidad del perfilamiento debe ser la misma y su afiliación no reduce la prioridad.",
    knownProfile: {
      affiliation: "NON_AFFILIATE",
    },
    knownBenefits: [],
    engagementSignals: ["Llegó desde el portal de vivienda", "Consultó información de financiación"],
    requiredFields: ["affiliation", "dreamGoal", "horizon", "incomeRange", "savings", "obligations"],
  },
  camila: {
    id: "camila",
    leadId: "lead-camila",
    displayName: "Camila",
    leadSource: "META",
    capturedAt: "2026-07-23T10:00:00.000-05:00",
    routeLabel: "Afiliada en preparación",
    description: "Lead de pauta con compra a largo plazo y ahorro pendiente. Debemos definir un acompañamiento útil, no enviarla a cierre.",
    knownProfile: {
      affiliation: "AFFILIATE",
      dreamGoal: "PREPARE",
      horizon: "12_PLUS",
      savings: "NONE",
    },
    knownBenefits: ["Acompañamiento Pertenecer", "Subsidio familiar de vivienda por validar"],
    engagementSignals: ["Guardó contenido sobre subsidios", "Aún no ha solicitado contacto comercial"],
    requiredFields: ["affiliation", "mainConcern", "incomeRange", "obligations", "subsidyInterest", "visitIntent"],
  },
} satisfies Record<Scenario["id"], Scenario>;

export type ScenarioId = keyof typeof scenarios;

export function getScenario(id: string): Scenario | undefined {
  return scenarios[id as ScenarioId];
}

export function getScenarioByLeadId(leadId: string): Scenario | undefined {
  return Object.values(scenarios).find((scenario) => scenario.leadId === leadId);
}

export const scenarioAnswers: Record<ScenarioId, ProfileAnswers> = {
  jonathan: {
    dreamGoal: "BUY_THIS_YEAR",
    horizon: "3_6",
    location: "SOACHA",
    obligations: "LOW",
    savings: "READY",
  },
  laura: {
    dreamGoal: "BUY_THIS_YEAR",
    horizon: "0_3",
    incomeRange: "HIGH",
    savings: "READY",
    obligations: "LOW",
  },
  camila: {
    mainConcern: "BENEFITS",
    incomeRange: "MID",
    obligations: "MEDIUM",
    subsidyInterest: "WANTS_REVIEW",
    visitIntent: "LATER",
  },
};

export function getScenarioAnswers(id: string): ProfileAnswers | undefined {
  return Object.prototype.hasOwnProperty.call(scenarioAnswers, id)
    ? scenarioAnswers[id as ScenarioId]
    : undefined;
}

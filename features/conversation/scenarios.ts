import type { Scenario } from "./domain";

export const scenarios = {
  jonathan: {
    id: "jonathan",
    leadId: "lead-jonathan",
    displayName: "Jonathan",
    routeLabel: "Afiliado listo",
    description: "Colsubsidio ya conoce su afiliación y rango de ingresos.",
    knownProfile: {
      affiliation: "AFFILIATE",
      incomeRange: "MID",
      householdSize: "3",
    },
    requiredFields: ["affiliation", "dreamGoal", "location", "horizon", "savings"],
  },
  laura: {
    id: "laura",
    leadId: "lead-laura",
    displayName: "Laura",
    routeLabel: "No afiliada con capacidad",
    description: "Su no afiliación define la ruta, pero no reduce su preparación.",
    knownProfile: {
      affiliation: "NON_AFFILIATE",
    },
    requiredFields: ["affiliation", "dreamGoal", "horizon", "incomeRange", "savings", "obligations"],
  },
  camila: {
    id: "camila",
    leadId: "lead-camila",
    displayName: "Camila",
    routeLabel: "Afiliada en preparación",
    description: "Su horizonte y ahorro conocido orientan una ruta de acompañamiento.",
    knownProfile: {
      affiliation: "AFFILIATE",
      dreamGoal: "PREPARE",
      horizon: "12_PLUS",
      savings: "NONE",
    },
    requiredFields: ["affiliation", "mainConcern", "incomeRange", "obligations", "subsidyInterest", "visitIntent"],
  },
} satisfies Record<Scenario["id"], Scenario>;

export type ScenarioId = keyof typeof scenarios;

export function getScenario(id: string): Scenario | undefined {
  return scenarios[id as ScenarioId];
}

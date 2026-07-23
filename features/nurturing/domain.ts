import type {
  EvaluationResult,
  ProfileAnswers,
  Scenario,
} from "../conversation/domain";
import { evaluateProfile } from "../conversation/engine";
import type { QualifiedLead } from "../conversation/qualified-leads";
import { isNurturingLead } from "../conversation/qualified-leads";

export type NurturingBarrier =
  | "INCOME"
  | "DOWN_PAYMENT"
  | "SUBSIDY"
  | "DOCUMENTATION"
  | "HORIZON";

export type NurturingActivityType =
  | "MILESTONE_COMPLETED"
  | "MILESTONE_REOPENED"
  | "NOTE_ADDED"
  | "REEVALUATION_SIMULATED"
  | "JOURNEY_PAUSED"
  | "JOURNEY_RESUMED"
  | "REEVALUATION_REQUESTED"
  | "CASE_ESCALATED";

export type NurturingJourneyStatus =
  | "ACTIVE"
  | "PAUSED"
  | "REEVALUATION_PENDING"
  | "NEEDS_ATTENTION";

export type NurturingActivity = {
  id: string;
  type: NurturingActivityType;
  description: string;
  occurredAt: string;
};

export type NurturingState = {
  leadId: string;
  completedMilestones: string[];
  notes: string[];
  simulations: number;
  activities: NurturingActivity[];
  journeyStatus: NurturingJourneyStatus;
  interventionRequired: boolean;
  requestedReevaluationAt?: string;
  updatedAt: string;
};

export type NurturingPlan = {
  lead: QualifiedLead;
  barrier: NurturingBarrier;
  barrierLabel: string;
  barrierDescription: string;
  objective: string;
  route: string;
  suggestedResources: string[];
  milestones: string[];
  reevaluationAt: string | null;
  progress: number;
  missingData: string[];
  statusLabel: string;
  nextAutomaticAction: string;
  lastInteractionAt: string;
  interventionRequired: boolean;
  state: NurturingState;
};

export const barrierLabels: Record<NurturingBarrier, string> = {
  INCOME: "Ingresos por completar",
  DOWN_PAYMENT: "Cuota inicial",
  SUBSIDY: "Subsidio por validar",
  DOCUMENTATION: "Información pendiente",
  HORIZON: "Plazo de compra",
};

export function createNurturingState(
  leadId: string,
  timestamp: string,
): NurturingState {
  return {
    leadId,
    completedMilestones: [],
    notes: [],
    simulations: 0,
    activities: [],
    journeyStatus: "ACTIVE",
    interventionRequired: false,
    updatedAt: timestamp,
  };
}

export function buildNurturingPlans(
  leads: QualifiedLead[],
  states: Record<string, NurturingState>,
): NurturingPlan[] {
  return leads
    .filter(({ evaluation }) => isNurturingLead(evaluation))
    .map((lead) => {
      const barrier = classifyBarrier(lead.evaluation);
      const initialState = createNurturingState(
        lead.scenario.leadId,
        lead.scenario.capturedAt,
      );
      const state = states[lead.scenario.leadId]
        ? { ...initialState, ...states[lead.scenario.leadId] }
        : initialState;
      const configuration = getBarrierConfiguration(barrier);
      const completedMilestones = configuration.milestones.filter((milestone) =>
        state.completedMilestones.includes(milestone),
      ).length;
      const progress = Math.round(
        (completedMilestones / configuration.milestones.length) * 100,
      );
      const missingData = getMissingData(lead.evaluation.profileSnapshot);
      const interventionRequired =
        state.interventionRequired || missingData.length >= 3;

      return {
        lead,
        barrier,
        barrierLabel: barrierLabels[barrier],
        barrierDescription:
          lead.evaluation.blockers[0] ?? configuration.description,
        objective: lead.evaluation.advanceCondition,
        route: configuration.route,
        suggestedResources: configuration.resources,
        milestones: configuration.milestones,
        reevaluationAt: lead.evaluation.followUpAt,
        progress,
        missingData,
        statusLabel: getJourneyStatusLabel(state.journeyStatus),
        nextAutomaticAction: getNextAutomaticAction(
          state,
          configuration.resources,
          progress,
          missingData,
        ),
        lastInteractionAt:
          state.activities[0]?.occurredAt ?? lead.scenario.capturedAt,
        interventionRequired,
        state,
      };
    })
    .sort(
      (a, b) =>
        dateValue(a.reevaluationAt) - dateValue(b.reevaluationAt) ||
        b.progress - a.progress,
    );
}

export function updateNurturingState(
  state: NurturingState,
  input: {
    type: NurturingActivityType;
    description: string;
    timestamp: string;
    milestone?: string;
    note?: string;
    journeyStatus?: NurturingJourneyStatus;
    interventionRequired?: boolean;
    requestedReevaluationAt?: string;
  },
): NurturingState {
  const milestoneCompleted =
    input.type === "MILESTONE_COMPLETED" && input.milestone;
  const milestoneReopened =
    input.type === "MILESTONE_REOPENED" && input.milestone;

  return {
    ...state,
    completedMilestones: milestoneCompleted
      ? [...new Set([...state.completedMilestones, input.milestone!])]
      : milestoneReopened
        ? state.completedMilestones.filter((item) => item !== input.milestone)
        : state.completedMilestones,
    notes: input.note ? [input.note, ...state.notes] : state.notes,
    simulations:
      input.type === "REEVALUATION_SIMULATED"
        ? state.simulations + 1
        : state.simulations,
    journeyStatus: input.journeyStatus ?? state.journeyStatus,
    interventionRequired:
      input.interventionRequired ?? state.interventionRequired,
    ...(input.requestedReevaluationAt
      ? { requestedReevaluationAt: input.requestedReevaluationAt }
      : {}),
    activities: [
      {
        id: `${state.leadId}-${input.timestamp}-${state.activities.length + 1}`,
        type: input.type,
        description: input.description,
        occurredAt: input.timestamp,
      },
      ...state.activities,
    ],
    updatedAt: input.timestamp,
  };
}

export function simulateReevaluation(plan: NurturingPlan): EvaluationResult {
  const scenario: Scenario = {
    ...plan.lead.scenario,
    knownProfile: plan.lead.evaluation.profileSnapshot,
    requiredFields: [],
  };
  return evaluateProfile(
    scenario,
    "USE_KNOWN_DATA",
    buildImprovementPatch(plan.barrier),
  );
}

function classifyBarrier(evaluation: EvaluationResult): NurturingBarrier {
  const profile = evaluation.profileSnapshot;
  if (!profile.incomeRange || profile.incomeRange === "UNKNOWN") return "INCOME";
  if (profile.savings === "NONE") return "DOWN_PAYMENT";
  if (
    evaluation.route === "NURTURE_BENEFITS" ||
    evaluation.benefitSignals.potential.length
  ) {
    return "SUBSIDY";
  }
  if (profile.horizon === "12_PLUS") return "HORIZON";
  return "DOCUMENTATION";
}

function getBarrierConfiguration(barrier: NurturingBarrier) {
  const configurations = {
    INCOME: {
      description: "Falta una referencia confiable de ingresos del hogar.",
      route: "Orientación financiera y actualización de información",
      resources: [
        "Guía para organizar ingresos y gastos del hogar",
        "Orientación financiera de PerteneSer",
      ],
      milestones: [
        "Registrar el rango de ingresos del hogar",
        "Identificar las obligaciones mensuales",
        "Estimar un margen responsable para vivienda",
      ],
    },
    DOWN_PAYMENT: {
      description: "La cuota inicial todavía necesita una meta alcanzable.",
      route: "Plan de ahorro y acompañamiento PerteneSer",
      resources: [
        "Plan práctico para construir la cuota inicial",
        "Orientación financiera de PerteneSer",
        "Revisión de subsidios que podrían complementar el ahorro",
      ],
      milestones: [
        "Definir una meta mensual de ahorro",
        "Completar el primer periodo de ahorro",
        "Revisar beneficios que podrían complementar la cuota inicial",
      ],
    },
    SUBSIDY: {
      description: "Es necesario validar requisitos y beneficios disponibles.",
      route: "Gestión de subsidios y beneficios",
      resources: [
        "Guía de requisitos para subsidio de vivienda",
        "Lista de documentos para validación",
        "Acompañamiento para revisar beneficios aplicables",
      ],
      milestones: [
        "Revisar requisitos del subsidio",
        "Reunir los documentos necesarios",
        "Registrar el resultado de la validación",
      ],
    },
    DOCUMENTATION: {
      description: "Faltan datos indispensables para recalcular su preparación.",
      route: "Actualización guiada de información",
      resources: [
        "Lista de información necesaria para una nueva evaluación",
        "Guía para preparar soportes financieros",
      ],
      milestones: [
        "Confirmar ingresos y obligaciones",
        "Actualizar ahorro y composición del hogar",
        "Completar la información pendiente",
      ],
    },
    HORIZON: {
      description: "La compra se encuentra en un horizonte de largo plazo.",
      route: "Preparación gradual y seguimiento trimestral",
      resources: [
        "Ruta para prepararse antes de comprar",
        "Contenido sobre ahorro y capacidad de compra",
        "Recordatorio de reevaluación trimestral",
      ],
      milestones: [
        "Definir una fecha objetivo de compra",
        "Mantener una meta de ahorro activa",
        "Acercarse a un horizonte menor de doce meses",
      ],
    },
  } satisfies Record<
    NurturingBarrier,
    {
      description: string;
      route: string;
      resources: string[];
      milestones: string[];
    }
  >;

  return configurations[barrier];
}

function getMissingData(profile: ProfileAnswers): string[] {
  const labels: Record<string, string> = {
    incomeRange: "Ingresos",
    obligations: "Obligaciones",
    savings: "Ahorro",
    horizon: "Plazo de compra",
    location: "Ubicación",
  };
  return Object.entries(labels)
    .filter(([field]) => {
      const value = profile[field as keyof ProfileAnswers];
      return !value || value === "UNKNOWN" || value === "UNSURE";
    })
    .map(([, label]) => label);
}

function buildImprovementPatch(barrier: NurturingBarrier): ProfileAnswers {
  const patches: Record<NurturingBarrier, ProfileAnswers> = {
    INCOME: { incomeRange: "MID", obligations: "LOW" },
    DOWN_PAYMENT: { savings: "READY", horizon: "6_12" },
    SUBSIDY: { subsidyInterest: "HAS" },
    DOCUMENTATION: {
      incomeRange: "MID",
      obligations: "LOW",
      savings: "PARTIAL",
    },
    HORIZON: { horizon: "6_12", savings: "PARTIAL" },
  };
  return patches[barrier];
}

function dateValue(value: string | null): number {
  return value ? new Date(value).getTime() : Number.MAX_SAFE_INTEGER;
}

function getJourneyStatusLabel(status: NurturingJourneyStatus): string {
  return {
    ACTIVE: "Ruta automática activa",
    PAUSED: "Ruta pausada",
    REEVALUATION_PENDING: "Reevaluación solicitada",
    NEEDS_ATTENTION: "Intervención requerida",
  }[status];
}

function getNextAutomaticAction(
  state: NurturingState,
  resources: string[],
  progress: number,
  missingData: string[],
): string {
  if (state.journeyStatus === "PAUSED") {
    return "Esperar autorización para reanudar la ruta";
  }
  if (state.journeyStatus === "NEEDS_ATTENTION") {
    return "Esperar revisión del equipo de acompañamiento";
  }
  if (state.journeyStatus === "REEVALUATION_PENDING") {
    return "Ejecutar una nueva evaluación cuando el backend confirme la solicitud";
  }
  if (missingData.length) {
    return `Solicitar automáticamente: ${missingData[0]}`;
  }
  if (progress >= 80) {
    return "Programar reevaluación automática";
  }
  return `Enviar: ${resources[state.completedMilestones.length % resources.length]}`;
}

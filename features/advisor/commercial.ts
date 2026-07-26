import { getHousingProject } from "../../lib/housing-catalog";
import type { CommercialWorkflow } from "../../lib/api/leads";
import type { QualifiedLead } from "../conversation/qualified-leads";
import { isCommercialOpportunity } from "../conversation/qualified-leads";

export const COMMERCIAL_STATUS = [
  "NEW",
  "ASSIGNED",
  "CONTACTING",
  "FOLLOW_UP",
  "VISIT",
  "SIMULATION",
  "DOCUMENTATION",
  "WON",
  "DEFERRED",
  "NOT_VIABLE",
] as const;

export type CommercialStatus = (typeof COMMERCIAL_STATUS)[number];
export type CommercialActivityType =
  | "OPPORTUNITY_ACCEPTED"
  | "STATUS_CHANGED"
  | "CONTACT_RECORDED"
  | "NOTE_ADDED"
  | "FOLLOW_UP_SCHEDULED"
  | "VALIDATION_CHANGED";

export type CommercialActivity = {
  id: string;
  type: CommercialActivityType;
  description: string;
  occurredAt: string;
};

export type CommercialOpportunityState = {
  leadId: string;
  status: CommercialStatus;
  assignedTo?: string;
  firstContactAt?: string;
  lastContactAt?: string;
  followUpAt?: string;
  subsidyValidationRequired: boolean;
  financingValidationRequired: boolean;
  activities: CommercialActivity[];
  backendState?: NonNullable<QualifiedLead["backendWorkflow"]>["state"];
  backendWorkflowVersion?: number;
  updatedAt: string;
};

export type CommercialOpportunity = {
  lead: QualifiedLead;
  state: CommercialOpportunityState;
  campaignProject: string;
  recommendedProject: string;
  location: string;
  horizon: string;
  capacity: number;
  detectedBenefits: string[];
  ageInMinutes: number;
};

export type CommercialMetrics = {
  total: number;
  newCount: number;
  unassigned: number;
  pendingFirstContact: number;
  overdueFollowUps: number;
  contactedToday: number;
  averageFirstContactMinutes: number | null;
  byPriority: Record<"HIGH" | "MEDIUM" | "LOW", number>;
};

const priorityRank = { HIGH: 3, MEDIUM: 2, LOW: 1 } as const;
const horizonRank: Record<string, number> = {
  "0_3": 4,
  "3_6": 3,
  "6_12": 2,
  "12_PLUS": 1,
};

export const commercialStatusLabels: Record<CommercialStatus, string> = {
  NEW: "Nueva",
  ASSIGNED: "Asignada",
  CONTACTING: "Contactando",
  FOLLOW_UP: "En seguimiento",
  VISIT: "Visita",
  SIMULATION: "Simulación",
  DOCUMENTATION: "Documentación",
  WON: "Ganada",
  DEFERRED: "Aplazada",
  NOT_VIABLE: "No viable",
};

export function createCommercialState(
  leadId: string,
  timestamp: string,
): CommercialOpportunityState {
  return {
    leadId,
    status: "NEW",
    subsidyValidationRequired: false,
    financingValidationRequired: false,
    activities: [],
    updatedAt: timestamp,
  };
}

export function createCommercialStateForLead(
  lead: QualifiedLead,
): CommercialOpportunityState {
  const workflow = lead.backendWorkflow;
  if (!workflow) {
    return createCommercialState(
      lead.scenario.leadId,
      lead.scenario.capturedAt,
    );
  }
  const contacted = !["PENDING", "ASSIGNED"].includes(workflow.state);
  return {
    leadId: lead.scenario.leadId,
    status: backendStatusMap[workflow.state],
    ...(workflow.assignedAdvisorId
      ? { assignedTo: workflow.assignedAdvisorId }
      : {}),
    ...(contacted
      ? {
          firstContactAt: workflow.updatedAt,
          lastContactAt: workflow.updatedAt,
        }
      : {}),
    ...(workflow.nextFollowUpAt
      ? { followUpAt: workflow.nextFollowUpAt }
      : {}),
    subsidyValidationRequired: false,
    financingValidationRequired: false,
    activities: [],
    backendState: workflow.state,
    backendWorkflowVersion: workflow.version,
    updatedAt: workflow.updatedAt,
  };
}

export function applyBackendWorkflow(
  state: CommercialOpportunityState,
  workflow: CommercialWorkflow,
): CommercialOpportunityState {
  const contacted = !["PENDING", "ASSIGNED"].includes(workflow.state);
  const updatedAt = workflow.updated_at ?? state.updatedAt;
  return {
    ...state,
    status: backendStatusMap[workflow.state],
    ...(workflow.assigned_advisor_id
      ? { assignedTo: workflow.assigned_advisor_id }
      : {}),
    ...(contacted && !state.firstContactAt
      ? { firstContactAt: updatedAt }
      : {}),
    ...(contacted ? { lastContactAt: updatedAt } : {}),
    ...(workflow.next_follow_up_at
      ? { followUpAt: workflow.next_follow_up_at }
      : {}),
    backendState: workflow.state,
    backendWorkflowVersion: workflow.workflow_version,
    updatedAt,
  };
}

export function projectCommercialOpportunities(
  leads: QualifiedLead[],
  states: Record<string, CommercialOpportunityState>,
  now: Date,
): CommercialOpportunity[] {
  return leads
    .filter(({ evaluation }) => isCommercialOpportunity(evaluation))
    .map((lead) => {
      const { scenario, evaluation } = lead;
      const campaignProject = scenario.campaignProjectId
        ? getHousingProject(scenario.campaignProjectId)?.name
        : undefined;
      const recommendedProject = evaluation.projectMatches[0]
        ? getHousingProject(evaluation.projectMatches[0].projectId)?.name
        : undefined;
      const baseline = createCommercialStateForLead(lead);
      const stored = states[scenario.leadId];
      const state = stored ? { ...baseline, ...stored } : baseline;

      return {
        lead,
        state,
        campaignProject: campaignProject ?? "Campaña general",
        recommendedProject: recommendedProject ?? "Proyecto por confirmar",
        location: getLocationLabel(evaluation.profileSnapshot.location),
        horizon: getHorizonLabel(evaluation.profileSnapshot.horizon),
        capacity: evaluation.capacity.estimatedHousingPayment,
        detectedBenefits: [
          ...evaluation.benefitSignals.confirmed,
          ...evaluation.benefitSignals.potential,
        ],
        ageInMinutes: Math.max(
          0,
          Math.floor(
            (now.getTime() - new Date(scenario.capturedAt).getTime()) / 60_000,
          ),
        ),
      };
    })
    .sort(compareOpportunities);
}

const backendStatusMap: Record<
  NonNullable<QualifiedLead["backendWorkflow"]>["state"],
  CommercialStatus
> = {
  PENDING: "NEW",
  ASSIGNED: "ASSIGNED",
  IN_PROGRESS: "CONTACTING",
  FOLLOW_UP: "FOLLOW_UP",
  APPOINTMENT_SCHEDULED: "VISIT",
  CLOSED_WON: "WON",
  CLOSED_LOST: "NOT_VIABLE",
  OPTED_OUT: "NOT_VIABLE",
};

export function compareOpportunities(
  a: CommercialOpportunity,
  b: CommercialOpportunity,
): number {
  return (
    priorityRank[b.lead.evaluation.priority] -
      priorityRank[a.lead.evaluation.priority] ||
    b.lead.evaluation.readinessScore - a.lead.evaluation.readinessScore ||
    (horizonRank[b.lead.evaluation.profileSnapshot.horizon ?? ""] ?? 0) -
      (horizonRank[a.lead.evaluation.profileSnapshot.horizon ?? ""] ?? 0) ||
    b.capacity - a.capacity ||
    b.ageInMinutes - a.ageInMinutes
  );
}

export function calculateCommercialMetrics(
  opportunities: CommercialOpportunity[],
  now: Date,
): CommercialMetrics {
  const today = toLocalDateKey(now);
  const firstContactTimes = opportunities.flatMap(({ lead, state }) =>
    state.firstContactAt
      ? [
          Math.max(
            0,
            Math.floor(
              (new Date(state.firstContactAt).getTime() -
                new Date(lead.scenario.capturedAt).getTime()) /
                60_000,
            ),
          ),
        ]
      : [],
  );

  return {
    total: opportunities.length,
    newCount: opportunities.filter(({ state }) => state.status === "NEW").length,
    unassigned: opportunities.filter(({ state }) => !state.assignedTo).length,
    pendingFirstContact: opportunities.filter(({ state }) => !state.firstContactAt)
      .length,
    overdueFollowUps: opportunities.filter(
      ({ state }) =>
        state.followUpAt && new Date(state.followUpAt).getTime() < now.getTime(),
    ).length,
    contactedToday: opportunities.filter(
      ({ state }) =>
        state.lastContactAt && toLocalDateKey(new Date(state.lastContactAt)) === today,
    ).length,
    averageFirstContactMinutes: firstContactTimes.length
      ? Math.round(
          firstContactTimes.reduce((sum, minutes) => sum + minutes, 0) /
            firstContactTimes.length,
        )
      : null,
    byPriority: {
      HIGH: opportunities.filter(
        ({ lead }) => lead.evaluation.priority === "HIGH",
      ).length,
      MEDIUM: opportunities.filter(
        ({ lead }) => lead.evaluation.priority === "MEDIUM",
      ).length,
      LOW: opportunities.filter(
        ({ lead }) => lead.evaluation.priority === "LOW",
      ).length,
    },
  };
}

export function appendCommercialActivity(
  state: CommercialOpportunityState,
  input: {
    type: CommercialActivityType;
    description: string;
    timestamp: string;
    status?: CommercialStatus;
    assignedTo?: string;
    firstContact?: boolean;
    followUpAt?: string;
    subsidyValidationRequired?: boolean;
    financingValidationRequired?: boolean;
  },
): CommercialOpportunityState {
  return {
    ...state,
    ...(input.status ? { status: input.status } : {}),
    ...(input.assignedTo ? { assignedTo: input.assignedTo } : {}),
    ...(input.firstContact
      ? {
          firstContactAt: state.firstContactAt ?? input.timestamp,
          lastContactAt: input.timestamp,
        }
      : {}),
    ...(input.followUpAt ? { followUpAt: input.followUpAt } : {}),
    ...(typeof input.subsidyValidationRequired === "boolean"
      ? { subsidyValidationRequired: input.subsidyValidationRequired }
      : {}),
    ...(typeof input.financingValidationRequired === "boolean"
      ? { financingValidationRequired: input.financingValidationRequired }
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

function getLocationLabel(value?: string): string {
  if (value === "SOACHA") return "Soacha";
  if (value === "BOGOTA") return "Bogotá";
  return "Ubicación por confirmar";
}

function getHorizonLabel(value?: string): string {
  return (
    {
      "0_3": "0–3 meses",
      "3_6": "3–6 meses",
      "6_12": "6–12 meses",
      "12_PLUS": "Más de 12 meses",
    }[value ?? ""] ?? "Horizonte por confirmar"
  );
}

function toLocalDateKey(date: Date): string {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

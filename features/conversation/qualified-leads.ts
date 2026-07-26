import type { EvaluationResult, Scenario } from "./domain";
import { evaluateProfile } from "./engine";
import { getScenarioAnswers, scenarios } from "./scenarios";

export type QualifiedLead = {
  scenario: Scenario;
  evaluation: EvaluationResult;
  source?: "BACKEND" | "LOCAL";
  backendNurture?: {
    status: "ACTIVE" | "PAUSED" | "REEVALUATION_PENDING" | "NEEDS_ATTENTION";
    primaryGap: string | null;
    targetAmount: number | null;
    interventionRequired: boolean;
    milestones: Array<{
      id: string;
      label: string;
      completed: boolean;
      completedAt: string | null;
    }>;
  };
  backendWorkflow?: {
    state:
      | "PENDING"
      | "ASSIGNED"
      | "IN_PROGRESS"
      | "FOLLOW_UP"
      | "APPOINTMENT_SCHEDULED"
      | "CLOSED_WON"
      | "CLOSED_LOST"
      | "OPTED_OUT";
    version: number;
    assignedAdvisorId: string | null;
    nextAction: string | null;
    nextFollowUpAt: string | null;
    slaDueAt: string | null;
    updatedAt: string;
  };
};

export function getQualifiedScenarioLeads(): QualifiedLead[] {
  return Object.values(scenarios).map((scenario) => {
    const answers = getScenarioAnswers(scenario.id);
    if (!answers) throw new Error(`Missing canonical answers for scenario: ${scenario.id}`);

    return {
      scenario,
      evaluation: evaluateProfile(scenario, "USE_KNOWN_DATA", answers),
      source: "LOCAL" as const,
    };
  });
}

export function mergeQualifiedLeads(
  remote: QualifiedLead[],
  local: QualifiedLead[],
): QualifiedLead[] {
  const remoteIds = new Set(remote.map(({ scenario }) => scenario.leadId));
  return [
    ...remote,
    ...local.filter(({ scenario }) => !remoteIds.has(scenario.leadId)),
  ];
}

export function getQualifiedScenarioLead(leadId: string): QualifiedLead | undefined {
  return getQualifiedScenarioLeads().find(({ scenario }) => scenario.leadId === leadId);
}

export function isCommercialOpportunity(result: EvaluationResult): boolean {
  return result.route === "ADVISOR_NOW" || result.route === "NON_AFFILIATE_PRIORITY";
}

export function isNurturingLead(result: EvaluationResult): boolean {
  return ["NURTURE_FINANCIAL", "NURTURE_BENEFITS", "NURTURE_LONG_TERM", "NEEDS_DATA"].includes(result.route);
}

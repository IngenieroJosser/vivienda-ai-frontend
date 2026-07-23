import {
  commercialStatusLabels,
  projectCommercialOpportunities,
  type CommercialOpportunityState,
} from "./commercial";
import type { QualifiedLead } from "../conversation/qualified-leads";

export type AgendaItem = {
  id: string;
  leadId: string;
  prospectName: string;
  type: "FIRST_CONTACT" | "FOLLOW_UP";
  title: string;
  dueAt: string;
  timing: "OVERDUE" | "TODAY" | "UPCOMING";
  priority: "HIGH" | "MEDIUM" | "LOW";
  commercialStatus: string;
  nextAction: string;
};

export function buildAgendaItems(
  leads: QualifiedLead[],
  states: Record<string, CommercialOpportunityState>,
  now: Date,
): AgendaItem[] {
  return projectCommercialOpportunities(leads, states, now)
    .filter(({ state }) => !["WON", "DEFERRED", "NOT_VIABLE"].includes(state.status))
    .map(({ lead, state }) => {
      const followUp = state.followUpAt;
      const dueAt =
        followUp ??
        lead.evaluation.followUpAt ??
        lead.scenario.capturedAt;
      const type: AgendaItem["type"] = followUp
        ? "FOLLOW_UP"
        : "FIRST_CONTACT";
      return {
        id: `${lead.scenario.leadId}-${type}`,
        leadId: lead.scenario.leadId,
        prospectName: lead.scenario.displayName,
        type,
        title:
          type === "FOLLOW_UP"
            ? "Seguimiento programado"
            : "Primer contacto pendiente",
        dueAt,
        timing: getTiming(dueAt, now),
        priority: lead.evaluation.priority,
        commercialStatus: commercialStatusLabels[state.status],
        nextAction:
          type === "FOLLOW_UP"
            ? lead.evaluation.nextAction
            : "Tomar la oportunidad y registrar el primer contacto",
      };
    })
    .sort(
      (a, b) =>
        timingRank(a.timing) - timingRank(b.timing) ||
        new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime(),
    );
}

function getTiming(value: string, now: Date): AgendaItem["timing"] {
  const due = new Date(value);
  if (sameLocalDate(due, now)) return "TODAY";
  return due.getTime() < now.getTime() ? "OVERDUE" : "UPCOMING";
}

function sameLocalDate(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function timingRank(value: AgendaItem["timing"]): number {
  return value === "OVERDUE" ? 0 : value === "TODAY" ? 1 : 2;
}

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
  type: "FIRST_CONTACT" | "FOLLOW_UP" | "NEXT_ACTION";
  title: string;
  dueAt?: string;
  timing: "OVERDUE" | "TODAY" | "TOMORROW" | "NEXT_7_DAYS" | "LATER" | "NO_DATE";
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
    .filter(
      ({ state }) =>
        !["CLOSED_WON", "CLOSED_LOST", "OPTED_OUT"].includes(state.status),
    )
    .map(({ lead, state }) => {
      const followUp = state.followUpAt;
      const type: AgendaItem["type"] = followUp
        ? "FOLLOW_UP"
        : state.firstContactAt
          ? "NEXT_ACTION"
          : "FIRST_CONTACT";
      const dueAt =
        type === "NEXT_ACTION"
          ? undefined
          : followUp ??
            lead.evaluation.followUpAt ??
            lead.scenario.capturedAt;
      return {
        id: `${lead.scenario.leadId}-${type}`,
        leadId: lead.scenario.leadId,
        prospectName: lead.scenario.displayName,
        type,
        title:
          type === "FOLLOW_UP"
            ? "Seguimiento programado"
            : type === "NEXT_ACTION"
              ? "Siguiente acción sin fecha"
              : "Primer contacto pendiente",
        dueAt,
        timing: dueAt ? getTiming(dueAt, now) : "NO_DATE",
        priority: lead.evaluation.priority,
        commercialStatus: commercialStatusLabels[state.status],
        nextAction:
          type === "FOLLOW_UP"
            ? lead.evaluation.nextAction
            : type === "NEXT_ACTION"
              ? "Definir el resultado y programar el siguiente paso"
              : "Tomar la oportunidad y registrar el primer contacto",
      };
    })
    .sort(
      (a, b) =>
        timingRank(a.timing) - timingRank(b.timing) ||
        dateRank(a.dueAt) - dateRank(b.dueAt),
    );
}

function getTiming(value: string, now: Date): AgendaItem["timing"] {
  const due = new Date(value);
  if (sameLocalDate(due, now)) return "TODAY";
  if (due.getTime() < now.getTime()) return "OVERDUE";
  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);
  if (sameLocalDate(due, tomorrow)) return "TOMORROW";
  const sevenDays = new Date(now);
  sevenDays.setDate(now.getDate() + 7);
  return due.getTime() <= sevenDays.getTime() ? "NEXT_7_DAYS" : "LATER";
}

function sameLocalDate(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function timingRank(value: AgendaItem["timing"]): number {
  return {
    OVERDUE: 0,
    TODAY: 1,
    TOMORROW: 2,
    NEXT_7_DAYS: 3,
    LATER: 4,
    NO_DATE: 5,
  }[value];
}

function dateRank(value?: string): number {
  return value ? new Date(value).getTime() : Number.MAX_SAFE_INTEGER;
}

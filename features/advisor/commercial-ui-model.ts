import type {
  CommercialActivity,
  LeadListItem,
} from "../../lib/api/leads";

type ActivityType = CommercialActivity["activity_type"];

export const ACTIVITY_TYPE_LABELS = {
  CONTACT_ATTEMPT: "Intento de contacto",
  CONTACT_SUCCESS: "Contacto exitoso",
  FOLLOW_UP_SCHEDULED: "Seguimiento programado",
  APPOINTMENT_SCHEDULED: "Cita agendada",
  CLOSED_WON: "Cierre exitoso",
  CLOSED_LOST: "Cierre sin conversión",
  OPTED_OUT: "Solicitud de no contacto",
} satisfies Record<ActivityType, string>;

export type ActivityAttemptInput = {
  activityType: string;
  channel: string;
  result: string;
  note: string;
  workflowVersion: number;
};

export type ActivityAttempt = {
  fingerprint: string;
  key: string;
  managedAt: string;
};

export function resolveActivityAttempt(
  previous: ActivityAttempt | null,
  input: ActivityAttemptInput,
  createKey: () => string,
  createManagedAt: () => string = () => new Date().toISOString(),
): ActivityAttempt {
  const fingerprint = JSON.stringify([
    input.activityType,
    input.channel,
    input.result,
    input.note,
    input.workflowVersion,
  ]);
  if (previous?.fingerprint === fingerprint) return previous;
  return {
    fingerprint,
    key: createKey(),
    managedAt: createManagedAt(),
  };
}

export function resolveSelectedLead(
  items: LeadListItem[],
  selectedLeadId: string | null,
): LeadListItem | undefined {
  return (
    items.find(({ id }) => id === selectedLeadId) ??
    items[0]
  );
}

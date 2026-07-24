import { mapBackendEvaluation, syncProspectSession } from "@/lib/backend-api";
import type { ProspectSession } from "./domain";

const syncState = new Map<string, number>();

export async function persistProspectSessionInBackend(
  session: ProspectSession,
): Promise<ProspectSession> {
  const response = await syncProspectSession(session);
  if (!session.evaluation) return session;
  return {
    ...session,
    evaluation: {
      ...mapBackendEvaluation(response.evaluation, session.evaluation),
      leadId: `lead-${response.lead_id}`,
    },
  };
}

export function queueProspectBackendSync(
  session: ProspectSession,
  onSynced?: (updated: ProspectSession) => void,
): void {
  if (typeof window === "undefined") return;
  const version = (syncState.get(session.id) ?? 0) + 1;
  syncState.set(session.id, version);
  window.setTimeout(async () => {
    try {
      const updated = await persistProspectSessionInBackend(session);
      if (syncState.get(session.id) !== version) return;
      onSynced?.(updated);
      window.dispatchEvent(new CustomEvent("vivienda-match:backend-synced", {
        detail: { sessionId: session.id, leadId: updated.evaluation?.leadId },
      }));
    } catch (error) {
      console.warn("No fue posible sincronizar la sesión con el backend.", error);
      window.dispatchEvent(new CustomEvent("vivienda-match:backend-sync-error", {
        detail: { sessionId: session.id },
      }));
    }
  }, 0);
}

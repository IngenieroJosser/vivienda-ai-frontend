import type { CommercialOpportunityState } from "./commercial";

export type CommercialWorkflowAction =
  | "TAKE"
  | "CONTACT"
  | "RESULT"
  | "SCHEDULE"
  | "FOLLOW_UP"
  | "COMPLETE";

export type CommercialWorkflow = {
  action: CommercialWorkflowAction;
  title: string;
  description: string;
  ctaLabel: string;
  completedSteps: number;
};

const terminalStatuses = new Set(["WON", "DEFERRED", "NOT_VIABLE"]);

export function getCommercialWorkflow(
  state: CommercialOpportunityState | undefined,
): CommercialWorkflow {
  if (!state?.assignedTo) {
    return {
      action: "TAKE",
      title: "Toma la oportunidad",
      description:
        "Así quedará bajo tu responsabilidad y podrás registrar el primer contacto.",
      ctaLabel: "Tomar esta oportunidad",
      completedSteps: 0,
    };
  }
  if (!state.firstContactAt) {
    return {
      action: "CONTACT",
      title: "Realiza el primer contacto",
      description:
        "Cuando termines la conversación, confirma el contacto para continuar.",
      ctaLabel: "Registrar primer contacto",
      completedSteps: 1,
    };
  }
  if (state.status === "CONTACTING" || state.status === "ASSIGNED") {
    return {
      action: "RESULT",
      title: "Registra cómo resultó el contacto",
      description:
        "El resultado define si corresponde seguimiento, visita, simulación o documentación.",
      ctaLabel: "Registrar resultado",
      completedSteps: 2,
    };
  }
  if (terminalStatuses.has(state.status)) {
    return {
      action: "COMPLETE",
      title: "Gestión comercial completada",
      description:
        "Consulta el historial si necesitas revisar las decisiones registradas.",
      ctaLabel: "Ver historial",
      completedSteps: 4,
    };
  }
  if (state.followUpAt) {
    return {
      action: "FOLLOW_UP",
      title: "Cumple el seguimiento programado",
      description: `Actividad programada para ${formatDate(state.followUpAt)}.`,
      ctaLabel: "Abrir en agenda",
      completedSteps: 4,
    };
  }
  return {
    action: "SCHEDULE",
    title: "Programa la siguiente actividad",
    description:
      "Define una fecha concreta para que la oportunidad no pierda continuidad.",
    ctaLabel: "Programar seguimiento",
    completedSteps: 3,
  };
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("es-CO", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

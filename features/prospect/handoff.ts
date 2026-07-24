import type { ProspectSession } from "./domain";

export type ContactChannel = "WHATSAPP" | "PHONE" | "EMAIL";

export type ContactTimePreference =
  | "WEEKDAY_MORNING"
  | "WEEKDAY_AFTERNOON"
  | "SATURDAY"
  | "ANY";

export type ContactRequestStatus = "SUBMITTED" | "IN_REVIEW";

export type ProspectContactRequest = {
  version: 1;
  id: string;
  sessionId: string;
  leadId: string;
  channel: ContactChannel;
  timePreference: ContactTimePreference;
  status: ContactRequestStatus;
  projectIds: string[];
  contactAuthorizationAcceptedAt: string;
  informationAuthorizationAcceptedAt: string;
  createdAt: string;
  updatedAt: string;
};

export type ContactRequestInput = {
  channel: ContactChannel;
  timePreference: ContactTimePreference;
  authorizesContact: boolean;
  authorizesInformationSharing: boolean;
};

export type ContactRequestValidation = Partial<
  Record<"channel" | "timePreference" | "authorizations", string>
>;

export const contactChannelLabels: Record<ContactChannel, string> = {
  WHATSAPP: "WhatsApp",
  PHONE: "Llamada",
  EMAIL: "Correo electrónico",
};

export const contactTimeLabels: Record<ContactTimePreference, string> = {
  WEEKDAY_MORNING: "Entre semana · 8 a. m. a 12 m.",
  WEEKDAY_AFTERNOON: "Entre semana · 12 m. a 6 p. m.",
  SATURDAY: "Sábado · 8 a. m. a 1 p. m.",
  ANY: "Cualquier horario",
};

export function isEligibleForContactRequest(session: ProspectSession): boolean {
  return Boolean(
    session.status === "COMPLETED" &&
      session.evaluation &&
      ["ADVISOR_NOW", "NON_AFFILIATE_PRIORITY"].includes(
        session.evaluation.route,
      ),
  );
}

export function validateContactRequest(
  input: ContactRequestInput,
): ContactRequestValidation {
  const errors: ContactRequestValidation = {};

  if (!input.channel) {
    errors.channel = "Elige cómo prefieres que te contacten.";
  }
  if (!input.timePreference) {
    errors.timePreference = "Elige una franja de contacto.";
  }
  if (!input.authorizesContact || !input.authorizesInformationSharing) {
    errors.authorizations =
      "Necesitamos ambas autorizaciones para enviar tu solicitud al equipo de vivienda.";
  }

  return errors;
}

export function createContactRequest(input: {
  session: ProspectSession;
  preferences: ContactRequestInput;
  timestamp: string;
  existing?: ProspectContactRequest;
}): ProspectContactRequest {
  if (!isEligibleForContactRequest(input.session)) {
    throw new Error("La sesión no está habilitada para contacto comercial.");
  }

  const errors = validateContactRequest(input.preferences);
  if (Object.keys(errors).length) {
    throw new Error("La solicitud de contacto está incompleta.");
  }

  const evaluation = input.session.evaluation;
  if (!evaluation) {
    throw new Error("La sesión no tiene una evaluación.");
  }

  return {
    version: 1,
    id: input.existing?.id ?? `contact-${input.session.id}`,
    sessionId: input.session.id,
    leadId: input.session.leadId ?? evaluation.leadId,
    channel: input.preferences.channel,
    timePreference: input.preferences.timePreference,
    status: input.existing?.status ?? "SUBMITTED",
    projectIds: evaluation.projectMatches.map(({ projectId }) => projectId),
    contactAuthorizationAcceptedAt:
      input.existing?.contactAuthorizationAcceptedAt ?? input.timestamp,
    informationAuthorizationAcceptedAt:
      input.existing?.informationAuthorizationAcceptedAt ?? input.timestamp,
    createdAt: input.existing?.createdAt ?? input.timestamp,
    updatedAt: input.timestamp,
  };
}

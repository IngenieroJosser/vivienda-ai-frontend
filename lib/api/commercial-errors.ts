import { ApiError } from "./client";

const COMMERCIAL_ERROR_MESSAGES: Record<string, string> = {
  LEAD_ALREADY_ASSIGNED:
    "Esta oportunidad ya fue tomada por otro asesor.",
  STALE_WORKFLOW_VERSION:
    "La oportunidad cambió. Recarga la información antes de continuar.",
  INVALID_WORKFLOW_TRANSITION:
    "Ese cambio no está permitido desde el estado actual.",
  TERMINAL_WORKFLOW_IMMUTABLE:
    "La oportunidad está cerrada y no puede modificarse.",
  ACTIVITY_IDEMPOTENCY_CONFLICT:
    "La actividad ya fue registrada o el reintento no coincide.",
  RESOURCE_FORBIDDEN:
    "No tienes permiso para operar esta oportunidad.",
};

const GENERIC_COMMERCIAL_ERROR =
  "No pudimos completar la acción. Intenta nuevamente.";

export function getCommercialErrorMessage(error: unknown): string {
  if (!(error instanceof ApiError)) {
    return GENERIC_COMMERCIAL_ERROR;
  }
  const code = getErrorCode(error.details);
  return code
    ? COMMERCIAL_ERROR_MESSAGES[code] ?? GENERIC_COMMERCIAL_ERROR
    : GENERIC_COMMERCIAL_ERROR;
}

function getErrorCode(details: unknown): string | null {
  if (!isRecord(details)) return null;
  const detail = details.detail;
  if (!isRecord(detail) || typeof detail.code !== "string") return null;
  return detail.code;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

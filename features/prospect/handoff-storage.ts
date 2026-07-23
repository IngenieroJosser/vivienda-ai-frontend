import type { ProspectContactRequest } from "./handoff";

const CONTACT_REQUESTS_KEY = "vivienda-match-ai:contact-requests:v1";

function readContactRequests(): ProspectContactRequest[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(CONTACT_REQUESTS_KEY);
    const parsed = raw ? (JSON.parse(raw) as unknown) : [];
    return Array.isArray(parsed)
      ? parsed.filter(
          (request): request is ProspectContactRequest =>
            typeof request === "object" &&
            request !== null &&
            "version" in request &&
            request.version === 1 &&
            "sessionId" in request &&
            typeof request.sessionId === "string",
        )
      : [];
  } catch {
    return [];
  }
}

export function getStoredContactRequests(): ProspectContactRequest[] {
  return readContactRequests();
}

export function loadContactRequest(
  sessionId: string,
): ProspectContactRequest | undefined {
  return readContactRequests().find(
    (request) => request.sessionId === sessionId,
  );
}

export function saveContactRequest(request: ProspectContactRequest): void {
  const requests = readContactRequests().filter(
    (stored) => stored.sessionId !== request.sessionId,
  );
  window.localStorage.setItem(
    CONTACT_REQUESTS_KEY,
    JSON.stringify([request, ...requests].slice(0, 24)),
  );
  window.dispatchEvent(
    new CustomEvent("vivienda-match:contact-request", { detail: request }),
  );
}

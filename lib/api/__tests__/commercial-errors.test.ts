import { describe, expect, it } from "vitest";
import { ApiError } from "../client";
import { getCommercialErrorMessage } from "../commercial-errors";

describe("commercial API error messages", () => {
  it.each([
    [
      "LEAD_ALREADY_ASSIGNED",
      "Esta oportunidad ya fue tomada por otro asesor.",
    ],
    [
      "STALE_WORKFLOW_VERSION",
      "La oportunidad cambió. Recarga la información antes de continuar.",
    ],
    [
      "INVALID_WORKFLOW_TRANSITION",
      "Ese cambio no está permitido desde el estado actual.",
    ],
    [
      "TERMINAL_WORKFLOW_IMMUTABLE",
      "La oportunidad está cerrada y no puede modificarse.",
    ],
    [
      "ACTIVITY_IDEMPOTENCY_CONFLICT",
      "La actividad ya fue registrada o el reintento no coincide.",
    ],
    [
      "RESOURCE_FORBIDDEN",
      "No tienes permiso para operar esta oportunidad.",
    ],
  ])("translates %s without exposing transport details", (code, message) => {
    const error = new ApiError("HTTP 409", 409, {
      detail: { code, context: { internal: "not-visible" } },
    });

    expect(getCommercialErrorMessage(error)).toBe(message);
  });

  it("uses a recoverable generic message for unknown failures", () => {
    expect(
      getCommercialErrorMessage(new Error("network internals")),
    ).toBe("No pudimos completar la acción. Intenta nuevamente.");
  });
});

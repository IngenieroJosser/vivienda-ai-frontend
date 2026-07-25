import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it, vi } from "vitest";
import type { LeadListItem } from "../../../lib/api/leads";
import {
  ACTIVITY_TYPE_LABELS,
  resolveActivityAttempt,
  resolveSelectedLead,
} from "../commercial-ui-model";

const detailSource = readFileSync(
  resolve(
    process.cwd(),
    "features/advisor/components/backend-lead-detail.tsx",
  ),
  "utf8",
);
const dashboardSource = readFileSync(
  resolve(
    process.cwd(),
    "features/advisor/components/commercial-dashboard.tsx",
  ),
  "utf8",
);

describe("advisor commercial UI integration", () => {
  it("uses every official activity type without legacy aliases", () => {
    expect(ACTIVITY_TYPE_LABELS).toEqual({
      CONTACT_ATTEMPT: "Intento de contacto",
      CONTACT_SUCCESS: "Contacto exitoso",
      FOLLOW_UP_SCHEDULED: "Seguimiento programado",
      APPOINTMENT_SCHEDULED: "Cita agendada",
      CLOSED_WON: "Cierre exitoso",
      CLOSED_LOST: "Cierre sin conversión",
      OPTED_OUT: "Solicitud de no contacto",
    });
  });

  it("reuses an idempotency key while retrying the same activity", () => {
    const createKey = vi
      .fn()
      .mockReturnValueOnce("first-key")
      .mockReturnValueOnce("second-key");
    const input = {
      activityType: "CONTACT_ATTEMPT",
      channel: "PHONE",
      result: "Sin respuesta",
      note: "",
      workflowVersion: 2,
    };

    const createManagedAt = vi
      .fn()
      .mockReturnValueOnce("2026-07-25T10:00:00.000Z")
      .mockReturnValueOnce("2026-07-25T10:05:00.000Z");
    const first = resolveActivityAttempt(
      null,
      input,
      createKey,
      createManagedAt,
    );
    const retry = resolveActivityAttempt(
      first,
      input,
      createKey,
      createManagedAt,
    );
    const changed = resolveActivityAttempt(
      retry,
      { ...input, result: "Contacto exitoso" },
      createKey,
      createManagedAt,
    );

    expect(retry.key).toBe("first-key");
    expect(retry.managedAt).toBe("2026-07-25T10:00:00.000Z");
    expect(changed.key).toBe("second-key");
    expect(createKey).toHaveBeenCalledTimes(2);
    expect(createManagedAt).toHaveBeenCalledTimes(2);
  });

  it("selects the requested backend lead instead of always using the first", () => {
    const items = [
      { id: "first" },
      { id: "second" },
    ] as LeadListItem[];

    expect(resolveSelectedLead(items, "second")?.id).toBe("second");
    expect(resolveSelectedLead(items, "missing")?.id).toBe("first");
    expect(dashboardSource).toContain(
      "onSelect={() => selectLead(item.id)}",
    );
    expect(dashboardSource).not.toContain(
      'href={`/asesor/leads/${item.id}`}\n      aria-current',
    );
  });

  it("passes the refreshed canonical snapshot back into the detail", () => {
    expect(detailSource).toMatch(
      /const snapshot = await claimLeadAndRefresh\(detail\.id\);[\s\S]*applySnapshot\(snapshot\)/,
    );
    expect(detailSource).toMatch(
      /const snapshot = await updateWorkflowAndRefresh\([\s\S]*applySnapshot\(snapshot\)/,
    );
    expect(detailSource).toMatch(
      /const snapshot = await createActivityAndRefresh\([\s\S]*applySnapshot\(snapshot\)/,
    );
  });
});

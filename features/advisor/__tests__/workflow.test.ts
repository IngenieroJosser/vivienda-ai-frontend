import { describe, expect, it } from "vitest";
import { createCommercialState } from "../commercial";
import { getCommercialWorkflow } from "../workflow";

const capturedAt = "2026-07-23T10:00:00.000Z";

describe("commercial workflow", () => {
  it("guides an unassigned opportunity toward ownership", () => {
    const workflow = getCommercialWorkflow(
      createCommercialState("lead-1", capturedAt),
    );

    expect(workflow.action).toBe("TAKE");
    expect(workflow.ctaLabel).toBe("Tomar esta oportunidad");
    expect(workflow.completedSteps).toBe(0);
  });

  it("reveals contact and result steps progressively", () => {
    const assigned = {
      ...createCommercialState("lead-1", capturedAt),
      status: "ASSIGNED" as const,
      assignedTo: "Asesor actual",
    };
    expect(getCommercialWorkflow(assigned).action).toBe("CONTACT");

    expect(
      getCommercialWorkflow({
        ...assigned,
        status: "IN_PROGRESS",
        firstContactAt: capturedAt,
      }).action,
    ).toBe("RESULT");
  });

  it("routes scheduled work to the agenda", () => {
    const workflow = getCommercialWorkflow({
      ...createCommercialState("lead-1", capturedAt),
      status: "FOLLOW_UP",
      assignedTo: "Asesor actual",
      firstContactAt: capturedAt,
      followUpAt: "2026-07-25T15:00:00.000Z",
    });

    expect(workflow.action).toBe("FOLLOW_UP");
    expect(workflow.ctaLabel).toBe("Abrir en agenda");
    expect(workflow.completedSteps).toBe(4);
  });
});

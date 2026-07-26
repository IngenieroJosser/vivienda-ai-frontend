import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  claimLead,
  createLeadActivity,
  getLead,
  listLeadActivities,
  updateCommercialWorkflow,
} from "../leads";
import {
  claimLeadAndRefresh,
  createActivityAndRefresh,
  updateWorkflowAndRefresh,
} from "../commercial-operations";

vi.mock("../leads", () => ({
  claimLead: vi.fn(),
  createLeadActivity: vi.fn(),
  getLead: vi.fn(),
  listLeadActivities: vi.fn(),
  updateCommercialWorkflow: vi.fn(),
}));

const workflow = {
  lead_id: "lead-1",
  state: "ASSIGNED" as const,
  workflow_version: 2,
  next_action: "Registrar contacto",
  updated_at: "2026-07-25T10:00:00.000Z",
};
const lead = { id: "lead-1", commercial_workflow: workflow };
const activities = [{ id: "activity-1" }];

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(getLead).mockResolvedValue(lead as never);
  vi.mocked(listLeadActivities).mockResolvedValue(activities as never);
});

describe("commercial mutation refresh", () => {
  it("refreshes lead and activities after claiming an opportunity", async () => {
    vi.mocked(claimLead).mockResolvedValue(workflow as never);

    await expect(claimLeadAndRefresh("lead-1")).resolves.toEqual({
      workflow,
      lead,
      activities,
    });
    expect(claimLead).toHaveBeenCalledWith("lead-1", undefined);
    expect(getLead).toHaveBeenCalledWith("lead-1", undefined);
    expect(listLeadActivities).toHaveBeenCalledWith("lead-1", undefined);
  });

  it("refreshes the canonical lead after a workflow transition", async () => {
    const input = {
      state: "FOLLOW_UP" as const,
      expected_workflow_version: 2,
      updated_at: "2026-07-25T11:00:00.000Z",
    };
    vi.mocked(updateCommercialWorkflow).mockResolvedValue({
      ...workflow,
      state: "FOLLOW_UP",
      workflow_version: 3,
    } as never);

    const result = await updateWorkflowAndRefresh("lead-1", input as never);

    expect(result.lead).toBe(lead);
    expect(updateCommercialWorkflow).toHaveBeenCalledWith(
      "lead-1",
      input,
      undefined,
    );
    expect(getLead).toHaveBeenCalledOnce();
  });

  it("keeps the idempotency key and refreshes after an activity", async () => {
    const input = {
      activity_type: "CONTACT_ATTEMPT" as const,
      channel: "PHONE" as const,
      result: "Sin respuesta",
      managed_at: "2026-07-25T11:00:00.000Z",
      expected_workflow_version: 2,
    };
    vi.mocked(createLeadActivity).mockResolvedValue({
      activity: activities[0],
      workflow,
    } as never);

    await createActivityAndRefresh("lead-1", input as never, "stable-key");

    expect(createLeadActivity).toHaveBeenCalledWith(
      "lead-1",
      input,
      "stable-key",
      undefined,
    );
    expect(listLeadActivities).toHaveBeenCalledOnce();
  });
});

import { afterEach, describe, expect, it, vi } from "vitest";
import {
  claimLead,
  createActivity,
  getLead,
  listActivities,
  listLeads,
  updateWorkflow,
} from "../leads";

const leadDetail = {
  id: "lead-1",
  session_id: "session-1",
  first_name: "Camila",
  source: "meta",
  campaign: "vivienda",
};

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("getLead", () => {
  it("requests the encoded backend lead id", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: vi.fn().mockResolvedValue(leadDetail),
    });
    vi.stubGlobal("fetch", fetchMock);

    await expect(getLead("lead/with spaces")).resolves.toEqual(leadDetail);

    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:3001/api/v1/leads/lead%2Fwith%20spaces",
      expect.objectContaining({ method: "GET" }),
    );
  });

  it("propagates a not-found response as ApiError", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
      json: vi.fn().mockResolvedValue({ detail: "Lead not found" }),
    });
    vi.stubGlobal("fetch", fetchMock);

    await expect(getLead("missing-lead")).rejects.toMatchObject({
      name: "ApiError",
      status: 404,
      details: { detail: "Lead not found" },
    });
  });
});

describe("listLeads", () => {
  it("serializes the operational inbox filters from the API contract", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: vi.fn().mockResolvedValue([]),
    });
    vi.stubGlobal("fetch", fetchMock);

    await listLeads({
      limit: 25,
      assignedToMe: true,
      pendingAssignment: false,
      commercialState: "FOLLOW_UP",
      slaOverdue: true,
      overdueFollowUp: true,
      nextAction: "Contactar hoy",
      reevaluationDate: "2026-07-26",
    });

    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:3001/api/v1/leads?limit=25&assigned_to_me=true&pending_assignment=false&commercial_state=FOLLOW_UP&sla_overdue=true&overdue_follow_up=true&next_action=Contactar+hoy&reevaluation_date=2026-07-26",
      expect.objectContaining({ method: "GET" }),
    );
  });
});

describe("claimLead", () => {
  it("claims the encoded opportunity with advisor authentication", async () => {
    const workflow = {
      lead_id: "lead/with spaces",
      state: "ASSIGNED",
      workflow_version: 2,
      assigned_advisor_id: "advisor-erick",
    };
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: vi.fn().mockResolvedValue(workflow),
    });
    vi.stubGlobal("fetch", fetchMock);

    await expect(claimLead("lead/with spaces")).resolves.toEqual(workflow);

    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:3001/api/v1/leads/lead%2Fwith%20spaces/claim",
      expect.objectContaining({
        method: "POST",
      }),
    );
  });
});

describe("updateWorkflow", () => {
  it("sends the expected version and target state", async () => {
    const workflow = {
      lead_id: "lead-1",
      state: "FOLLOW_UP",
      workflow_version: 4,
    };
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: vi.fn().mockResolvedValue(workflow),
    });
    vi.stubGlobal("fetch", fetchMock);
    const input = {
      state: "FOLLOW_UP" as const,
      expected_workflow_version: 3,
      updated_at: "2026-07-25T10:00:00.000Z",
      next_follow_up_at: "2026-07-26T14:00:00.000Z",
    };

    await expect(updateWorkflow("lead-1", input)).resolves.toEqual(workflow);

    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:3001/api/v1/leads/lead-1/workflow",
      expect.objectContaining({
        method: "PATCH",
        body: JSON.stringify(input),
      }),
    );
  });
});

describe("createActivity", () => {
  it("reuses the caller idempotency key when an activity is retried", async () => {
    const operation = {
      activity: { id: "activity-1" },
      workflow: {
        lead_id: "lead-1",
        state: "IN_PROGRESS",
        workflow_version: 3,
      },
    };
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: vi.fn().mockResolvedValue(operation),
    });
    vi.stubGlobal("fetch", fetchMock);
    const input = {
      activity_type: "CONTACT_ATTEMPT" as const,
      channel: "PHONE" as const,
      result: "Sin respuesta",
      managed_at: "2026-07-25T10:00:00.000Z",
      expected_workflow_version: 2,
    };
    const idempotencyKey = "activity-stable-key-123";

    await createActivity("lead-1", input, idempotencyKey);
    await createActivity("lead-1", input, idempotencyKey);

    expect(fetchMock).toHaveBeenCalledTimes(2);
    for (const [, request] of fetchMock.mock.calls) {
      expect(request).toEqual(
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify(input),
          headers: expect.objectContaining({
            "Idempotency-Key": idempotencyKey,
          }),
        }),
      );
    }
  });
});

describe("listActivities", () => {
  it("loads the persisted commercial history with advisor authentication", async () => {
    const activities = [
      {
        id: "activity-1",
        lead_id: "lead-1",
        advisor_id: "advisor-erick",
        activity_type: "CONTACT_ATTEMPT",
      },
    ];
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: vi.fn().mockResolvedValue(activities),
    });
    vi.stubGlobal("fetch", fetchMock);

    await expect(listActivities("lead-1")).resolves.toEqual(activities);

    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:3001/api/v1/leads/lead-1/activities",
      expect.objectContaining({ method: "GET" }),
    );
  });
});

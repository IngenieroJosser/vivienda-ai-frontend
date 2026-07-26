import { afterEach, describe, expect, it, vi } from "vitest";
import { getLead, listLeads } from "../leads";
import { API_BASE_URL } from "../client";

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
      `${API_BASE_URL}/leads/lead%2Fwith%20spaces`,
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
  it("serializes the operational inbox filters expected by A4.7", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: vi.fn().mockResolvedValue([]),
    });
    vi.stubGlobal("fetch", fetchMock);

    await listLeads({
      assignedToMe: true,
      slaOverdue: true,
      overdueFollowUp: true,
      nextAction: "Registrar contacto",
      reevaluationDate: "2026-08-26",
      limit: 50,
    });

    const requestedUrl = String(fetchMock.mock.calls[0]?.[0]);
    expect(requestedUrl).toContain("limit=50");
    expect(requestedUrl).toContain("assigned_to_me=true");
    expect(requestedUrl).toContain("sla_overdue=true");
    expect(requestedUrl).toContain("overdue_follow_up=true");
    expect(requestedUrl).toContain("next_action=Registrar+contacto");
    expect(requestedUrl).toContain("reevaluation_date=2026-08-26");
  });
});

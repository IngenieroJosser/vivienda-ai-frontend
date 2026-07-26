import { afterEach, describe, expect, it, vi } from "vitest";
import { getLead } from "../leads";
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

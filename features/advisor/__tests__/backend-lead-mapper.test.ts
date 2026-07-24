import { describe, expect, it } from "vitest";
import type { LeadListItem } from "../../../lib/api/leads";
import { mapBackendLeadToQualified } from "../backend-lead-mapper";
import { projectCommercialOpportunities } from "../commercial";

const baseLead: LeadListItem = {
  id: "9713a35d-30c6-44e3-bb47-c6a91a185fa0",
  session_id: "session-1",
  first_name: "Camila",
  source: "meta",
  campaign: "vivienda",
  is_paid: true,
  status: "ACTIVE",
  affiliation_status: "AFFILIATE",
  route: "READY_TO_CLOSE",
  priority: "HIGH",
  readiness_score: 84,
  top_project_id: "versalles",
  updated_at: "2026-07-24T14:35:15.426Z",
};

describe("backend advisor lead mapper", () => {
  it("maps list fields into the advisor lead contract", () => {
    const lead = mapBackendLeadToQualified(baseLead);

    expect(lead.source).toBe("BACKEND");
    expect(lead.scenario).toMatchObject({
      id: "backend-session-1",
      leadId: baseLead.id,
      displayName: "Camila",
      leadSource: "META",
      capturedAt: baseLead.updated_at,
      routeLabel: "Atención comercial",
    });
    expect(lead.evaluation).toMatchObject({
      leadId: baseLead.id,
      readinessScore: 84,
      priority: "HIGH",
      route: "ADVISOR_NOW",
      projectIds: ["versalles"],
    });
    expect(lead.evaluation.projectMatches[0]).toMatchObject({
      projectId: "versalles",
    });
  });

  it("maps all backend routes without losing their meaning", () => {
    const routes = [
      ["READY_TO_CLOSE", "ADVISOR_NOW"],
      ["NEEDS_VALIDATION", "NEEDS_DATA"],
      ["NON_AFFILIATE_REVIEW", "NON_AFFILIATE_PRIORITY"],
      ["NURTURE", "NURTURE_LONG_TERM"],
      ["FINANCIAL_PREPARATION", "NURTURE_FINANCIAL"],
      ["OPTED_OUT", "OPTED_OUT"],
    ] as const;

    for (const [backendRoute, frontendRoute] of routes) {
      const lead = mapBackendLeadToQualified({
        ...baseLead,
        route: backendRoute,
        priority: "LOW",
        readiness_score: 12,
      });
      expect(lead.evaluation.route).toBe(frontendRoute);
    }
  });

  it("keeps accompaniment routes out of the commercial inbox", () => {
    const lead = mapBackendLeadToQualified({
      ...baseLead,
      route: "NURTURE",
      priority: "LOW",
      readiness_score: 18,
    });

    const opportunities = projectCommercialOpportunities(
      [lead],
      {},
      new Date("2026-07-24T15:00:00.000Z"),
    );

    expect(opportunities).toHaveLength(0);
  });

  it("uses a safe name and omits unknown affiliation", () => {
    const lead = mapBackendLeadToQualified({
      ...baseLead,
      first_name: null,
      affiliation_status: "UNKNOWN",
      route: null,
    });

    expect(lead.scenario.displayName).toBe("Prospecto sin nombre");
    expect(lead.evaluation.profileSnapshot).toEqual({});
    expect(lead.evaluation.route).toBe("NEEDS_DATA");
  });
});

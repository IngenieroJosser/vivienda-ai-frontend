import { describe, expect, it } from "vitest";
import type { LeadListItem } from "../../../lib/api/leads";
import {
  mapBackendLeadsToQualified,
  mapBackendLeadToQualified,
} from "../backend-lead-mapper";
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
  readiness_level: "HIGH",
  top_project_id: "versalles",
  handoff_requested: true,
  handoff_status: "REQUESTED",
  assigned_advisor_id: "advisor-1",
  commercial_state: "IN_PROGRESS",
  workflow_version: 4,
  next_follow_up_at: "2026-07-25T14:30:00.000Z",
  sla_due_at: "2026-07-24T15:00:00.000Z",
  sla_overdue: true,
  next_action: "Registrar el primer contacto.",
  review_date: null,
  qualified_at: "2026-07-24T14:30:00.000Z",
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
      capturedAt: baseLead.qualified_at,
      routeLabel: "Atención comercial",
    });
    expect(lead.evaluation).toMatchObject({
      leadId: baseLead.id,
      priority: "HIGH",
      route: "ADVISOR_NOW",
      projectIds: ["versalles"],
    });
    expect(Number.isNaN(lead.evaluation.readinessScore)).toBe(true);
    expect(Number.isNaN(lead.evaluation.confidenceScore)).toBe(true);
    expect(lead.backend).toEqual({
      readinessLevel: "HIGH",
      commercialState: "IN_PROGRESS",
      workflowVersion: 4,
      assignedAdvisorId: "advisor-1",
      nextFollowUpAt: "2026-07-25T14:30:00.000Z",
      slaDueAt: "2026-07-24T15:00:00.000Z",
      slaOverdue: true,
      nextAction: "Registrar el primer contacto.",
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
        readiness_level: "INITIAL",
      });
      expect(lead.evaluation.route).toBe(frontendRoute);
    }
  });

  it("keeps accompaniment routes out of the commercial inbox", () => {
    const lead = mapBackendLeadToQualified({
      ...baseLead,
      route: "NURTURE",
      priority: "LOW",
      readiness_level: "INITIAL",
    });

    const opportunities = projectCommercialOpportunities(
      [lead],
      {},
      new Date("2026-07-24T15:00:00.000Z"),
    );

    expect(opportunities).toHaveLength(0);
  });

  it("preserves the operational order already decided by the backend", () => {
    const backendLeads = mapBackendLeadsToQualified([
      {
        ...baseLead,
        id: "first",
        session_id: "first",
        priority: "LOW",
        readiness_level: "INITIAL",
      },
      {
        ...baseLead,
        id: "second",
        session_id: "second",
        priority: "HIGH",
        readiness_level: "HIGH",
      },
    ]);

    const opportunities = projectCommercialOpportunities(
      backendLeads,
      {},
      new Date("2026-07-24T15:00:00.000Z"),
    );

    expect(opportunities.map(({ lead }) => lead.scenario.leadId)).toEqual([
      "first",
      "second",
    ]);
  });

  it("does not invent a numeric score when the backend only sends a level", () => {
    const lead = mapBackendLeadToQualified({
      ...baseLead,
      readiness_level: "DEVELOPING",
    });

    expect(lead.backend.readinessLevel).toBe("DEVELOPING");
    expect(Number.isNaN(lead.evaluation.readinessScore)).toBe(true);
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

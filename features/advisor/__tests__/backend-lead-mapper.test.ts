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
  readiness_level: "HIGH",
  top_project_id: "versalles",
  handoff_requested: true,
  handoff_status: "REQUESTED",
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
      readinessScore: 80,
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

  it("preserves profile, nurture and commercial workflow data from the backend", () => {
    const lead = mapBackendLeadToQualified({
      ...baseLead,
      profile: {
        affiliation: "AFFILIATE",
        location: "SOACHA",
        incomeRange: "MID",
        preferredChannel: "WHATSAPP",
        ignoredObject: { unsafe: true },
      },
      readiness_factors: ["Afiliación confirmada"],
      readiness_blockers: ["La cuota inicial está pendiente."],
      estimated_monthly_payment: 780_000,
      route: "FINANCIAL_PREPARATION",
      nurture_primary_gap: "Cuota inicial",
      nurture_status: "ACTIVE",
      nurture_target_amount: 12_000_000,
      nurture_intervention_required: true,
      nurture_milestones: [
        {
          id: "savings-goal",
          label: "Definir una meta de ahorro",
          completed: true,
          completed_at: "2026-07-25T10:00:00Z",
        },
      ],
      commercial_state: "FOLLOW_UP",
      workflow_version: 4,
      assigned_advisor_id: "advisor-1",
      next_follow_up_at: "2026-08-01T14:00:00Z",
    });

    expect(lead.evaluation.profileSnapshot).toMatchObject({
      affiliation: "AFFILIATE",
      location: "SOACHA",
      incomeRange: "MID",
      preferredChannel: "WHATSAPP",
    });
    expect(lead.evaluation.profileSnapshot).not.toHaveProperty(
      "ignoredObject",
    );
    expect(lead.evaluation.capacity.estimatedHousingPayment).toBe(780_000);
    expect(lead.evaluation.factors).toEqual(["Afiliación confirmada"]);
    expect(lead.backendNurture).toMatchObject({
      status: "ACTIVE",
      primaryGap: "Cuota inicial",
      targetAmount: 12_000_000,
      interventionRequired: true,
    });
    expect(lead.backendNurture?.milestones[0]).toMatchObject({
      id: "savings-goal",
      completed: true,
    });
    expect(lead.backendWorkflow).toMatchObject({
      state: "FOLLOW_UP",
      version: 4,
      assignedAdvisorId: "advisor-1",
    });
  });
});

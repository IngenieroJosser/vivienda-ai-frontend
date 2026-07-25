import { describe, expect, it } from "vitest";
import { getQualifiedScenarioLeads } from "../../conversation/qualified-leads";
import {
  appendCommercialActivity,
  calculateCommercialMetrics,
  createCommercialState,
  projectCommercialOpportunities,
} from "../commercial";

const now = new Date("2026-07-23T15:00:00.000-05:00");

describe("commercial opportunity workspace", () => {
  it("keeps nurturing leads outside the commercial inbox", () => {
    const allLeads = getQualifiedScenarioLeads();
    const opportunities = projectCommercialOpportunities(allLeads, {}, now);

    expect(opportunities.length).toBeLessThan(allLeads.length);
    expect(
      opportunities.every(({ lead }) =>
        ["ADVISOR_NOW", "NON_AFFILIATE_PRIORITY"].includes(
          lead.evaluation.route,
        ),
      ),
    ).toBe(true);
  });

  it("orders opportunities by the calculated commercial signals", () => {
    const opportunities = projectCommercialOpportunities(
      getQualifiedScenarioLeads(),
      {},
      now,
    );

    for (let index = 1; index < opportunities.length; index += 1) {
      expect(
        opportunities[index - 1].lead.evaluation.readinessScore,
      ).toBeGreaterThanOrEqual(
        opportunities[index].lead.evaluation.readinessScore,
      );
    }
  });

  it("records auditable actions without changing the calculated evaluation", () => {
    const lead = getQualifiedScenarioLeads()[0];
    const originalScore = lead.evaluation.readinessScore;
    const initial = createCommercialState(lead.scenario.leadId, now.toISOString());
    const updated = appendCommercialActivity(initial, {
      type: "CONTACT_RECORDED",
      description: "Contacto registrado por el asesor.",
      timestamp: "2026-07-23T15:05:00.000-05:00",
      status: "IN_PROGRESS",
      firstContact: true,
    });

    expect(updated.status).toBe("IN_PROGRESS");
    expect(updated.firstContactAt).toBeDefined();
    expect(updated.activities).toHaveLength(1);
    expect(lead.evaluation.readinessScore).toBe(originalScore);
  });

  it("calculates operational metrics from lifecycle events", () => {
    const leads = getQualifiedScenarioLeads();
    const projected = projectCommercialOpportunities(leads, {}, now);
    const first = projected[0];
    const contacted = appendCommercialActivity(first.state, {
      type: "CONTACT_RECORDED",
      description: "Primer contacto.",
      timestamp: "2026-07-23T14:30:00.000-05:00",
      status: "IN_PROGRESS",
      firstContact: true,
    });
    const opportunities = projectCommercialOpportunities(
      leads,
      { [first.lead.scenario.leadId]: contacted },
      now,
    );
    const metrics = calculateCommercialMetrics(opportunities, now);

    expect(metrics.contactedToday).toBe(1);
    expect(metrics.pendingFirstContact).toBe(opportunities.length - 1);
    expect(metrics.averageFirstContactMinutes).not.toBeNull();
  });
});

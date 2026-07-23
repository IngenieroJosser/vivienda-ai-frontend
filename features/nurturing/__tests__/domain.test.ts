import { describe, expect, it } from "vitest";
import { getQualifiedScenarioLeads } from "../../conversation/qualified-leads";
import {
  buildNurturingPlans,
  createNurturingState,
  simulateReevaluation,
  updateNurturingState,
} from "../domain";

describe("nurturing workspace domain", () => {
  it("keeps commercial opportunities outside the nurturing queue", () => {
    const leads = getQualifiedScenarioLeads();
    const plans = buildNurturingPlans(leads, {});

    expect(plans.length).toBeLessThan(leads.length);
    expect(
      plans.every(({ lead }) =>
        [
          "NURTURE_FINANCIAL",
          "NURTURE_BENEFITS",
          "NURTURE_LONG_TERM",
          "NEEDS_DATA",
        ].includes(lead.evaluation.route),
      ),
    ).toBe(true);
  });

  it("classifies the main barrier and creates an actionable route", () => {
    const [plan] = buildNurturingPlans(getQualifiedScenarioLeads(), {});

    expect(plan.barrier).toBe("DOWN_PAYMENT");
    expect(plan.objective).toBeTruthy();
    expect(plan.suggestedResources.length).toBeGreaterThan(0);
    expect(plan.milestones).toHaveLength(3);
  });

  it("records local progress and audit history", () => {
    const timestamp = "2026-07-23T15:00:00.000-05:00";
    const state = createNurturingState("lead-camila", timestamp);
    const updated = updateNurturingState(state, {
      type: "MILESTONE_COMPLETED",
      description: "Avance registrado.",
      timestamp,
      milestone: "Definir una meta mensual de ahorro",
    });

    expect(updated.completedMilestones).toHaveLength(1);
    expect(updated.activities).toHaveLength(1);
    expect(updated.activities[0].description).toBe("Avance registrado.");
  });

  it("simulates a new evaluation without replacing the original result", () => {
    const [plan] = buildNurturingPlans(getQualifiedScenarioLeads(), {});
    const originalScore = plan.lead.evaluation.readinessScore;
    const simulation = simulateReevaluation(plan);

    expect(simulation.readinessScore).toBeGreaterThan(originalScore);
    expect(plan.lead.evaluation.readinessScore).toBe(originalScore);
  });

  it("tracks human exceptions without turning milestones into manual frontend work", () => {
    const timestamp = "2026-07-23T15:00:00.000-05:00";
    const state = createNurturingState("lead-camila", timestamp);
    const escalated = updateNurturingState(state, {
      type: "CASE_ESCALATED",
      description: "Caso ambiguo escalado con justificación.",
      timestamp,
      journeyStatus: "NEEDS_ATTENTION",
      interventionRequired: true,
    });
    const [plan] = buildNurturingPlans(getQualifiedScenarioLeads(), {
      "lead-camila": escalated,
    });

    expect(plan.statusLabel).toBe("Intervención requerida");
    expect(plan.interventionRequired).toBe(true);
    expect(plan.nextAutomaticAction).toContain("revisión");
    expect(plan.state.completedMilestones).toHaveLength(0);
  });
});

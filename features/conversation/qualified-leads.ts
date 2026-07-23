import type { EvaluationResult, Scenario } from "./domain";
import { evaluateProfile } from "./engine";
import { getScenarioAnswers, scenarios } from "./scenarios";

export type QualifiedLead = {
  scenario: Scenario;
  evaluation: EvaluationResult;
};

export function getQualifiedScenarioLeads(): QualifiedLead[] {
  return Object.values(scenarios).map((scenario) => {
    const answers = getScenarioAnswers(scenario.id);
    if (!answers) throw new Error(`Missing canonical answers for scenario: ${scenario.id}`);

    return {
      scenario,
      evaluation: evaluateProfile(scenario, "USE_KNOWN_DATA", answers),
    };
  });
}

export function getQualifiedScenarioLead(leadId: string): QualifiedLead | undefined {
  return getQualifiedScenarioLeads().find(({ scenario }) => scenario.leadId === leadId);
}

export function isCommercialOpportunity(result: EvaluationResult): boolean {
  return result.route === "ADVISOR_NOW" || result.route === "NON_AFFILIATE_PRIORITY";
}

export function isNurturingLead(result: EvaluationResult): boolean {
  return ["NURTURE_FINANCIAL", "NURTURE_BENEFITS", "NURTURE_LONG_TERM", "NEEDS_DATA"].includes(result.route);
}

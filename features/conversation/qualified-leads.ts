import type { EvaluationResult, Scenario } from "./domain";
import { evaluateProfile } from "./engine";
import { demoAnswers, scenarios, type ScenarioId } from "./scenarios";

export type QualifiedLead = {
  scenario: Scenario;
  evaluation: EvaluationResult;
};

export function getDemoQualifiedLeads(): QualifiedLead[] {
  return Object.values(scenarios).map((scenario) => ({
    scenario,
    evaluation: evaluateProfile(scenario, "USE_KNOWN_DATA", demoAnswers[scenario.id as ScenarioId]),
  }));
}

export function getDemoQualifiedLead(leadId: string): QualifiedLead | undefined {
  return getDemoQualifiedLeads().find(({ scenario }) => scenario.leadId === leadId);
}

export function isCommercialOpportunity(result: EvaluationResult): boolean {
  return result.route === "ADVISOR_NOW" || result.route === "NON_AFFILIATE_PRIORITY";
}

export function isNurturingLead(result: EvaluationResult): boolean {
  return ["NURTURE_FINANCIAL", "NURTURE_BENEFITS", "NURTURE_LONG_TERM", "NEEDS_DATA"].includes(result.route);
}

import { describe, expect, it } from "vitest";
import { evaluateProfile, selectQuestions } from "../engine";
import { scenarios } from "../scenarios";
import { answerCurrentQuestion, createConversationSession } from "../session";

describe("adaptive question selection", () => {
  it("asks for consent before any personal profile question", () => {
    const questions = selectQuestions(scenarios.jonathan, "PENDING");

    expect(questions).toHaveLength(1);
    expect(questions[0]?.id).toBe("consent");
  });

  it("selects a distinct route of at most five follow-up questions for each known scenario", () => {
    const jonathan = selectQuestions(scenarios.jonathan, "USE_KNOWN_DATA").map((question) => question.id);
    const laura = selectQuestions(scenarios.laura, "USE_KNOWN_DATA").map((question) => question.id);
    const camila = selectQuestions(scenarios.camila, "USE_KNOWN_DATA").map((question) => question.id);

    expect(jonathan).toEqual(["dreamGoal", "location", "horizon", "savings"]);
    expect(laura).toEqual(["dreamGoal", "horizon", "incomeRange", "savings", "obligations"]);
    expect(camila).toEqual(["mainConcern", "incomeRange", "obligations", "subsidyInterest", "visitIntent"]);
    expect(Math.max(jonathan.length, laura.length, camila.length) + 1).toBeLessThanOrEqual(6);
  });

  it("prioritizes affiliation and savings when Laura starts without known information", () => {
    const questions = selectQuestions(scenarios.laura, "START_FRESH").map((question) => question.id);

    expect(questions).toHaveLength(5);
    expect(questions).toContain("affiliation");
    expect(questions).toContain("savings");
    expect(questions).not.toContain("obligations");
  });

  it("routes Jonathan, Laura and Camila through three deterministic outcomes", () => {
    const jonathan = evaluateProfile(scenarios.jonathan, "USE_KNOWN_DATA", {
      dreamGoal: "BUY_THIS_YEAR",
      location: "SOACHA",
      horizon: "3_6",
      savings: "READY",
    });
    const laura = evaluateProfile(scenarios.laura, "USE_KNOWN_DATA", {
      dreamGoal: "BUY_THIS_YEAR",
      horizon: "0_3",
      incomeRange: "HIGH",
      obligations: "LOW",
      savings: "READY",
    });
    const camila = evaluateProfile(scenarios.camila, "USE_KNOWN_DATA", {
      mainConcern: "BENEFITS",
      incomeRange: "MID",
      obligations: "MEDIUM",
      subsidyInterest: "WANTS_REVIEW",
      visitIntent: "LATER",
    });

    expect(jonathan.route).toBe("ADVISOR_NOW");
    expect(laura.route).toBe("NON_AFFILIATE_PRIORITY");
    expect(camila.route).toBe("NURTURE_FINANCIAL");
    expect(jonathan.projectIds).toEqual(["versalles"]);
    expect(camila.projectIds).toEqual([]);
  });

  it("does not penalize readiness because a prospect is not affiliated", () => {
    const answers = {
      dreamGoal: "BUY_THIS_YEAR",
      horizon: "0_3",
      incomeRange: "HIGH",
      obligations: "LOW",
      savings: "READY",
    };
    const affiliate = evaluateProfile(scenarios.laura, "START_FRESH", {
      ...answers,
      affiliation: "AFFILIATE",
    });
    const nonAffiliate = evaluateProfile(scenarios.laura, "START_FRESH", {
      ...answers,
      affiliation: "NON_AFFILIATE",
    });

    expect(affiliate.readinessScore).toBe(nonAffiliate.readinessScore);
    expect(nonAffiliate.route).toBe("NON_AFFILIATE_PRIORITY");
  });

  it("creates, advances and completes a recoverable session", () => {
    let session = createConversationSession(scenarios.jonathan, "session-1", "2026-07-22T00:00:00.000Z");
    session = answerCurrentQuestion(session, scenarios.jonathan, "USE_KNOWN_DATA", "2026-07-22T00:00:01.000Z");

    expect(session.questionIds).toEqual(["dreamGoal", "location", "horizon", "savings"]);

    for (const value of ["BUY_THIS_YEAR", "SOACHA", "3_6", "READY"]) {
      session = answerCurrentQuestion(session, scenarios.jonathan, value, "2026-07-22T00:00:02.000Z");
    }

    expect(session.status).toBe("COMPLETED");
    expect(session.evaluation?.route).toBe("ADVISOR_NOW");
  });
});

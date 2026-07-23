import { describe, expect, it } from "vitest";
import { evaluateProfile, selectQuestions } from "../engine";
import { getQualifiedScenarioLeads } from "../qualified-leads";
import { getScenario, getScenarioAnswers, getScenarioByLeadId, scenarioAnswers, scenarios } from "../scenarios";
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

    expect(jonathan).toEqual(["dreamGoal", "horizon", "location", "obligations", "savings"]);
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
      horizon: "3_6",
      location: "SOACHA",
      obligations: "LOW",
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
    expect(jonathan.projectIds).toEqual(["versalles", "pamplona", "la-macarena"]);
    expect(camila.projectIds).toEqual([]);
    expect(jonathan.capacity.maximumHousingRatio).toBeCloseTo(0.3);
    expect(jonathan.capacity.estimatedHousingPayment).toBe(1_200_000);
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

  it("does not hide a compatible project because the prospect is not affiliated", () => {
    const answers = {
      dreamGoal: "BUY_THIS_YEAR",
      horizon: "0_3",
      incomeRange: "HIGH",
      obligations: "LOW",
      savings: "READY",
    };
    const nonAffiliate = evaluateProfile(
      { ...scenarios.laura, knownProfile: { affiliation: "NON_AFFILIATE", location: "SOACHA" } },
      "USE_KNOWN_DATA",
      answers,
    );
    const affiliate = evaluateProfile(
      { ...scenarios.laura, knownProfile: { affiliation: "AFFILIATE", location: "SOACHA" } },
      "USE_KNOWN_DATA",
      answers,
    );

    expect(nonAffiliate.route).toBe("NON_AFFILIATE_PRIORITY");
    expect(nonAffiliate.projectIds).toEqual(affiliate.projectIds);
    expect(nonAffiliate.projectIds).toHaveLength(3);
    expect(nonAffiliate.projectMatches.every(({ reasons }) => reasons.some((reason) => reason.includes("Soacha")))).toBe(true);
  });

  it("creates, advances and completes a recoverable session", () => {
    let session = createConversationSession(scenarios.jonathan, "session-1", "2026-07-22T00:00:00.000Z");
    session = answerCurrentQuestion(session, scenarios.jonathan, "USE_KNOWN_DATA", "2026-07-22T00:00:01.000Z");

    expect(session.questionIds).toEqual(["dreamGoal", "horizon", "location", "obligations", "savings"]);

    for (const value of ["BUY_THIS_YEAR", "3_6", "SOACHA", "LOW", "READY"]) {
      session = answerCurrentQuestion(session, scenarios.jonathan, value, "2026-07-22T00:00:02.000Z");
    }

    expect(session.status).toBe("COMPLETED");
    expect(session.evaluation?.route).toBe("ADVISOR_NOW");
  });

  it("never allocates more than forty percent of income to obligations and housing", () => {
    const result = evaluateProfile(scenarios.laura, "USE_KNOWN_DATA", {
      dreamGoal: "BUY_THIS_YEAR",
      horizon: "0_3",
      incomeRange: "HIGH",
      obligations: "HIGH",
      savings: "READY",
    });

    expect(result.capacity.currentCommitmentRatio + result.capacity.maximumHousingRatio).toBeLessThanOrEqual(0.4);
    expect(result.capacity.estimatedHousingPayment).toBe(300_000);
    expect(result.capacity.status).toBe("LIMITED");
  });

  it("completes the three journeys with the canonical scenario answers", () => {
    for (const scenario of Object.values(scenarios)) {
      let session = createConversationSession(scenario, `session-${scenario.id}`, scenario.capturedAt);
      session = answerCurrentQuestion(session, scenario, "USE_KNOWN_DATA", scenario.capturedAt);
      const answers = getScenarioAnswers(scenario.id);

      expect(answers, `missing canonical answers for ${scenario.id}`).toBeDefined();

      for (const questionId of session.questionIds) {
        const value = answers?.[questionId as keyof typeof scenario.knownProfile];
        expect(value, `missing answer for ${scenario.id}.${questionId}`).toBeDefined();
        session = answerCurrentQuestion(session, scenario, value as string, scenario.capturedAt);
      }

      expect(session.status).toBe("COMPLETED");
      expect(session.evaluation).toBeDefined();
    }
  });

  it("keeps total commitments exactly at forty percent for every known income case", () => {
    for (const obligations of ["LOW", "MEDIUM", "HIGH"] as const) {
      const result = evaluateProfile(scenarios.laura, "USE_KNOWN_DATA", {
        dreamGoal: "BUY_THIS_YEAR",
        horizon: "0_3",
        incomeRange: "HIGH",
        obligations,
        savings: "READY",
      });

      expect(result.capacity.currentCommitmentRatio + result.capacity.maximumHousingRatio).toBeCloseTo(0.4);
    }
  });

  it("survives interruption and JSON recovery before completing", () => {
    let session = createConversationSession(scenarios.jonathan, "recoverable", scenarios.jonathan.capturedAt);
    session = answerCurrentQuestion(session, scenarios.jonathan, "USE_KNOWN_DATA", scenarios.jonathan.capturedAt);
    session = answerCurrentQuestion(session, scenarios.jonathan, "BUY_THIS_YEAR", scenarios.jonathan.capturedAt);
    session = answerCurrentQuestion(session, scenarios.jonathan, "3_6", scenarios.jonathan.capturedAt);

    const recovered = JSON.parse(JSON.stringify(session)) as typeof session;
    expect(recovered.status).toBe("ACTIVE");
    expect(recovered.currentQuestionIndex).toBe(2);
    expect(recovered.answers).toEqual({ dreamGoal: "BUY_THIS_YEAR", horizon: "3_6" });
  });

  it("stops the flow without qualification when consent is rejected", () => {
    const session = answerCurrentQuestion(
      createConversationSession(scenarios.camila, "declined", scenarios.camila.capturedAt),
      scenarios.camila,
      "DECLINED",
      scenarios.camila.capturedAt,
    );

    expect(session.status).toBe("OPTED_OUT");
    expect(session.evaluation?.route).toBe("OPTED_OUT");
    expect(session.evaluation?.followUpAt).toBeNull();
  });

  it("returns no scenario for invalid fixture identifiers", () => {
    expect(getScenario("unknown")).toBeUndefined();
    expect(getScenarioAnswers("unknown")).toBeUndefined();
    expect(getScenarioByLeadId("lead-unknown")).toBeUndefined();
  });

  it("projects the exact same evaluation used by prospect and advisor views", () => {
    const qualified = getQualifiedScenarioLeads();
    const jonathan = qualified.find(({ scenario }) => scenario.id === "jonathan");
    const direct = evaluateProfile(scenarios.jonathan, "USE_KNOWN_DATA", scenarioAnswers.jonathan);

    expect(jonathan?.evaluation).toEqual(direct);
    expect(jonathan?.evaluation.readinessScore).toBe(direct.readinessScore);
    expect(jonathan?.evaluation.capacity).toEqual(direct.capacity);
    expect(direct.projectIds).toEqual(direct.projectMatches.map(({ projectId }) => projectId));
    expect(jonathan?.evaluation.projectMatches).toEqual(direct.projectMatches);
    expect(jonathan?.evaluation.benefitSignals).toEqual(direct.benefitSignals);
  });
});

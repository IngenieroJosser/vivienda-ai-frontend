import { describe, expect, it } from "vitest";
import { getHousingProject } from "../../../lib/housing-catalog";
import type { EvaluationResult, ProfileAnswers } from "../domain";
import { matchHousingProjects, resolveProjectMatches } from "../matching";

const moderateCapacity: EvaluationResult["capacity"] = {
  monthlyIncomeEstimate: 4_000_000,
  currentCommitmentRatio: 0.225,
  maximumHousingRatio: 0.175,
  estimatedHousingPayment: 700_000,
  status: "MODERATE",
};

const strongCapacity: EvaluationResult["capacity"] = {
  monthlyIncomeEstimate: 6_000_000,
  currentCommitmentRatio: 0.1,
  maximumHousingRatio: 0.3,
  estimatedHousingPayment: 1_800_000,
  status: "STRONG",
};

describe("evidence-backed project matching", () => {
  it("prioritizes the Meta campaign project when it agrees with the declared location", () => {
    const matches = matchHousingProjects({
      profile: {
        location: "SOACHA",
        householdSize: "3",
        mainConcern: "PAYMENT",
        horizon: "3_6",
      },
      capacity: moderateCapacity,
      campaignProjectId: "versalles",
    });

    expect(matches).toHaveLength(3);
    expect(matches[0]?.projectId).toBe("versalles");
    expect(matches[0]?.signals).toEqual(expect.arrayContaining(["CAMPAIGN", "LOCATION", "CAPACITY", "HOUSEHOLD", "PREFERENCE", "HORIZON"]));
    expect(matches[0]?.reasons.some((reason) => reason.includes("campaña de Meta"))).toBe(true);
    expect(matches[0]?.evidenceSourceIds).toEqual(expect.arrayContaining([
      "versalles-approved-brochure",
      "versalles-official-page",
      "versalles-tour-1",
    ]));
  });

  it("does not hardcode Versalles when another campaign project is the relevant origin", () => {
    const matches = matchHousingProjects({
      profile: {
        location: "SOACHA",
        householdSize: "3",
        mainConcern: "PAYMENT",
      },
      capacity: moderateCapacity,
      campaignProjectId: "pamplona",
    });

    expect(matches[0]?.projectId).toBe("pamplona");
    expect(matches[0]?.signals).toContain("CAMPAIGN");
  });

  it("never prioritizes a campaign project that contradicts the declared city", () => {
    const matches = matchHousingProjects({
      profile: {
        location: "BOGOTA",
        householdSize: "4_PLUS",
        mainConcern: "SPACE",
      },
      capacity: strongCapacity,
      campaignProjectId: "versalles",
    });
    const projects = resolveProjectMatches(matches);

    expect(matches).toHaveLength(3);
    expect(matches.map(({ projectId }) => projectId)).not.toContain("versalles");
    expect(projects.every(({ project }) => project.location.city === "Bogotá")).toBe(true);
  });

  it("crosses household, preference, capacity and horizon with catalog facts", () => {
    const profile: ProfileAnswers = {
      location: "SOACHA",
      householdSize: "4_PLUS",
      mainConcern: "SPACE",
      horizon: "0_3",
    };
    const [match] = matchHousingProjects({
      profile,
      capacity: moderateCapacity,
    });

    expect(match?.signals).toEqual(expect.arrayContaining([
      "LOCATION",
      "CAPACITY",
      "HOUSEHOLD",
      "PREFERENCE",
      "HORIZON",
    ]));
    expect(match?.reasons.some((reason) => reason.includes("50 m²"))).toBe(true);
    expect(match?.reasons.some((reason) => reason.includes("precio publicado vigente"))).toBe(true);
  });

  it("only sends available tour evidence and resolves the same project records used by every view", () => {
    const [match] = matchHousingProjects({
      profile: {},
      capacity: moderateCapacity,
      campaignProjectId: "payande",
    });
    const project = match ? getHousingProject(match.projectId) : undefined;

    expect(match?.projectId).toBe("payande");
    expect(match?.evidenceSourceIds).not.toContain("payande-tour-unavailable");
    expect(project?.inventory.validity).toBe("REQUIRES_CONFIRMATION");
    expect(project?.deliveryDate.validity).toBe("REQUIRES_CONFIRMATION");
    expect(resolveProjectMatches(match ? [match] : [])[0]?.project).toBe(project);
  });
});

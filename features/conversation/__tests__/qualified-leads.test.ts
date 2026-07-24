import { describe, expect, it } from "vitest";
import {
  getQualifiedScenarioLeads,
  mergeQualifiedLeads,
} from "../qualified-leads";

describe("qualified lead sources", () => {
  it("keeps the service version and appends local opportunities not returned remotely", () => {
    const local = getQualifiedScenarioLeads();
    const remote = [{ ...local[0], source: "BACKEND" as const }];

    const merged = mergeQualifiedLeads(remote, local);

    expect(merged).toHaveLength(local.length);
    expect(merged[0]).toMatchObject({
      source: "BACKEND",
      scenario: { leadId: local[0]?.scenario.leadId },
    });
    expect(
      merged.filter(
        ({ scenario }) => scenario.leadId === local[0]?.scenario.leadId,
      ),
    ).toHaveLength(1);
  });
});

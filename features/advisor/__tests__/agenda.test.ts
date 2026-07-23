import { describe, expect, it } from "vitest";
import { getQualifiedScenarioLeads } from "../../conversation/qualified-leads";
import { appendCommercialActivity, createCommercialState } from "../commercial";
import { buildAgendaItems } from "../agenda";

const now = new Date("2026-07-23T15:00:00.000-05:00");

describe("commercial agenda", () => {
  it("creates pending first-contact activities only for commercial opportunities", () => {
    const leads = getQualifiedScenarioLeads();
    const items = buildAgendaItems(leads, {}, now);

    expect(items.length).toBeGreaterThan(0);
    expect(items.every((item) => item.type === "FIRST_CONTACT")).toBe(true);
    expect(items.every((item) => item.leadId !== "lead-camila")).toBe(true);
  });

  it("uses a scheduled follow-up instead of duplicating the first contact", () => {
    const lead = getQualifiedScenarioLeads().find(
      ({ scenario }) => scenario.leadId === "lead-laura",
    )!;
    const initial = createCommercialState(
      lead.scenario.leadId,
      lead.scenario.capturedAt,
    );
    const scheduled = appendCommercialActivity(initial, {
      type: "FOLLOW_UP_SCHEDULED",
      description: "Seguimiento programado.",
      timestamp: "2026-07-23T14:00:00.000-05:00",
      assignedTo: "Asesor actual",
      firstContact: true,
      status: "FOLLOW_UP",
      followUpAt: "2026-07-24T09:00:00.000-05:00",
    });
    const items = buildAgendaItems(
      getQualifiedScenarioLeads(),
      { [lead.scenario.leadId]: scheduled },
      now,
    );
    const lauraItems = items.filter((item) => item.leadId === lead.scenario.leadId);

    expect(lauraItems).toHaveLength(1);
    expect(lauraItems[0].type).toBe("FOLLOW_UP");
    expect(lauraItems[0].timing).toBe("UPCOMING");
  });

  it("orders overdue activities before today and upcoming activities", () => {
    const items = buildAgendaItems(getQualifiedScenarioLeads(), {}, now);
    const ranks = items.map((item) =>
      item.timing === "OVERDUE" ? 0 : item.timing === "TODAY" ? 1 : 2,
    );

    expect(ranks).toEqual([...ranks].sort((a, b) => a - b));
  });
});

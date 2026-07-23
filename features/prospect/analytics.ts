import type { AcquisitionContext, FunnelEvent, FunnelEventName } from "./domain";

const EVENTS_KEY = "vivienda-match-ai:prospect-funnel:v1";

export function createFunnelEvent(input: {
  name: FunnelEventName;
  acquisition: AcquisitionContext;
  occurredAt: string;
  sessionId?: string;
  questionId?: string;
}): FunnelEvent {
  return {
    name: input.name,
    sessionId: input.sessionId,
    campaign: input.acquisition.campaign,
    source: input.acquisition.source,
    content: input.acquisition.content,
    questionId: input.questionId,
    occurredAt: input.occurredAt,
  };
}

export function trackFunnelEvent(event: FunnelEvent): void {
  if (typeof window === "undefined") return;
  try {
    const existing = window.localStorage.getItem(EVENTS_KEY);
    const events = existing ? (JSON.parse(existing) as FunnelEvent[]) : [];
    window.localStorage.setItem(EVENTS_KEY, JSON.stringify([...events, event].slice(-200)));
    window.dispatchEvent(new CustomEvent("vivienda-match:funnel", { detail: event }));
  } catch {
    // Measurement must never block the prospect journey.
  }
}

export function summarizeFunnelByCampaign(events: FunnelEvent[]): Record<string, {
  arrivals: number;
  conversations: number;
  consents: number;
  completions: number;
  results: number;
  nextActions: number;
  contactRequests: number;
  completionRate: number;
}> {
  const campaigns = [...new Set(events.map((event) => event.campaign))];

  return Object.fromEntries(campaigns.map((campaign) => {
    const campaignEvents = events.filter((event) => event.campaign === campaign);
    const count = (name: FunnelEventName) => campaignEvents.filter((event) => event.name === name).length;
    const arrivals = count("PAID_ARRIVAL");
    const completions = count("PROFILING_COMPLETED");
    return [campaign, {
      arrivals,
      conversations: count("CONVERSATION_STARTED"),
      consents: count("CONSENT_ACCEPTED"),
      completions,
      results: count("RESULT_VIEWED"),
      nextActions: count("NEXT_ACTION_CLICKED"),
      contactRequests: count("CONTACT_REQUEST_CREATED"),
      completionRate: arrivals ? Number((completions / arrivals).toFixed(4)) : 0,
    }];
  }));
}

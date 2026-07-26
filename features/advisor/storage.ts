"use client";

import type { CommercialOpportunityState } from "./commercial";

const STORAGE_KEY = "vivienda-match:commercial-state:v1";
export const COMMERCIAL_STATE_EVENT = "vivienda-match:commercial-state";

type StoredCommercialState = {
  version: 1;
  opportunities: Record<string, CommercialOpportunityState>;
};

export function getCommercialStates(): Record<
  string,
  CommercialOpportunityState
> {
  if (typeof window === "undefined") return {};
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return {};
  const parsed = JSON.parse(raw) as Partial<StoredCommercialState>;
  if (parsed.version !== 1 || !parsed.opportunities) {
    throw new Error("La gestión comercial local no es compatible.");
  }
  return parsed.opportunities;
}

export function saveCommercialState(state: CommercialOpportunityState): void {
  const opportunities = { ...getCommercialStates(), [state.leadId]: state };
  window.localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({ version: 1, opportunities } satisfies StoredCommercialState),
  );
  window.dispatchEvent(new CustomEvent(COMMERCIAL_STATE_EVENT));
}

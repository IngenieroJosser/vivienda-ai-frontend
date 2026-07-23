"use client";

import type { NurturingState } from "./domain";

const STORAGE_KEY = "vivienda-match:nurturing-state:v1";
export const NURTURING_STATE_EVENT = "vivienda-match:nurturing-state";

type StoredNurturingState = {
  version: 1;
  leads: Record<string, NurturingState>;
};

export function getNurturingStates(): Record<string, NurturingState> {
  if (typeof window === "undefined") return {};
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return {};
  const parsed = JSON.parse(raw) as Partial<StoredNurturingState>;
  if (parsed.version !== 1 || !parsed.leads) {
    throw new Error("La información local de acompañamiento no es compatible.");
  }
  return parsed.leads;
}

export function saveNurturingState(state: NurturingState): void {
  const leads = { ...getNurturingStates(), [state.leadId]: state };
  window.localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({ version: 1, leads } satisfies StoredNurturingState),
  );
  window.dispatchEvent(new CustomEvent(NURTURING_STATE_EVENT));
}

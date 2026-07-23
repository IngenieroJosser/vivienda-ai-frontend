"use client";

import { useCallback, useEffect, useState } from "react";
import type { CommercialOpportunityState } from "./commercial";
import {
  COMMERCIAL_STATE_EVENT,
  getCommercialStates,
  saveCommercialState,
} from "./storage";

export function useCommercialStates() {
  const [states, setStates] = useState<
    Record<string, CommercialOpportunityState>
  >({});

  useEffect(() => {
    const sync = () => setStates(getCommercialStates());
    sync();
    window.addEventListener(COMMERCIAL_STATE_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(COMMERCIAL_STATE_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const save = useCallback((state: CommercialOpportunityState) => {
    saveCommercialState(state);
    setStates((current) => ({ ...current, [state.leadId]: state }));
  }, []);

  return { states, save };
}

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
  const [status, setStatus] = useState<"LOADING" | "READY" | "ERROR">(
    "LOADING",
  );

  useEffect(() => {
    const sync = () => {
      try {
        setStates(getCommercialStates());
        setStatus("READY");
      } catch {
        setStatus("ERROR");
      }
    };
    const timer = window.setTimeout(sync, 0);
    window.addEventListener(COMMERCIAL_STATE_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener(COMMERCIAL_STATE_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const save = useCallback((state: CommercialOpportunityState) => {
    try {
      saveCommercialState(state);
      setStates((current) => ({ ...current, [state.leadId]: state }));
      setStatus("READY");
      return true;
    } catch {
      setStatus("ERROR");
      return false;
    }
  }, []);

  const retry = useCallback(() => {
    try {
      setStates(getCommercialStates());
      setStatus("READY");
    } catch {
      setStatus("ERROR");
    }
  }, []);

  return { states, status, save, retry };
}

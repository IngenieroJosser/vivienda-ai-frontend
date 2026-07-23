"use client";

import { useCallback, useEffect, useState } from "react";
import type { NurturingState } from "./domain";
import {
  getNurturingStates,
  NURTURING_STATE_EVENT,
  saveNurturingState,
} from "./storage";

export function useNurturingStates() {
  const [states, setStates] = useState<Record<string, NurturingState>>({});
  const [status, setStatus] = useState<"LOADING" | "READY" | "ERROR">(
    "LOADING",
  );

  const sync = useCallback(() => {
    try {
      setStates(getNurturingStates());
      setStatus("READY");
    } catch {
      setStatus("ERROR");
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(sync, 0);
    window.addEventListener(NURTURING_STATE_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener(NURTURING_STATE_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, [sync]);

  const save = useCallback((state: NurturingState) => {
    try {
      saveNurturingState(state);
      setStates((current) => ({ ...current, [state.leadId]: state }));
      setStatus("READY");
    } catch {
      setStatus("ERROR");
    }
  }, []);

  return { states, status, save, retry: sync };
}

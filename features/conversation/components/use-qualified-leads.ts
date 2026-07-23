"use client";

import { useEffect, useState } from "react";
import type { QualifiedLead } from "../qualified-leads";
import { getDemoQualifiedLeads } from "../qualified-leads";
import { getStoredSessions } from "../storage";

export function useQualifiedLeads(): QualifiedLead[] {
  const [qualifiedLeads, setQualifiedLeads] = useState(getDemoQualifiedLeads);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const completedSessions = getStoredSessions().filter((session) => session.evaluation);
      if (!completedSessions.length) return;

      setQualifiedLeads((current) => current.map((qualifiedLead) => {
        const session = completedSessions.find(
          (candidate) => candidate.leadId === qualifiedLead.scenario.leadId,
        );
        return session?.evaluation
          ? { ...qualifiedLead, evaluation: session.evaluation }
          : qualifiedLead;
      }));
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  return qualifiedLeads;
}

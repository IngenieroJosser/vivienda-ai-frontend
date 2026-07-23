"use client";

import { useEffect, useState } from "react";
import type { QualifiedLead } from "../qualified-leads";
import { getQualifiedScenarioLeads } from "../qualified-leads";
import { getStoredSessions } from "../storage";
import { buildPublicScenario } from "@/features/prospect/engine";
import { getStoredProspectSessions } from "@/features/prospect/storage";

export function useQualifiedLeads(): QualifiedLead[] {
  const [qualifiedLeads, setQualifiedLeads] = useState(getQualifiedScenarioLeads);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const completedSessions = getStoredSessions().filter((session) => session.evaluation);
      const publicSessions = getStoredProspectSessions().filter((session) => session.evaluation && session.status === "COMPLETED");

      setQualifiedLeads((current) => {
        const canonical = current.map((qualifiedLead) => {
          const session = completedSessions.find(
            (candidate) => candidate.leadId === qualifiedLead.scenario.leadId,
          );
          return session?.evaluation
            ? { ...qualifiedLead, evaluation: session.evaluation }
            : qualifiedLead;
        });
        const publicQualified = publicSessions.flatMap((session) => session.evaluation
          ? [{ scenario: buildPublicScenario(session), evaluation: session.evaluation }]
          : []);
        const canonicalIds = new Set(canonical.map(({ scenario }) => scenario.leadId));
        return [...canonical, ...publicQualified.filter(({ scenario }) => !canonicalIds.has(scenario.leadId))];
      });
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  return qualifiedLeads;
}

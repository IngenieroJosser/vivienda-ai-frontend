"use client";

import { useEffect, useState } from "react";
import { listLeads } from "../../../lib/api/leads";
import type { QualifiedLead } from "../qualified-leads";
import {
  getQualifiedScenarioLeads,
  mergeQualifiedLeads,
} from "../qualified-leads";
import { getStoredSessions } from "../storage";
import { buildPublicScenario } from "../../../features/prospect/engine";
import { getStoredContactRequests } from "../../../features/prospect/handoff-storage";
import { getStoredProspectSessions } from "../../../features/prospect/storage";
import { mapBackendLeadsToQualified } from "../../advisor/backend-lead-mapper";

const LEADS_LIMIT = 100;
const LIST_TIMEOUT_MS = 5_000;

export function useQualifiedLeads(): QualifiedLead[] {
  const [qualifiedLeads, setQualifiedLeads] = useState(getLocalQualifiedLeads);

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), LIST_TIMEOUT_MS);

    listLeads({ limit: LEADS_LIMIT, signal: controller.signal })
      .then((items) => {
        if (!cancelled) {
          setQualifiedLeads(
            mergeQualifiedLeads(
              mapBackendLeadsToQualified(items),
              getLocalQualifiedLeads(),
            ),
          );
        }
      })
      .catch(() => {
        if (!cancelled) {
          setQualifiedLeads(getLocalQualifiedLeads());
        }
      })
      .finally(() => window.clearTimeout(timeoutId));

    return () => {
      cancelled = true;
      controller.abort();
      window.clearTimeout(timeoutId);
    };
  }, []);

  return qualifiedLeads;
}

function getLocalQualifiedLeads(): QualifiedLead[] {
  const completedSessions = getStoredSessions().filter((session) => session.evaluation);
  const contactRequests = getStoredContactRequests();
  const contactRequestsBySession = new Map(
    contactRequests.map((request) => [request.sessionId, request]),
  );
  const publicSessions = getStoredProspectSessions().filter(
    (session) =>
      session.evaluation &&
      session.status === "COMPLETED" &&
      contactRequestsBySession.has(session.id),
  );
  const canonical = getQualifiedScenarioLeads().map((qualifiedLead) => {
    const session = completedSessions.find(
      (candidate) => candidate.leadId === qualifiedLead.scenario.leadId,
    );
    return session?.evaluation
      ? { ...qualifiedLead, evaluation: session.evaluation }
      : qualifiedLead;
  });
  const publicQualified = publicSessions.flatMap((session) =>
    session.evaluation
      ? [{
          scenario: buildPublicScenario(
            session,
            contactRequestsBySession.get(session.id),
          ),
          evaluation: session.evaluation,
          source: "LOCAL" as const,
        }]
      : [],
  );
  const canonicalIds = new Set(canonical.map(({ scenario }) => scenario.leadId));
  return [
    ...canonical,
    ...publicQualified.filter(({ scenario }) => !canonicalIds.has(scenario.leadId)),
  ];
}

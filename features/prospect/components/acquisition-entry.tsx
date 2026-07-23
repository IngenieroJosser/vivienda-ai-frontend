"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createFunnelEvent, trackFunnelEvent } from "../analytics";
import type { AcquisitionContext, CampaignExperience } from "../domain";
import { createProspectSession } from "../engine";
import {
  bindEntryMessageToSession,
  hasStagedEntryMessage,
} from "../pending-message";
import { findRecoverableProspectSession, saveProspectSession } from "../storage";

export function AcquisitionEntry({
  acquisition,
  campaign,
}: {
  acquisition: AcquisitionContext;
  campaign: CampaignExperience;
}) {
  const router = useRouter();
  const startedRef = useRef(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    try {
      const recoverable = findRecoverableProspectSession({
        leadReference: acquisition.leadReference,
        campaign: acquisition.campaign,
      });

      const arrivalKey = `vivienda-match:arrival:${acquisition.source}:${acquisition.campaign}:${acquisition.content}`;
      if (!window.sessionStorage.getItem(arrivalKey)) {
        trackFunnelEvent(createFunnelEvent({
          name: "PAID_ARRIVAL",
          acquisition,
          occurredAt: new Date().toISOString(),
        }));
        window.sessionStorage.setItem(arrivalKey, "1");
      }

      const startsNewConversation = recoverable?.status === "COMPLETED" && hasStagedEntryMessage();
      if (recoverable && !startsNewConversation) {
        bindEntryMessageToSession(recoverable.id);
        router.replace(recoverable.status === "COMPLETED"
          ? `/orientacion/resultado/${recoverable.id}`
          : `/orientacion/${recoverable.id}`);
        return;
      }

      const id = typeof crypto.randomUUID === "function"
        ? crypto.randomUUID()
        : `public-${Date.now().toString(36)}`;
      const session = createProspectSession({
        id,
        acquisition,
        campaign,
        timestamp: new Date().toISOString(),
      });
      saveProspectSession(session);
      bindEntryMessageToSession(session.id);
      trackFunnelEvent(createFunnelEvent({
        name: "CONVERSATION_STARTED",
        acquisition,
        sessionId: session.id,
        occurredAt: session.createdAt,
      }));
      router.replace(`/orientacion/${session.id}`);
    } catch {
      window.queueMicrotask(() => {
        setError("No pudimos iniciar la orientación en este dispositivo. Revisa el almacenamiento local e inténtalo nuevamente.");
      });
    }
  }, [acquisition, campaign, router]);

  return (
    <main className="grid min-h-screen place-items-center bg-[color:var(--vm-color-canvas)] px-5 text-[color:var(--vm-color-ink)]">
      <section className="max-w-md text-center" aria-live="polite">
        <div className="text-sm font-bold text-[color:var(--vm-color-brand-blue)]">Vivienda Colsubsidio</div>
        <h1 className="mt-3 text-2xl font-semibold">Preparando tu orientación…</h1>
        <p className="mt-3 text-sm leading-6 text-[color:var(--vm-color-ink-muted)]">{error || "Enseguida podrás conversar sobre lo que buscas."}</p>
      </section>
    </main>
  );
}

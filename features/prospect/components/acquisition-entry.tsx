"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  HousingWindow,
  OrientationHeader,
  OrientationTrustStrip,
} from "@/components/orientation-visuals";
import { Icon } from "@/components/icon";
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
    <div className="orientation-experience">
      <OrientationHeader status="Preparando orientación" />
      <main className="mx-auto grid min-h-[calc(100vh-72px)] max-w-[1180px] items-center gap-10 px-5 py-10 sm:px-8 lg:grid-cols-[minmax(0,1fr)_minmax(360px,.82fr)] lg:gap-16 lg:py-16">
        <section className="max-w-2xl" aria-live="polite">
          <div className="inline-flex items-center gap-2 rounded-full bg-[color:var(--vm-color-brand-yellow)]/25 px-3 py-2 text-[11px] font-bold uppercase tracking-[.12em] text-[color:var(--vm-color-brand-blue-deep)]">
            <Icon name="home" className="h-4 w-4" />
            Orientación personalizada
          </div>
          <h1 className="mt-6 text-[clamp(2.8rem,7vw,5.8rem)] font-semibold leading-[.92] tracking-[-.065em]">
            Estamos abriendo una conversación para ti.
          </h1>
          <p className="mt-6 max-w-xl text-base leading-8 text-[color:var(--vm-color-ink-muted)] sm:text-lg">
            {error ||
              "Recuperamos el contexto disponible y preparamos el siguiente paso sin hacerte repetir información innecesaria."}
          </p>
          <div className="mt-8 h-1.5 max-w-md overflow-hidden rounded-full bg-[color:var(--vm-color-brand-blue)]/10">
            <span className="brand-progress-gradient orientation-loading-line block h-full w-1/2 rounded-full" />
          </div>
          <div className="mt-8">
            <OrientationTrustStrip />
          </div>
        </section>
        <div className="hidden lg:block">
          <HousingWindow label="Una orientación clara para avanzar con confianza" />
        </div>
      </main>
    </div>
  );
}

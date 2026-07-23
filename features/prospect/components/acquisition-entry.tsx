"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Brand } from "@/components/brand";
import { Icon } from "@/components/icon";
import { createFunnelEvent, trackFunnelEvent } from "../analytics";
import type { AcquisitionContext, CampaignExperience, ProspectSession } from "../domain";
import { createProspectSession } from "../engine";
import { findRecoverableProspectSession, saveProspectSession } from "../storage";

export function AcquisitionEntry({
  acquisition,
  campaign,
}: {
  acquisition: AcquisitionContext;
  campaign: CampaignExperience;
}) {
  const router = useRouter();
  const [recoverable, setRecoverable] = useState<ProspectSession>();
  const [isStarting, setIsStarting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setRecoverable(findRecoverableProspectSession({
        leadReference: acquisition.leadReference,
        campaign: acquisition.campaign,
      }));

      const arrivalKey = `vivienda-match:arrival:${acquisition.source}:${acquisition.campaign}:${acquisition.content}`;
      if (!window.sessionStorage.getItem(arrivalKey)) {
        trackFunnelEvent(createFunnelEvent({
          name: "PAID_ARRIVAL",
          acquisition,
          occurredAt: new Date().toISOString(),
        }));
        window.sessionStorage.setItem(arrivalKey, "1");
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, [acquisition]);

  function begin() {
    if (recoverable) {
      router.push(recoverable.status === "COMPLETED"
        ? `/orientacion/resultado/${recoverable.id}`
        : `/orientacion/${recoverable.id}`);
      return;
    }

    setIsStarting(true);
    setError("");
    try {
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
      trackFunnelEvent(createFunnelEvent({
        name: "CONVERSATION_STARTED",
        acquisition,
        sessionId: session.id,
        occurredAt: session.createdAt,
      }));
      router.push(`/orientacion/${session.id}`);
    } catch {
      setError("No pudimos guardar tu avance en este dispositivo. Inténtalo nuevamente.");
      setIsStarting(false);
    }
  }

  const buttonLabel = recoverable?.status === "COMPLETED"
    ? "Ver mi orientación"
    : recoverable
      ? "Continuar mi orientación"
      : "Comenzar mi orientación";

  return (
    <div className="min-h-screen bg-[linear-gradient(150deg,var(--vm-color-canvas)_0%,var(--vm-color-surface)_54%,var(--vm-color-brand-yellow)_180%)] text-[color:var(--vm-color-ink)]">
      <header className="border-b border-[color:var(--vm-color-line)] bg-white">
        <div className="mx-auto flex min-h-[68px] max-w-[1120px] items-center justify-between px-5 sm:px-8">
          <Brand compact />
          <span className="inline-flex items-center gap-2 text-xs font-semibold text-[color:var(--vm-color-success)]">
            <Icon name="shield" className="h-4 w-4" /> Información protegida
          </span>
        </div>
      </header>

      <main className="mx-auto grid min-h-[calc(100vh-69px)] max-w-[1120px] items-center gap-10 px-5 py-10 sm:px-8 lg:grid-cols-[1.08fr_.72fr] lg:py-16">
        <section className="max-w-3xl">
          <div className="text-xs font-bold uppercase tracking-[.1em] text-[color:var(--vm-color-brand-blue)]">{campaign.eyebrow}</div>
          <h1 className="mt-4 text-4xl font-semibold leading-[1.02] tracking-[-.04em] sm:text-6xl">{campaign.title}</h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-[color:var(--vm-color-ink-muted)] sm:text-lg">{campaign.description}</p>

          <button
            type="button"
            onClick={begin}
            disabled={isStarting}
            className="mt-8 inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-full bg-[color:var(--vm-color-brand-blue)] px-7 text-base font-bold text-white shadow-[var(--vm-shadow-medium)] transition hover:bg-[color:var(--vm-color-brand-blue-deep)] focus-visible:outline-none focus-visible:shadow-[var(--vm-shadow-focus)] disabled:opacity-[var(--vm-opacity-disabled)] sm:w-auto"
          >
            {isStarting ? "Preparando tu conversación…" : buttonLabel}
            <Icon name="arrow" className="h-4 w-4" />
          </button>
          {error ? <p role="alert" className="mt-3 text-sm font-semibold text-[color:var(--vm-color-error)]">{error}</p> : null}

          {recoverable ? (
            <p className="mt-4 text-sm font-semibold text-[color:var(--vm-color-success)]">
              {recoverable.status === "COMPLETED"
                ? "Tu resultado sigue disponible en este dispositivo."
                : "Encontramos tu avance y puedes continuar donde lo dejaste."}
            </p>
          ) : null}

          <p className="mt-5 text-xs leading-5 text-[color:var(--vm-color-ink-muted)]">{campaign.promise}. Te pediremos autorización antes de tratar información personal.</p>
        </section>

        <aside className="surface-solid p-6 sm:p-8" aria-label="Qué recibirás">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-full bg-[color:var(--vm-color-brand-blue)]/10 text-[color:var(--vm-color-brand-blue)]"><Icon name="sparkles" /></span>
            <div>
              <div className="text-xs font-semibold text-[color:var(--vm-color-success)]">Orientador digital</div>
              <h2 className="mt-1 text-xl font-semibold">Una guía breve y clara</h2>
            </div>
          </div>
          <ul className="mt-6 space-y-4 text-sm leading-6">
            {[
              "Un rango prudente para una posible cuota mensual.",
              "Beneficios confirmados separados de los que requieren validación.",
              "Proyectos que coincidan con la información disponible.",
              "Un siguiente paso concreto según tu momento.",
            ].map((item) => (
              <li key={item} className="flex gap-3">
                <Icon name="check" className="mt-1 h-4 w-4 shrink-0 text-[color:var(--vm-color-success)]" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <div className="mt-6 border-t border-[color:var(--vm-color-line)] pt-5 text-xs leading-5 text-[color:var(--vm-color-ink-muted)]">
            No necesitas documentos para comenzar. La orientación no constituye aprobación de crédito, subsidio o disponibilidad.
          </div>
          <Link href="https://www.colsubsidio.com/transparencia-acceso-informacion/tratamiento-datos-personales" className="mt-4 inline-flex text-xs font-semibold text-[color:var(--vm-color-brand-blue)]">Tratamiento de información</Link>
        </aside>
      </main>
    </div>
  );
}

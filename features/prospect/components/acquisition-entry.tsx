"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Brand } from "@/components/brand";
import { Icon } from "@/components/icon";
import { createFunnelEvent, trackFunnelEvent } from "../analytics";
import { sanitizeFirstName } from "../campaigns";
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
  const [firstName, setFirstName] = useState("");
  const [recoverable, setRecoverable] = useState<ProspectSession>();
  const [isStarting, setIsStarting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const stored = findRecoverableProspectSession({
        leadReference: acquisition.leadReference,
        campaign: acquisition.campaign,
      });
      setRecoverable(stored);
      if (stored?.firstName) setFirstName(stored.firstName);

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

    const safeName = sanitizeFirstName(firstName);
    if (!safeName) {
      setError("Cuéntanos cómo prefieres que te llamemos para comenzar.");
      return;
    }

    setIsStarting(true);
    setError("");
    try {
      const id = typeof crypto.randomUUID === "function" ? crypto.randomUUID() : `public-${Date.now().toString(36)}`;
      const session = createProspectSession({
        id,
        firstName: safeName,
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

  return (
    <div className="min-h-screen bg-[linear-gradient(145deg,#f5fbff_0%,#fffdf4_55%,#f7fbfd_100%)] text-[color:var(--vm-color-ink)]">
      <header className="border-b border-[color:var(--vm-color-line)] bg-white">
        <div className="mx-auto flex min-h-[72px] max-w-[1180px] items-center justify-between px-5 sm:px-8">
          <Brand compact />
          <span className="inline-flex items-center gap-2 rounded-full bg-[color:var(--vm-color-brand-blue)]/[.06] px-3 py-2 text-xs font-semibold text-[color:var(--vm-color-brand-blue)]"><Icon name="shield" className="h-4 w-4" /> Sitio de orientación</span>
        </div>
      </header>

      <main className="mx-auto grid max-w-[1180px] gap-8 px-5 py-9 sm:px-8 lg:grid-cols-[1fr_.82fr] lg:items-center lg:py-16">
        <section>
          <div className="text-xs font-bold uppercase tracking-[.1em] text-[color:var(--vm-color-brand-blue)]">{campaign.eyebrow}</div>
          <h1 className="mt-4 max-w-3xl text-4xl font-semibold leading-[1.02] tracking-[-.05em] sm:text-6xl">{campaign.title}</h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-[color:var(--vm-color-ink-muted)] sm:text-lg">{campaign.description}</p>
          <div className="mt-7 grid gap-3 sm:grid-cols-3">
            {[
              ["clock", "≈ 5 minutos", "Orientación inicial"],
              ["money", "Rango responsable", "Sin prometer créditos"],
              ["target", "Un siguiente paso", "Claro y personalizado"],
            ].map(([icon, value, label]) => (
              <div key={value} className="rounded-[var(--vm-radius-card)] border border-[color:var(--vm-color-line)] bg-white p-4 shadow-sm">
                <Icon name={icon as Parameters<typeof Icon>[0]["name"]} className="h-5 w-5 text-[color:var(--vm-color-brand-blue)]" />
                <div className="mt-3 text-sm font-bold">{value}</div>
                <div className="mt-1 text-xs text-[color:var(--vm-color-ink-muted)]">{label}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="glass-elevated p-5 sm:p-8" aria-labelledby="start-title">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-full bg-[color:var(--vm-color-brand-blue)] text-white"><Icon name="sparkles" /></span>
            <div><div className="text-xs font-semibold text-[color:var(--vm-color-success)]">Asesor digital disponible</div><h2 id="start-title" className="mt-1 text-2xl font-semibold">{recoverable ? `Hola, ${recoverable.firstName}` : "Empecemos por lo mínimo"}</h2></div>
          </div>

          {recoverable ? (
            <div className="mt-6 rounded-[var(--vm-radius-control)] bg-[color:var(--vm-color-brand-yellow)]/12 p-4">
              <div className="text-sm font-bold">{recoverable.status === "COMPLETED" ? "Tu orientación está lista." : "Encontramos una conversación guardada."}</div>
              <p className="mt-1 text-xs leading-5 text-[color:var(--vm-color-ink-muted)]">{recoverable.status === "COMPLETED" ? "Puedes volver a consultar el resultado desde este dispositivo." : "Continúa exactamente donde la dejaste."}</p>
            </div>
          ) : (
            <label className="mt-6 block">
              <span className="text-sm font-bold">¿Cómo prefieres que te llamemos?</span>
              <input value={firstName} onChange={(event) => setFirstName(event.target.value)} autoComplete="given-name" maxLength={40} className="form-field mt-2 min-h-12" placeholder="Tu primer nombre" />
            </label>
          )}

          <button type="button" onClick={begin} disabled={isStarting} className="mt-6 inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-full bg-[color:var(--vm-color-brand-blue)] px-6 text-base font-bold text-white transition hover:bg-[color:var(--vm-color-brand-blue-deep)] focus-visible:outline-none focus-visible:shadow-[var(--vm-shadow-focus)] disabled:opacity-[var(--vm-opacity-disabled)]">
            {isStarting ? "Preparando conversación…" : recoverable?.status === "COMPLETED" ? "Ver mi orientación" : recoverable ? "Continuar conversación" : "Comenzar mi orientación"} <Icon name="arrow" className="h-4 w-4" />
          </button>
          {error ? <p role="alert" className="mt-3 text-sm font-semibold text-[color:var(--vm-color-error)]">{error}</p> : null}

          <p className="mt-5 text-xs leading-5 text-[color:var(--vm-color-ink-muted)]">{campaign.promise}. Antes de usar información personal te explicaremos para qué la necesitamos.</p>
          <Link href="https://www.colsubsidio.com/transparencia-acceso-informacion/tratamiento-datos-personales" className="mt-3 inline-flex text-xs font-semibold text-[color:var(--vm-color-brand-blue)]">Conocer el tratamiento de información</Link>
        </section>
      </main>
    </div>
  );
}

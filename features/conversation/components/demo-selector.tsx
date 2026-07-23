"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/icon";
import type { ConversationSession, Scenario } from "../domain";
import { createConversationSession } from "../session";
import { getRecoverableSession, saveSession } from "../storage";

export function DemoSelector({ scenarios }: { scenarios: Scenario[] }) {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState<Scenario["id"]>();
  const [recoverable, setRecoverable] = useState<ConversationSession>();
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const timer = window.setTimeout(() => setRecoverable(getRecoverableSession()), 0);
    return () => window.clearTimeout(timer);
  }, []);

  function startConversation() {
    const scenario = scenarios.find((item) => item.id === selectedId);
    if (!scenario) return;

    setIsCreating(true);
    setError("");

    try {
      const id = typeof crypto.randomUUID === "function"
        ? crypto.randomUUID()
        : `demo-${Date.now().toString(36)}`;
      const session = createConversationSession(scenario, id, new Date().toISOString());
      saveSession(session);
      router.push(`/conversacion/${session.id}`);
    } catch {
      setError("No pudimos crear la sesión en este navegador. Revisa el almacenamiento local e inténtalo de nuevo.");
      setIsCreating(false);
    }
  }

  return (
    <>
      <div className="mt-10 grid gap-4 lg:grid-cols-3" aria-label="Escenarios disponibles">
        {scenarios.map((scenario) => {
          const active = selectedId === scenario.id;
          const initials = scenario.displayName.slice(0, 2).toUpperCase();

          return (
            <button
              key={scenario.id}
              type="button"
              onClick={() => setSelectedId(scenario.id)}
              aria-pressed={active}
              className={`surface-solid group p-6 text-left transition duration-200 hover:-translate-y-0.5 hover:border-[color:var(--vm-color-brand-blue)] focus-visible:outline-none focus-visible:shadow-[var(--vm-shadow-focus)] ${active ? "border-[color:var(--vm-color-brand-blue)] shadow-[var(--vm-shadow-medium)]" : ""}`}
            >
              <div className="flex items-start justify-between gap-4">
                <span className="grid h-11 w-11 place-items-center rounded-full bg-[color:var(--vm-color-brand-blue)]/10 text-sm font-bold text-[color:var(--vm-color-brand-blue)]">{initials}</span>
                <Icon name={active ? "check" : "arrow"} className="h-4 w-4 text-[color:var(--vm-color-brand-blue)]" />
              </div>
              <div className="mt-5 text-[10px] font-bold uppercase tracking-[.08em] text-[color:var(--vm-color-brand-blue)]">{scenario.routeLabel}</div>
              <h2 className="mt-2 text-2xl font-semibold tracking-[-.035em]">{scenario.displayName}</h2>
              <p className="mt-3 text-sm leading-6 text-[color:var(--vm-color-ink-muted)]">{scenario.description}</p>
              <div className="mt-5 flex items-center gap-2 border-t border-[color:var(--vm-color-line)] pt-4 text-xs font-semibold text-[color:var(--vm-color-ink-muted)]">
                <Icon name={scenario.leadSource === "META" ? "campaign" : "home"} className="h-4 w-4 text-[color:var(--vm-color-brand-blue)]" />
                {scenario.leadSource === "META" ? "Pauta de Meta" : "Canal orgánico"}
              </div>
            </button>
          );
        })}
      </div>

      {selectedId ? (
        <section className="surface-solid mt-8 p-6 sm:p-8" aria-live="polite">
          <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-[.08em] text-[color:var(--vm-color-success)]">Escenario seleccionado</div>
              <h2 className="mt-2 text-2xl font-semibold">
                {scenarios.find((scenario) => scenario.id === selectedId)?.displayName}
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-[color:var(--vm-color-ink-muted)]">A partir de aquí verás la experiencia del prospecto. En un flujo real, esta identificación ocurre automáticamente desde el lead capturado.</p>
            </div>
            <button type="button" onClick={startConversation} disabled={isCreating} className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-full bg-[color:var(--vm-color-brand-blue)] px-6 text-sm font-bold text-white transition hover:bg-[color:var(--vm-color-brand-blue-deep)] disabled:cursor-wait disabled:opacity-[var(--vm-opacity-disabled)]">
              {isCreating ? "Identificando lead…" : "Simular contacto por WhatsApp"} <Icon name="arrow" className="h-4 w-4" />
            </button>
          </div>
          {error ? <p role="alert" className="mt-4 text-sm font-semibold text-[color:var(--vm-color-error)]">{error}</p> : null}
        </section>
      ) : (
        <div className="mt-8 rounded-[var(--vm-radius-card)] border border-dashed border-[color:var(--vm-color-brand-blue)]/20 p-6 text-sm text-[color:var(--vm-color-ink-muted)]">Selecciona uno de los tres escenarios para iniciar.</div>
      )}

      {recoverable ? (
        <aside className="mt-5 flex flex-col items-start justify-between gap-4 rounded-[var(--vm-radius-card)] border border-[color:var(--vm-color-brand-yellow)] bg-[color:var(--vm-color-brand-yellow)]/10 p-5 sm:flex-row sm:items-center">
          <div>
            <div className="text-sm font-bold">Tienes una sesión guardada</div>
            <p className="mt-1 text-xs text-[color:var(--vm-color-ink-muted)]">Puedes continuar exactamente donde la dejaste.</p>
          </div>
          <Link href={recoverable.status === "ACTIVE" ? `/conversacion/${recoverable.id}` : `/resultado/${recoverable.leadId}`} className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[color:var(--vm-color-brand-blue)] px-5 text-sm font-bold text-white">
            Recuperar sesión <Icon name="arrow" className="h-4 w-4" />
          </Link>
        </aside>
      ) : null}
    </>
  );
}

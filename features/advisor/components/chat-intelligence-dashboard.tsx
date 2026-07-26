"use client";

import { useCallback, useEffect, useState } from "react";
import { Icon } from "@/components/icon";
import { Pill } from "@/components/ui";
import {
  exportChatTraining,
  getChatTrainingSummary,
} from "@/lib/api/conversations";

type TrainingSummary = Awaited<ReturnType<typeof getChatTrainingSummary>>;

export function ChatIntelligenceDashboard() {
  const [summary, setSummary] = useState<TrainingSummary | null>(null);
  const [status, setStatus] = useState<"LOADING" | "READY" | "ERROR">("LOADING");
  const [exportStatus, setExportStatus] = useState<"IDLE" | "SAVING" | "DONE" | "ERROR">("IDLE");

  const load = useCallback(async () => {
    setStatus("LOADING");
    try {
      setSummary(await getChatTrainingSummary());
      setStatus("READY");
    } catch {
      setStatus("ERROR");
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    getChatTrainingSummary()
      .then((data) => {
        if (cancelled) return;
        setSummary(data);
        setStatus("READY");
      })
      .catch(() => {
        if (!cancelled) setStatus("ERROR");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  async function exportReviewed() {
    setExportStatus("SAVING");
    try {
      const next = await exportChatTraining();
      setSummary(next);
      setExportStatus("DONE");
    } catch {
      setExportStatus("ERROR");
    }
  }

  if (status === "LOADING") {
    return (
      <section className="surface-solid p-8 text-center">
        <Icon name="brain" className="mx-auto h-8 w-8 animate-pulse text-[color:var(--vm-color-brand-blue)]" />
        <p className="mt-3 text-sm text-[color:var(--vm-color-ink-muted)]">Consultando aprendizaje del chatbot…</p>
      </section>
    );
  }

  if (status === "ERROR" || !summary) {
    return (
      <section className="surface-solid p-8 text-center">
        <Icon name="alert" className="mx-auto h-8 w-8 text-[color:var(--vm-color-error)]" />
        <h2 className="mt-3 font-semibold">No se pudo consultar ChatLead</h2>
        <p className="mt-2 text-sm text-[color:var(--vm-color-ink-muted)]">Verifica que FastAPI esté activo y que el token de asesor esté configurado.</p>
        <button type="button" onClick={() => void load()} className="mt-4 rounded-full bg-[color:var(--vm-color-brand-blue)] px-4 py-2.5 text-xs font-bold text-white">Reintentar</button>
      </section>
    );
  }

  const reviewRate = summary.total_records
    ? Math.round(((summary.positive_records + summary.negative_records) / summary.total_records) * 100)
    : 0;

  return (
    <div className="space-y-4">
      <section className="surface-solid p-6 sm:p-8">
        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-start">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[.1em] text-[color:var(--vm-color-brand-blue)]">
              <Icon name="brain" className="h-4 w-4" />
              Gobierno del chatbot
            </div>
            <h2 className="mt-2 text-2xl font-semibold tracking-[-.04em]">Aprendizaje basado en conversaciones revisadas</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-[color:var(--vm-color-ink-muted)]">
              ChatLead almacena cada turno con estado, ruta, próxima acción, señales, modelo, latencia y consumo. La información solo pasa al conjunto de entrenamiento después de una revisión humana.
            </p>
          </div>
          <Pill tone="green">Flujo supervisado</Pill>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          <Metric label="Turnos registrados" value={summary.total_records} />
          <Metric label="Elegibles" value={summary.eligible_records} />
          <Metric label="Aprobados" value={summary.positive_records} />
          <Metric label="Rechazados" value={summary.negative_records} />
          <Metric label="Resultados observados" value={summary.labeled_outcomes} />
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.2fr_.8fr]">
        <article className="surface-solid p-6 sm:p-8">
          <h3 className="text-lg font-semibold">Ciclo de mejora controlada</h3>
          <ol className="mt-5 space-y-4">
            {[
              ["1", "Captura", "Cada turno se guarda en ChatLead con contexto y trazabilidad."],
              ["2", "Revisión", "Un asesor valida o corrige la próxima acción y la ruta."],
              ["3", "Exportación", "Solo los registros aprobados se exportan como JSONL."],
              ["4", "Entrenamiento", "El comando CLI entrena el router local de próxima acción."],
              ["5", "Evaluación", "El nuevo artefacto se valida antes de habilitarlo como fallback."],
            ].map(([step, title, description]) => (
              <li key={step} className="flex gap-3">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[color:var(--vm-color-brand-blue)] text-xs font-bold text-white">{step}</span>
                <div><strong className="text-sm">{title}</strong><p className="mt-1 text-sm leading-5 text-[color:var(--vm-color-ink-muted)]">{description}</p></div>
              </li>
            ))}
          </ol>
        </article>

        <article className="surface-solid p-6 sm:p-8">
          <h3 className="text-lg font-semibold">Preparación del dataset</h3>
          <div className="mt-5 rounded-[var(--vm-radius-card)] bg-[color:var(--vm-color-brand-blue)]/[.05] p-5">
            <div className="text-xs uppercase tracking-[.08em] text-[color:var(--vm-color-ink-muted)]">Cobertura de revisión</div>
            <div className="mt-2 text-4xl font-semibold">{reviewRate}%</div>
            <p className="mt-2 text-xs leading-5 text-[color:var(--vm-color-ink-muted)]">Porcentaje de turnos con una valoración positiva o negativa.</p>
          </div>
          <button
            type="button"
            onClick={() => void exportReviewed()}
            disabled={exportStatus === "SAVING" || summary.eligible_records === 0}
            className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-[color:var(--vm-color-brand-blue)] px-4 text-xs font-bold text-white disabled:cursor-not-allowed disabled:opacity-45"
          >
            <Icon name="download" className="h-4 w-4" />
            {exportStatus === "SAVING" ? "Exportando…" : "Exportar registros revisados"}
          </button>
          {exportStatus === "DONE" ? <p className="mt-3 text-xs font-semibold text-[color:var(--vm-color-success)]">Dataset exportado correctamente.</p> : null}
          {exportStatus === "ERROR" ? <p role="alert" className="mt-3 text-xs font-semibold text-[color:var(--vm-color-error)]">No fue posible exportar el dataset.</p> : null}
          {summary.exported_path ? <p className="mt-3 break-all text-[11px] leading-5 text-[color:var(--vm-color-ink-muted)]">Última salida: {summary.exported_path}</p> : null}
        </article>
      </section>

      <section className="surface-solid p-6 sm:p-8">
        <div className="flex items-start gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[color:var(--vm-color-warning)]/15 text-[color:var(--vm-color-warning)]"><Icon name="shield" className="h-5 w-5" /></span>
          <div>
            <h3 className="font-semibold">Qué se reentrena y qué no</h3>
            <p className="mt-2 text-sm leading-6 text-[color:var(--vm-color-ink-muted)]">
              El flujo incluido entrena un clasificador local para sugerir la próxima acción conversacional. No modifica automáticamente el LLM, no altera la regla 90/10, no aprueba créditos y no reemplaza el scoring de negocio. Un fine-tuning futuro requeriría un dataset mayor, evaluación separada, aprobación de privacidad y control de versiones.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

function Metric({ label, value }: { readonly label: string; readonly value: number }) {
  return (
    <div className="rounded-[var(--vm-radius-card)] border border-[color:var(--vm-color-line)] bg-white p-4">
      <div className="text-xs uppercase tracking-[.08em] text-[color:var(--vm-color-ink-muted)]">{label}</div>
      <div className="mt-2 text-2xl font-semibold">{value}</div>
    </div>
  );
}

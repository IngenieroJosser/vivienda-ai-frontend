"use client";

import { useMemo, useState } from "react";
import { Icon } from "@/components/icon";
import { Pill } from "@/components/ui";
import { reviewChatRecord } from "@/lib/api/conversations";
import type { ChatLeadRecord } from "@/lib/api/leads";

type ReviewState = "IDLE" | "SAVING" | "SAVED" | "ERROR";

export function ChatLearningPanel({
  records,
}: {
  readonly records: ChatLeadRecord[];
}) {
  const [items, setItems] = useState(records);
  const [states, setStates] = useState<Record<string, ReviewState>>({});
  const summary = useMemo(
    () => ({
      total: items.length,
      reviewed: items.filter((item) => item.reviewed_at).length,
      eligible: items.filter((item) => item.training_eligible).length,
      positive: items.filter((item) => item.feedback_rating === "POSITIVE").length,
    }),
    [items],
  );

  if (!items.length) {
    return (
      <section className="surface-solid p-8 text-center">
        <Icon name="brain" className="mx-auto h-8 w-8 text-[color:var(--vm-color-brand-blue)]" />
        <h2 className="mt-3 text-lg font-semibold">Aún no hay turnos de aprendizaje</h2>
        <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-[color:var(--vm-color-ink-muted)]">
          Cada nuevo intercambio del agente se guardará en ChatLead para revisión humana. Ningún turno se usa para entrenamiento sin una etiqueta explícita.
        </p>
      </section>
    );
  }

  async function submitReview(
    record: ChatLeadRecord,
    rating: "POSITIVE" | "NEGATIVE" | "NEUTRAL",
  ) {
    setStates((current) => ({ ...current, [record.id]: "SAVING" }));
    try {
      const reviewedAt = new Date().toISOString();
      await reviewChatRecord(record.id, {
        rating,
        corrected_next_action:
          rating === "POSITIVE" ? record.next_action : undefined,
        corrected_route: rating === "POSITIVE" ? record.route : undefined,
        outcome: record.observed_outcome ?? "UNKNOWN",
        note:
          rating === "POSITIVE"
            ? "Turno validado por el asesor para aprendizaje supervisado."
            : "Turno marcado para revisión y corrección antes de usarlo.",
        training_eligible: rating === "POSITIVE",
        reviewed_at: reviewedAt,
      });
      setItems((current) =>
        current.map((item) =>
          item.id === record.id
            ? {
                ...item,
                feedback_rating: rating,
                training_eligible: rating === "POSITIVE",
                corrected_next_action:
                  rating === "POSITIVE" ? item.next_action : null,
                corrected_route: rating === "POSITIVE" ? item.route : null,
                reviewed_at: reviewedAt,
                reviewer_note:
                  rating === "POSITIVE"
                    ? "Turno validado por el asesor para aprendizaje supervisado."
                    : "Turno marcado para revisión y corrección antes de usarlo.",
              }
            : item,
        ),
      );
      setStates((current) => ({ ...current, [record.id]: "SAVED" }));
    } catch {
      setStates((current) => ({ ...current, [record.id]: "ERROR" }));
    }
  }

  return (
    <div className="space-y-4">
      <section className="surface-solid p-6 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[.1em] text-[color:var(--vm-color-brand-blue)]">
              <Icon name="brain" className="h-4 w-4" />
              ChatLead
            </div>
            <h2 className="mt-2 text-xl font-semibold">Aprendizaje supervisado del chat</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-[color:var(--vm-color-ink-muted)]">
              Revisa la respuesta, la siguiente acción y la ruta propuesta. Solo los turnos aprobados quedan habilitados para exportación y reentrenamiento del router local.
            </p>
          </div>
          <Pill tone="blue">No entrena automáticamente</Pill>
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Metric label="Turnos" value={summary.total} />
          <Metric label="Revisados" value={summary.reviewed} />
          <Metric label="Elegibles" value={summary.eligible} />
          <Metric label="Aprobados" value={summary.positive} />
        </div>
      </section>

      <section className="surface-solid divide-y divide-[color:var(--vm-color-line)] overflow-hidden">
        {items.map((record) => {
          const state = states[record.id] ?? "IDLE";
          return (
            <article key={record.id} className="p-5 sm:p-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex flex-wrap gap-2">
                  <Pill tone={record.agent_mode === "OPENAI_AGENTS" ? "blue" : "gray"}>
                    {record.agent_mode === "OPENAI_AGENTS" ? "LLM" : "Fallback"}
                  </Pill>
                  <Pill tone="gray">{humanize(record.conversation_state)}</Pill>
                  <Pill>{humanize(record.route)}</Pill>
                  {record.training_eligible ? <Pill tone="green">Elegible</Pill> : null}
                </div>
                <div className="text-right text-xs text-[color:var(--vm-color-ink-muted)]">
                  <div>{formatDate(record.created_at)}</div>
                  <div className="mt-1">{record.latency_ms} ms · {record.input_tokens + record.output_tokens} tokens</div>
                </div>
              </div>

              <div className="mt-4 grid gap-3 lg:grid-cols-2">
                <div className="rounded-[var(--vm-radius-control)] bg-[color:var(--vm-color-brand-blue)] p-4 text-sm leading-6 text-white">
                  <div className="mb-2 text-[11px] font-bold uppercase tracking-[.08em] text-white/70">Prospecto</div>
                  {record.user_message}
                </div>
                <div className="rounded-[var(--vm-radius-control)] border border-[color:var(--vm-color-line)] bg-[color:var(--vm-color-canvas)] p-4 text-sm leading-6">
                  <div className="mb-2 text-[11px] font-bold uppercase tracking-[.08em] text-[color:var(--vm-color-brand-blue)]">Orientador</div>
                  {record.assistant_message}
                </div>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <Fact label="Siguiente acción" value={humanize(record.next_action)} />
                <Fact label="Modelo" value={record.model_name} />
                <Fact label="Prompt" value={record.prompt_version} />
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  disabled={state === "SAVING"}
                  onClick={() => void submitReview(record, "POSITIVE")}
                  className="inline-flex min-h-10 items-center gap-2 rounded-full bg-[color:var(--vm-color-success)] px-4 text-xs font-bold text-white disabled:opacity-50"
                >
                  <Icon name="check" className="h-4 w-4" />
                  Aprobar para aprendizaje
                </button>
                <button
                  type="button"
                  disabled={state === "SAVING"}
                  onClick={() => void submitReview(record, "NEGATIVE")}
                  className="inline-flex min-h-10 items-center gap-2 rounded-full border border-[color:var(--vm-color-line)] px-4 text-xs font-bold text-[color:var(--vm-color-error)] disabled:opacity-50"
                >
                  <Icon name="alert" className="h-4 w-4" />
                  Requiere corrección
                </button>
                {state === "SAVING" ? <span className="text-xs text-[color:var(--vm-color-ink-muted)]">Guardando…</span> : null}
                {state === "SAVED" ? <span className="text-xs font-semibold text-[color:var(--vm-color-success)]">Revisión guardada</span> : null}
                {state === "ERROR" ? <span role="alert" className="text-xs font-semibold text-[color:var(--vm-color-error)]">No fue posible guardar</span> : null}
              </div>
            </article>
          );
        })}
      </section>
    </div>
  );
}

function Metric({ label, value }: { readonly label: string; readonly value: number }) {
  return (
    <div className="rounded-[var(--vm-radius-control)] bg-[color:var(--vm-color-brand-blue)]/[.05] p-4">
      <div className="text-xs uppercase tracking-[.08em] text-[color:var(--vm-color-ink-muted)]">{label}</div>
      <div className="mt-2 text-2xl font-semibold">{value}</div>
    </div>
  );
}

function Fact({ label, value }: { readonly label: string; readonly value: string }) {
  return (
    <div className="rounded-[var(--vm-radius-control)] border border-[color:var(--vm-color-line)] p-3">
      <div className="text-[11px] uppercase tracking-[.08em] text-[color:var(--vm-color-ink-muted)]">{label}</div>
      <div className="mt-1 break-words text-xs font-semibold">{value || "No registrado"}</div>
    </div>
  );
}

function humanize(value: string): string {
  return value.replace(/[_-]/g, " ").toLowerCase().replace(/^./, (letter) => letter.toUpperCase());
}

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Fecha no disponible";
  return new Intl.DateTimeFormat("es-CO", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

"use client";

import { useMemo, useState } from "react";
import { Icon } from "@/components/icon";
import { useQualifiedLeads } from "@/features/conversation/components/use-qualified-leads";
import { isCommercialOpportunity } from "@/features/conversation/qualified-leads";
import {
  appendCommercialActivity,
  commercialStatusLabels,
  createCommercialState,
  type CommercialActivityType,
  type CommercialStatus,
} from "../commercial";
import { useCommercialStates } from "../use-commercial-states";

const ADVISOR_NAME = "Asesor actual";

export function CommercialActions({ leadId }: { leadId: string }) {
  const leads = useQualifiedLeads();
  const qualifiedLead = leads.find(({ scenario }) => scenario.leadId === leadId);
  const { states, save } = useCommercialStates();
  const [note, setNote] = useState("");
  const [followUpAt, setFollowUpAt] = useState("");
  const [feedback, setFeedback] = useState("");
  const now = useMemo(() => new Date().toISOString(), []);

  if (!qualifiedLead || !isCommercialOpportunity(qualifiedLead.evaluation)) {
    return null;
  }

  const state =
    states[leadId] ??
    createCommercialState(leadId, qualifiedLead.scenario.capturedAt);

  function persist(
    type: CommercialActivityType,
    description: string,
    patch: Parameters<typeof appendCommercialActivity>[1] = {
      type,
      description,
      timestamp: new Date().toISOString(),
    },
  ) {
    const updated = appendCommercialActivity(state, {
      ...patch,
      type,
      description,
      timestamp: new Date().toISOString(),
    });
    save(updated);
    setFeedback(description);
  }

  function acceptOpportunity() {
    persist("OPPORTUNITY_ACCEPTED", `Oportunidad aceptada por ${ADVISOR_NAME}.`, {
      type: "OPPORTUNITY_ACCEPTED",
      description: "",
      timestamp: now,
      status: "ASSIGNED",
      assignedTo: ADVISOR_NAME,
    });
  }

  function recordContact() {
    persist("CONTACT_RECORDED", "Contacto registrado por el asesor.", {
      type: "CONTACT_RECORDED",
      description: "",
      timestamp: now,
      status: "CONTACTING",
      firstContact: true,
    });
  }

  function addNote() {
    const cleanNote = note.trim().slice(0, 500);
    if (!cleanNote) return;
    persist("NOTE_ADDED", `Nota: ${cleanNote}`);
    setNote("");
  }

  function scheduleFollowUp() {
    if (!followUpAt) return;
    const timestamp = new Date(followUpAt).toISOString();
    persist("FOLLOW_UP_SCHEDULED", `Seguimiento programado para ${formatDate(timestamp)}.`, {
      type: "FOLLOW_UP_SCHEDULED",
      description: "",
      timestamp: now,
      status: "FOLLOW_UP",
      followUpAt: timestamp,
    });
  }

  function changeStatus(status: CommercialStatus) {
    persist(
      "STATUS_CHANGED",
      `Estado actualizado a ${commercialStatusLabels[status]}.`,
      {
        type: "STATUS_CHANGED",
        description: "",
        timestamp: now,
        status,
      },
    );
  }

  function toggleValidation(
    field: "subsidyValidationRequired" | "financingValidationRequired",
    checked: boolean,
  ) {
    const label = field === "subsidyValidationRequired" ? "subsidio" : "financiación";
    persist(
      "VALIDATION_CHANGED",
      checked
        ? `Se solicitó validación de ${label}.`
        : `Se retiró la validación de ${label}.`,
      {
        type: "VALIDATION_CHANGED",
        description: "",
        timestamp: now,
        [field]: checked,
      },
    );
  }

  return (
    <section className="rounded-[var(--vm-radius-elevated)] border border-[color:var(--vm-color-brand-blue)]/20 bg-[linear-gradient(145deg,#eef8ff,#fffdf0)] p-6 shadow-[var(--vm-shadow-medium)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-[.13em] text-[color:var(--vm-color-brand-blue)]">
            Gestión comercial
          </div>
          <h2 className="mt-2 text-xl font-semibold">
            {commercialStatusLabels[state.status]}
          </h2>
          <p className="mt-1 text-xs text-[color:var(--vm-color-ink-muted)]">
            {state.assignedTo ?? "Sin asesor asignado"}
          </p>
        </div>
        <span className="grid h-10 w-10 place-items-center rounded-full bg-white text-[color:var(--vm-color-brand-blue)] shadow-sm">
          <Icon name="briefcase" className="h-5 w-5" />
        </span>
      </div>

      {!state.assignedTo ? (
        <button
          type="button"
          onClick={acceptOpportunity}
          className="mt-5 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-[color:var(--vm-color-brand-blue)] px-4 text-sm font-bold text-white"
        >
          <Icon name="user" className="h-4 w-4" /> Tomar oportunidad
        </button>
      ) : null}

      <div className="mt-4 grid grid-cols-2 gap-2">
        <button
          type="button"
          disabled
          title="Disponible al integrar el canal corporativo"
          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full border border-[color:var(--vm-color-line)] bg-white text-xs font-semibold text-[color:var(--vm-color-ink-muted)] disabled:cursor-not-allowed disabled:opacity-65"
        >
          <Icon name="phone" className="h-4 w-4" /> WhatsApp
        </button>
        <button
          type="button"
          disabled
          title="Disponible al integrar el canal corporativo"
          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full border border-[color:var(--vm-color-line)] bg-white text-xs font-semibold text-[color:var(--vm-color-ink-muted)] disabled:cursor-not-allowed disabled:opacity-65"
        >
          <Icon name="phone" className="h-4 w-4" /> Llamar
        </button>
      </div>
      <p className="mt-2 text-[10px] leading-4 text-[color:var(--vm-color-ink-muted)]">
        Canales pendientes de identidad y telefonía corporativa. No se muestran
        datos sensibles ficticios.
      </p>

      <button
        type="button"
        onClick={recordContact}
        className="mt-3 inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-full border border-[color:var(--vm-color-brand-blue)]/20 bg-white text-xs font-bold text-[color:var(--vm-color-brand-blue)]"
      >
        <Icon name="check" className="h-4 w-4" /> Registrar contacto realizado
      </button>

      <label className="mt-5 block">
        <span className="text-xs font-semibold">Estado comercial</span>
        <select
          value={state.status}
          onChange={(event) => changeStatus(event.target.value as CommercialStatus)}
          className="mt-2 h-11 w-full rounded-[var(--vm-radius-control)] border border-[color:var(--vm-color-line)] bg-white px-3 text-xs font-semibold"
        >
          {Object.entries(commercialStatusLabels).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
      </label>

      <label className="mt-4 block">
        <span className="text-xs font-semibold">Programar seguimiento</span>
        <div className="mt-2 flex gap-2">
          <input
            type="datetime-local"
            value={followUpAt}
            onChange={(event) => setFollowUpAt(event.target.value)}
            className="min-w-0 flex-1 rounded-[var(--vm-radius-control)] border border-[color:var(--vm-color-line)] bg-white px-3 text-xs"
          />
          <button
            type="button"
            onClick={scheduleFollowUp}
            disabled={!followUpAt}
            aria-label="Guardar seguimiento"
            className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[color:var(--vm-color-brand-blue)] text-white disabled:opacity-40"
          >
            <Icon name="calendar" className="h-4 w-4" />
          </button>
        </div>
      </label>

      <div className="mt-4 space-y-2">
        <ValidationCheck
          label="Requiere validar subsidio"
          checked={state.subsidyValidationRequired}
          onChange={(checked) =>
            toggleValidation("subsidyValidationRequired", checked)
          }
        />
        <ValidationCheck
          label="Requiere validar financiación"
          checked={state.financingValidationRequired}
          onChange={(checked) =>
            toggleValidation("financingValidationRequired", checked)
          }
        />
      </div>

      <label className="mt-4 block">
        <span className="text-xs font-semibold">Nota del asesor</span>
        <textarea
          value={note}
          onChange={(event) => setNote(event.target.value)}
          rows={3}
          maxLength={500}
          placeholder="Registra contexto útil para el siguiente contacto"
          className="mt-2 w-full resize-y rounded-[var(--vm-radius-control)] border border-[color:var(--vm-color-line)] bg-white p-3 text-xs leading-5"
        />
      </label>
      <button
        type="button"
        onClick={addNote}
        disabled={!note.trim()}
        className="mt-2 inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-full border border-[color:var(--vm-color-brand-blue)]/20 bg-white text-xs font-bold text-[color:var(--vm-color-brand-blue)] disabled:opacity-40"
      >
        <Icon name="plus" className="h-4 w-4" /> Añadir nota
      </button>

      {feedback ? (
        <div role="status" className="mt-3 rounded-[var(--vm-radius-control)] bg-white/80 p-3 text-xs text-[color:var(--vm-color-success)]">
          {feedback}
        </div>
      ) : null}

      <div className="mt-5 border-t border-[color:var(--vm-color-line)] pt-4">
        <div className="flex items-center gap-2 text-xs font-semibold">
          <Icon name="history" className="h-4 w-4 text-[color:var(--vm-color-brand-blue)]" />
          Auditoría
        </div>
        <div className="mt-3 max-h-44 space-y-3 overflow-y-auto">
          {state.activities.length ? (
            state.activities.map((activity) => (
              <div key={activity.id} className="border-l-2 border-[color:var(--vm-color-brand-blue)]/20 pl-3">
                <p className="text-xs leading-5">{activity.description}</p>
                <time className="text-[9px] text-[color:var(--vm-color-ink-muted)]">
                  {formatDate(activity.occurredAt)}
                </time>
              </div>
            ))
          ) : (
            <p className="text-xs text-[color:var(--vm-color-ink-muted)]">
              Aún no hay acciones registradas.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

function ValidationCheck({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex min-h-10 items-center gap-3 rounded-[var(--vm-radius-control)] border border-[color:var(--vm-color-line)] bg-white px-3 text-xs font-semibold">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="h-4 w-4 accent-[color:var(--vm-color-brand-blue)]"
      />
      {label}
    </label>
  );
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("es-CO", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

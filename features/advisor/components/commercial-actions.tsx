"use client";

import { useState } from "react";
import { Icon } from "@/components/icon";
import { useQualifiedLeads } from "@/features/conversation/components/use-qualified-leads";
import { isCommercialOpportunity } from "@/features/conversation/qualified-leads";
import {
  appendCommercialActivity,
  commercialStatusLabels,
  createCommercialState,
  type CommercialActivityType,
  type CommercialStatus,
  type CommercialOpportunityState,
} from "../commercial";
import { useCommercialStates } from "../use-commercial-states";
import { getCommercialWorkflow } from "../workflow";

const ADVISOR_NAME = "Asesor actual";

export function CommercialActions({ leadId }: { leadId: string }) {
  const leads = useQualifiedLeads();
  const qualifiedLead = leads.find(({ scenario }) => scenario.leadId === leadId);
  const { states, status, save, retry } = useCommercialStates();
  const [note, setNote] = useState("");
  const [followUpAt, setFollowUpAt] = useState("");
  const [feedback, setFeedback] = useState("");

  if (!qualifiedLead || !isCommercialOpportunity(qualifiedLead.evaluation)) {
    return null;
  }

  const state =
    states[leadId] ??
    createCommercialState(leadId, qualifiedLead.scenario.capturedAt);
  const isAssigned = Boolean(state.assignedTo);
  const hasFirstContact = Boolean(state.firstContactAt);
  const workflow = getCommercialWorkflow(state);

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
    const saved = save(updated);
    setFeedback(
      saved
        ? description
        : "No pudimos guardar la acción. Puedes intentar nuevamente.",
    );
  }

  function acceptOpportunity() {
    const timestamp = new Date().toISOString();
    persist("OPPORTUNITY_ACCEPTED", `Oportunidad aceptada por ${ADVISOR_NAME}.`, {
      type: "OPPORTUNITY_ACCEPTED",
      description: "",
      timestamp,
      status: "ASSIGNED",
      assignedTo: ADVISOR_NAME,
    });
  }

  function recordContact() {
    const timestamp = new Date().toISOString();
    persist("CONTACT_RECORDED", "Contacto registrado por el asesor.", {
      type: "CONTACT_RECORDED",
      description: "",
      timestamp,
      status: "IN_PROGRESS",
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
    const occurredAt = new Date().toISOString();
    persist("FOLLOW_UP_SCHEDULED", `Seguimiento programado para ${formatDate(timestamp)}.`, {
      type: "FOLLOW_UP_SCHEDULED",
      description: "",
      timestamp: occurredAt,
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
        timestamp: new Date().toISOString(),
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
        timestamp: new Date().toISOString(),
        [field]: checked,
      },
    );
  }

  return (
    <section className="surface-guidance rounded-[var(--vm-radius-elevated)] border border-[color:var(--vm-color-brand-blue)]/20 p-6 shadow-[var(--vm-shadow-medium)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-xs font-bold uppercase tracking-[.1em] text-[color:var(--vm-color-brand-blue)]">
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

      {status === "ERROR" ? (
        <div role="alert" className="mt-4 rounded-[var(--vm-radius-control)] border border-[color:var(--vm-color-error)]/20 bg-[color:var(--vm-color-error-soft)] p-3 text-xs text-[color:var(--vm-color-error)]">
          La acción quedó pendiente en esta pantalla y no se guardó localmente.
          <button type="button" onClick={retry} className="ml-2 font-bold underline">Intentar nuevamente</button>
        </div>
      ) : null}

      <div className="advisor-management-flow">
        <div className="advisor-management-flow__current">
          <span>Paso actual</span>
          <strong>{workflow.title}</strong>
          <p>{workflow.description}</p>
        </div>

        {!isAssigned ? (
          <button
            type="button"
            onClick={acceptOpportunity}
            className="advisor-management-flow__primary"
          >
            <Icon name="user" className="h-4 w-4" />
            Tomar esta oportunidad
          </button>
        ) : null}

        {isAssigned && !hasFirstContact ? (
          <section className="advisor-management-flow__section">
            <div className="advisor-management-flow__section-heading">
              <span>2</span>
              <div>
                <strong>Contacta al prospecto</strong>
                <p>
                  El contacto se realiza fuera de este portal y debe registrarse aquí
                  para conservar la trazabilidad de la oportunidad.
                  Regístralo cuando haya finalizado.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={recordContact}
              className="advisor-management-flow__primary"
            >
              <Icon name="check" className="h-4 w-4" />
              Confirmar primer contacto
            </button>
          </section>
        ) : null}

        {hasFirstContact ? (
          <PostContactManagement
            key={state.status}
            state={state}
            followUpAt={followUpAt}
            onFollowUpChange={setFollowUpAt}
            onStatusChange={changeStatus}
            onSchedule={scheduleFollowUp}
            onValidationChange={toggleValidation}
          />
        ) : null}

        {isAssigned ? (
          <details className="advisor-management-flow__additional">
            <summary>
              <span>
                <Icon name="plus" className="h-4 w-4" />
                Añadir información complementaria
              </span>
              <Icon name="chevron" className="h-4 w-4" />
            </summary>
            <label>
              <span>Nota del asesor</span>
              <textarea
                value={note}
                onChange={(event) => setNote(event.target.value)}
                rows={3}
                maxLength={500}
                placeholder="Registra contexto útil para el siguiente contacto"
              />
            </label>
            <button
              type="button"
              onClick={addNote}
              disabled={!note.trim()}
            >
              Guardar nota
            </button>
          </details>
        ) : null}
      </div>

      {feedback ? (
        <div role="status" className="advisor-toast mt-3 rounded-[var(--vm-radius-control)] bg-white/80 p-3 text-xs text-[color:var(--vm-color-success)]">
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
                <time className="text-[11px] text-[color:var(--vm-color-ink-muted)]">
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
  disabled,
  onChange,
}: {
  label: string;
  checked: boolean;
  disabled?: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className={`flex min-h-10 items-center gap-3 rounded-[var(--vm-radius-control)] border border-[color:var(--vm-color-line)] bg-white px-3 text-xs font-semibold ${disabled ? "cursor-not-allowed opacity-50" : ""}`}>
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(event) => onChange(event.target.checked)}
        className="h-4 w-4 accent-[color:var(--vm-color-brand-blue)]"
      />
      {label}
    </label>
  );
}

function PostContactManagement({
  state,
  followUpAt,
  onFollowUpChange,
  onStatusChange,
  onSchedule,
  onValidationChange,
}: {
  state: CommercialOpportunityState;
  followUpAt: string;
  onFollowUpChange: (value: string) => void;
  onStatusChange: (status: CommercialStatus) => void;
  onSchedule: () => void;
  onValidationChange: (
    field: "subsidyValidationRequired" | "financingValidationRequired",
    checked: boolean,
  ) => void;
}) {
  const [result, setResult] = useState<CommercialStatus>(state.status);
  const terminal = ["CLOSED_WON", "CLOSED_LOST", "OPTED_OUT"].includes(
    state.status,
  );
  const resultRecorded = !["ASSIGNED", "IN_PROGRESS"].includes(state.status);

  if (terminal) {
    return (
      <div className="advisor-management-flow__complete">
        <Icon name="check" className="h-5 w-5" />
        <div>
          <strong>Gestión finalizada como {commercialStatusLabels[state.status]}</strong>
          <p>El historial conserva las acciones y decisiones registradas.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <section className="advisor-management-flow__section">
        <div className="advisor-management-flow__section-heading">
          <span>3</span>
          <div>
            <strong>Registra el resultado</strong>
            <p>Selecciona el avance real después del contacto.</p>
          </div>
        </div>
        <label className="advisor-management-flow__field">
          <span>Resultado del contacto</span>
          <select
            value={result}
            onChange={(event) =>
              setResult(event.target.value as CommercialStatus)
            }
          >
            {Object.entries(commercialStatusLabels)
              .filter(([value]) => value !== "PENDING" && value !== "ASSIGNED")
              .map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
          </select>
        </label>
        <button
          type="button"
          onClick={() => onStatusChange(result)}
          disabled={result === state.status}
          className="advisor-management-flow__secondary"
        >
          Guardar resultado
        </button>
      </section>

      {resultRecorded ? (
        <section className="advisor-management-flow__section">
          <div className="advisor-management-flow__section-heading">
            <span>4</span>
            <div>
              <strong>Define la próxima actividad</strong>
              <p>Programa una fecha concreta para mantener la continuidad.</p>
            </div>
          </div>
          <label className="advisor-management-flow__field">
            <span>Fecha y hora del seguimiento</span>
            <input
              type="datetime-local"
              value={followUpAt}
              onChange={(event) => onFollowUpChange(event.target.value)}
            />
          </label>
          <button
            type="button"
            onClick={onSchedule}
            disabled={!followUpAt}
            className="advisor-management-flow__primary"
          >
            <Icon name="calendar" className="h-4 w-4" />
            Programar seguimiento
          </button>
          <div className="advisor-management-flow__validations">
            <span>Validaciones necesarias</span>
            <ValidationCheck
              label="Validar subsidio"
              checked={state.subsidyValidationRequired}
              onChange={(checked) =>
                onValidationChange("subsidyValidationRequired", checked)
              }
            />
            <ValidationCheck
              label="Validar financiación"
              checked={state.financingValidationRequired}
              onChange={(checked) =>
                onValidationChange("financingValidationRequired", checked)
              }
            />
          </div>
        </section>
      ) : null}
    </>
  );
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("es-CO", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

"use client";

import { useRef, useState } from "react";
import { Icon } from "@/components/icon";
import { useQualifiedLeads } from "@/features/conversation/components/use-qualified-leads";
import { isCommercialOpportunity } from "@/features/conversation/qualified-leads";
import type { CommercialActivityInput } from "@/lib/api/leads";
import {
  claimLeadAndRefresh,
  createActivityAndRefresh,
  type CommercialLeadSnapshot,
} from "@/lib/api/commercial-operations";
import { getCommercialErrorMessage } from "@/lib/api/commercial-errors";
import {
  applyBackendWorkflow,
  appendCommercialActivity,
  commercialStatusLabels,
  createCommercialStateForLead,
  type CommercialActivityType,
  type CommercialStatus,
  type CommercialOpportunityState,
} from "../commercial";
import { useCommercialStates } from "../use-commercial-states";
import { getCommercialWorkflow } from "../workflow";
import {
  resolveActivityAttempt,
  type ActivityAttempt,
} from "../commercial-ui-model";

const ADVISOR_NAME = "Asesor actual";

export function CommercialActions({
  leadId,
  onCanonicalChange,
}: {
  leadId: string;
  onCanonicalChange?: (snapshot: CommercialLeadSnapshot) => void;
}) {
  const leads = useQualifiedLeads();
  const qualifiedLead = leads.find(({ scenario }) => scenario.leadId === leadId);
  const { states, status, save, retry } = useCommercialStates();
  const [note, setNote] = useState("");
  const [followUpAt, setFollowUpAt] = useState("");
  const [feedback, setFeedback] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const activityAttemptRef = useRef<ActivityAttempt | null>(null);

  if (!qualifiedLead || !isCommercialOpportunity(qualifiedLead.evaluation)) {
    return null;
  }

  const baseline = createCommercialStateForLead(qualifiedLead);
  const state = states[leadId]
    ? { ...baseline, ...states[leadId] }
    : baseline;
  const isAssigned = Boolean(state.assignedTo);
  const hasFirstContact = Boolean(state.firstContactAt);
  const workflow = getCommercialWorkflow(state);
  const contactChannel = preferredContactChannel(
    qualifiedLead.evaluation.profileSnapshot.preferredChannel,
  );
  const backendConnected =
    qualifiedLead.source === "BACKEND" &&
    typeof state.backendWorkflowVersion === "number";

  function buildLocalUpdate(
    type: CommercialActivityType,
    description: string,
    patch: Parameters<typeof appendCommercialActivity>[1] = {
      type,
      description,
      timestamp: new Date().toISOString(),
    },
  ) {
    return appendCommercialActivity(state, {
      ...patch,
      type,
      description,
      timestamp: new Date().toISOString(),
    });
  }

  function persistLocal(
    type: CommercialActivityType,
    description: string,
    patch?: Parameters<typeof appendCommercialActivity>[1],
  ) {
    const updated = buildLocalUpdate(type, description, patch);
    const saved = save(updated);
    setFeedback(
      saved
        ? description
        : "No pudimos guardar la acción. Puedes intentar nuevamente.",
    );
  }

  async function persistBackendActivity(
    input: Omit<
      CommercialActivityInput,
      "expected_workflow_version" | "managed_at" | "channel"
    >,
    updated: CommercialOpportunityState,
    successMessage: string,
  ) {
    if (!state.backendWorkflowVersion) return;
    setSubmitting(true);
    setFeedback("");
    const attempt = resolveActivityAttempt(
      activityAttemptRef.current,
      {
        activityType: input.activity_type,
        channel: contactChannel,
        result: input.result,
        note: input.note ?? "",
        workflowVersion: state.backendWorkflowVersion,
      },
      () => `advisor-${crypto.randomUUID()}`,
    );
    activityAttemptRef.current = attempt;
    try {
      const snapshot = await createActivityAndRefresh(
        leadId,
        {
          ...input,
          channel: contactChannel,
          managed_at: attempt.managedAt,
          expected_workflow_version: state.backendWorkflowVersion,
        },
        attempt.key,
      );
      activityAttemptRef.current = null;
      save(applyBackendWorkflow(updated, snapshot.workflow));
      onCanonicalChange?.(snapshot);
      setFeedback(successMessage);
    } catch (error) {
      setFeedback(getCommercialErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  }

  async function acceptOpportunity() {
    const timestamp = new Date().toISOString();
    const description = `Oportunidad aceptada por ${ADVISOR_NAME}.`;
    const updated = buildLocalUpdate("OPPORTUNITY_ACCEPTED", description, {
      type: "OPPORTUNITY_ACCEPTED",
      description: "",
      timestamp,
      status: "ASSIGNED",
      assignedTo: ADVISOR_NAME,
    });
    if (!backendConnected) {
      persistLocal("OPPORTUNITY_ACCEPTED", description, {
        type: "OPPORTUNITY_ACCEPTED",
        description: "",
        timestamp,
        status: "ASSIGNED",
        assignedTo: ADVISOR_NAME,
      });
      return;
    }
    setSubmitting(true);
    setFeedback("");
    try {
      const snapshot = await claimLeadAndRefresh(leadId);
      save(applyBackendWorkflow(updated, snapshot.workflow));
      onCanonicalChange?.(snapshot);
      setFeedback(description);
    } catch (error) {
      setFeedback(getCommercialErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  }

  function recordContact() {
    const timestamp = new Date().toISOString();
    const description = "Contacto registrado por el asesor.";
    const updated = buildLocalUpdate("CONTACT_RECORDED", description, {
      type: "CONTACT_RECORDED",
      description: "",
      timestamp,
      status: "CONTACTING",
      firstContact: true,
    });
    if (!backendConnected) {
      persistLocal("CONTACT_RECORDED", description, {
        type: "CONTACT_RECORDED",
        description: "",
        timestamp,
        status: "CONTACTING",
        firstContact: true,
      });
      return;
    }
    void persistBackendActivity(
      {
        activity_type: "CONTACT_SUCCESS",
        result: "Primer contacto confirmado",
        note: "El asesor confirmó el contacto con el prospecto.",
      },
      updated,
      description,
    );
  }

  function addNote() {
    const cleanNote = note.trim().slice(0, 500);
    if (!cleanNote) return;
    const description = `Nota: ${cleanNote}`;
    const updated = buildLocalUpdate("NOTE_ADDED", description);
    setNote("");
    if (!backendConnected) {
      persistLocal("NOTE_ADDED", description);
      return;
    }
    void persistBackendActivity(
      {
        activity_type: "NOTE",
        result: "Nota comercial registrada",
        note: cleanNote,
      },
      updated,
      "Nota guardada en la trazabilidad del lead.",
    );
  }

  function scheduleFollowUp() {
    if (!followUpAt) return;
    const timestamp = new Date(followUpAt).toISOString();
    const occurredAt = new Date().toISOString();
    const description = `Seguimiento programado para ${formatDate(timestamp)}.`;
    const updated = buildLocalUpdate("FOLLOW_UP_SCHEDULED", description, {
      type: "FOLLOW_UP_SCHEDULED",
      description: "",
      timestamp: occurredAt,
      status: "FOLLOW_UP",
      followUpAt: timestamp,
    });
    if (!backendConnected) {
      persistLocal("FOLLOW_UP_SCHEDULED", description, {
        type: "FOLLOW_UP_SCHEDULED",
        description: "",
        timestamp: occurredAt,
        status: "FOLLOW_UP",
        followUpAt: timestamp,
      });
      return;
    }
    void persistBackendActivity(
      {
        activity_type: "FOLLOW_UP_SCHEDULED",
        result: "Seguimiento acordado",
        next_follow_up_at: timestamp,
        note: description,
      },
      updated,
      description,
    );
  }

  function changeStatus(status: CommercialStatus) {
    const description =
      `Estado actualizado a ${commercialStatusLabels[status]}.`;
    const updated = buildLocalUpdate(
      "STATUS_CHANGED",
      description,
      {
        type: "STATUS_CHANGED",
        description: "",
        timestamp: new Date().toISOString(),
        status,
      },
    );
    if (!backendConnected) {
      persistLocal("STATUS_CHANGED", description, {
        type: "STATUS_CHANGED",
        description: "",
        timestamp: new Date().toISOString(),
        status,
      });
      return;
    }
    const backendActivity = backendActivityForStatus(status, followUpAt);
    if (!backendActivity) {
      setFeedback(
        "Para visita, seguimiento o aplazamiento define primero una fecha y hora.",
      );
      return;
    }
    void persistBackendActivity(
      {
        ...backendActivity,
        result: commercialStatusLabels[status],
        note: description,
      },
      updated,
      description,
    );
  }

  function toggleValidation(
    field: "subsidyValidationRequired" | "financingValidationRequired",
    checked: boolean,
  ) {
    const label = field === "subsidyValidationRequired" ? "subsidio" : "financiación";
    const description = checked
      ? `Se solicitó validación de ${label}.`
      : `Se retiró la validación de ${label}.`;
    const updated = buildLocalUpdate(
      "VALIDATION_CHANGED",
      description,
      {
        type: "VALIDATION_CHANGED",
        description: "",
        timestamp: new Date().toISOString(),
        [field]: checked,
      },
    );
    if (!backendConnected) {
      persistLocal("VALIDATION_CHANGED", description, {
        type: "VALIDATION_CHANGED",
        description: "",
        timestamp: new Date().toISOString(),
        [field]: checked,
      });
      return;
    }
    void persistBackendActivity(
      {
        activity_type: "NOTE",
        result: "Validación comercial actualizada",
        note: description,
      },
      updated,
      description,
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
          {backendConnected ? (
            <p className="mt-1 text-[11px] font-semibold text-[color:var(--vm-color-success)]">
              Sincronizado con el backend
            </p>
          ) : null}
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

      <div
        className={`advisor-management-flow ${submitting ? "pointer-events-none opacity-70" : ""}`}
        aria-busy={submitting}
      >
        <div className="advisor-management-flow__current">
          <span>Paso actual</span>
          <strong>{workflow.title}</strong>
          <p>{workflow.description}</p>
        </div>

        {!isAssigned ? (
          <button
            type="button"
            onClick={acceptOpportunity}
            disabled={submitting}
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
              disabled={submitting}
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
            disabled={submitting}
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
              disabled={!note.trim() || submitting}
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
  disabled,
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
  disabled: boolean;
}) {
  const [result, setResult] = useState<CommercialStatus>(state.status);
  const terminal = ["WON", "DEFERRED", "NOT_VIABLE"].includes(state.status);
  const resultRecorded = !["ASSIGNED", "CONTACTING"].includes(state.status);

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
              .filter(([value]) => value !== "NEW" && value !== "ASSIGNED")
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
          disabled={result === state.status || disabled}
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
            disabled={!followUpAt || disabled}
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
              disabled={disabled}
              onChange={(checked) =>
                onValidationChange("subsidyValidationRequired", checked)
              }
            />
            <ValidationCheck
              label="Validar financiación"
              checked={state.financingValidationRequired}
              disabled={disabled}
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

function preferredContactChannel(
  value: string | undefined,
): CommercialActivityInput["channel"] {
  if (value === "WHATSAPP" || value === "EMAIL" || value === "PHONE") {
    return value;
  }
  return "PHONE";
}

function backendActivityForStatus(
  status: CommercialStatus,
  followUpAt: string,
): Pick<CommercialActivityInput, "activity_type" | "next_follow_up_at"> | null {
  if (status === "WON") {
    return { activity_type: "CLOSED_WON", next_follow_up_at: null };
  }
  if (status === "NOT_VIABLE") {
    return { activity_type: "CLOSED_LOST", next_follow_up_at: null };
  }
  if (status === "FOLLOW_UP" || status === "DEFERRED") {
    if (!followUpAt) return null;
    return {
      activity_type: "FOLLOW_UP_SCHEDULED",
      next_follow_up_at: new Date(followUpAt).toISOString(),
    };
  }
  if (status === "VISIT") {
    if (!followUpAt) return null;
    return {
      activity_type: "APPOINTMENT_SCHEDULED",
      next_follow_up_at: new Date(followUpAt).toISOString(),
    };
  }
  return { activity_type: "CONTACT_SUCCESS", next_follow_up_at: null };
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("es-CO", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

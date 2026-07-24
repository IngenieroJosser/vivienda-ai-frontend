"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import Link from "next/link";
import { Icon } from "@/components/icon";
import { PublicFlowShell } from "@/components/public-flow-shell";
import { getHousingProject } from "@/lib/housing-catalog";
import {
  contactChannelLabels,
  contactTimeLabels,
  createContactRequest,
  isEligibleForContactRequest,
  validateContactRequest,
  type ContactChannel,
  type ContactRequestInput,
  type ContactRequestValidation,
  type ContactTimePreference,
  type ProspectContactRequest,
} from "../handoff";
import {
  loadContactRequest,
  saveContactRequest,
} from "../handoff-storage";
import { createFunnelEvent, trackFunnelEvent } from "../analytics";
import type { ProspectSession } from "../domain";
import { loadProspectSessionResult } from "../storage";

const channels: Array<{
  id: ContactChannel;
  icon: "phone" | "mail";
  description: string;
}> = [
  {
    id: "WHATSAPP",
    icon: "phone",
    description: "Al número asociado a tu solicitud",
  },
  {
    id: "PHONE",
    icon: "phone",
    description: "Una llamada de nuestro equipo de vivienda",
  },
  {
    id: "EMAIL",
    icon: "mail",
    description: "Al correo asociado a tu solicitud",
  },
];

const timePreferences = Object.entries(contactTimeLabels) as Array<
  [ContactTimePreference, string]
>;

const initialPreferences: ContactRequestInput = {
  channel: "WHATSAPP",
  timePreference: "WEEKDAY_MORNING",
  authorizesContact: false,
  authorizesInformationSharing: false,
};

export function ProspectHandoff({ sessionId }: { sessionId?: string }) {
  const [session, setSession] = useState<ProspectSession>();
  const [request, setRequest] = useState<ProspectContactRequest>();
  const [loaded, setLoaded] = useState(false);
  const [preferences, setPreferences] =
    useState<ContactRequestInput>(initialPreferences);
  const [errors, setErrors] = useState<ContactRequestValidation>({});
  const [submitting, setSubmitting] = useState(false);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (sessionId) {
        const result = loadProspectSessionResult(sessionId);
        if (result.status === "FOUND") {
          setSession(result.session);
          const storedRequest = loadContactRequest(sessionId);
          setRequest(storedRequest);
          if (storedRequest) {
            setPreferences({
              channel: storedRequest.channel,
              timePreference: storedRequest.timePreference,
              authorizesContact: true,
              authorizesInformationSharing: true,
            });
          }
        }
      }
      setLoaded(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [sessionId]);

  function updatePreference<Key extends keyof ContactRequestInput>(
    key: Key,
    value: ContactRequestInput[Key],
  ) {
    setPreferences((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({
      ...current,
      ...(key === "channel" ? { channel: undefined } : {}),
      ...(key === "timePreference" ? { timePreference: undefined } : {}),
      ...(["authorizesContact", "authorizesInformationSharing"].includes(key)
        ? { authorizations: undefined }
        : {}),
    }));
  }

  function submitRequest() {
    if (!session || submitting) return;
    const nextErrors = validateContactRequest(preferences);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setSubmitting(true);
    const timestamp = new Date().toISOString();
    const nextRequest = createContactRequest({
      session,
      preferences,
      timestamp,
      existing: request,
    });
    saveContactRequest(nextRequest);
    if (!request) {
      trackFunnelEvent(
        createFunnelEvent({
          name: "CONTACT_REQUEST_CREATED",
          acquisition: session.acquisition,
          sessionId: session.id,
          occurredAt: timestamp,
        }),
      );
    }
    setRequest(nextRequest);
    setEditing(false);
    setSubmitting(false);
  }

  if (!loaded) {
    return <HandoffState title="Recuperando tu orientación…" description="Estamos preparando el siguiente paso." />;
  }
  if (!sessionId || !session) {
    return <HandoffState title="No encontramos la orientación." description="Abre esta página desde el resultado de tu conversación para solicitar contacto." action={{ href: "/orientacion", label: "Volver a orientación" }} />;
  }
  if (!isEligibleForContactRequest(session)) {
    return <HandoffState title="Esta orientación todavía no habilita contacto." description="Continúa tu conversación o revisa el plan de preparación sugerido para ti." action={{ href: `/orientacion/resultado/${session.id}`, label: "Ver mi resultado" }} />;
  }
  if (request && !editing) {
    return <RequestConfirmation session={session} request={request} onEdit={() => setEditing(true)} />;
  }

  const projects = session.evaluation?.projectMatches
    .map(({ projectId }) => getHousingProject(projectId))
    .filter((project) => project !== undefined) ?? [];

  return (
    <PublicFlowShell
      eyebrow="Siguiente paso"
      title="Solicita que te contactemos."
      description="Elige cómo y cuándo prefieres conversar. Un asesor revisará tu orientación antes de comunicarse contigo."
    >
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
        <form
          className="flow-panel p-6 sm:p-8 lg:p-9"
          onSubmit={(event) => {
            event.preventDefault();
            submitRequest();
          }}
          noValidate
        >
          <fieldset>
            <legend className="text-xl font-semibold tracking-[-.025em]">
              ¿Por qué canal prefieres que te contactemos?
            </legend>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {channels.map((channel) => {
                const active = preferences.channel === channel.id;
                return (
                  <label
                    key={channel.id}
                    className={`flex min-h-24 cursor-pointer items-start gap-3 rounded-[var(--vm-radius-control)] border p-4 transition ${
                      active
                        ? "border-[color:var(--vm-color-brand-blue)] bg-[color:var(--vm-color-brand-blue)]/[.06]"
                        : "border-[color:var(--vm-color-line)] bg-white hover:border-[color:var(--vm-color-brand-blue)]/40"
                    }`}
                  >
                    <input
                      type="radio"
                      name="channel"
                      value={channel.id}
                      checked={active}
                      onChange={() => updatePreference("channel", channel.id)}
                      className="sr-only"
                    />
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[color:var(--vm-color-brand-yellow)]/25 text-[color:var(--vm-color-brand-blue)]">
                      <Icon name={channel.icon} className="h-4 w-4" />
                    </span>
                    <span>
                      <span className="block text-sm font-bold">
                        {contactChannelLabels[channel.id]}
                      </span>
                      <span className="mt-1 block text-xs leading-5 text-[color:var(--vm-color-ink-muted)]">
                        {channel.description}
                      </span>
                    </span>
                  </label>
                );
              })}
            </div>
            {errors.channel ? <FieldError>{errors.channel}</FieldError> : null}
          </fieldset>

          <fieldset className="mt-8 border-t border-[color:var(--vm-color-line)] pt-8">
            <legend className="text-xl font-semibold tracking-[-.025em]">
              ¿En qué momento te queda mejor?
            </legend>
            <p className="mt-2 text-sm leading-6 text-[color:var(--vm-color-ink-muted)]">
              Es una preferencia de contacto, no una cita confirmada.
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {timePreferences.map(([id, label]) => (
                <label
                  key={id}
                  className={`flex min-h-12 cursor-pointer items-center gap-3 rounded-[var(--vm-radius-control)] border px-4 py-3 text-sm font-semibold transition ${
                    preferences.timePreference === id
                      ? "border-[color:var(--vm-color-brand-blue)] bg-[color:var(--vm-color-brand-blue)]/[.06] text-[color:var(--vm-color-brand-blue)]"
                      : "border-[color:var(--vm-color-line)] bg-white"
                  }`}
                >
                  <input
                    type="radio"
                    name="timePreference"
                    value={id}
                    checked={preferences.timePreference === id}
                    onChange={() => updatePreference("timePreference", id)}
                    className="h-4 w-4 accent-[color:var(--vm-color-brand-blue)]"
                  />
                  {label}
                </label>
              ))}
            </div>
            {errors.timePreference ? (
              <FieldError>{errors.timePreference}</FieldError>
            ) : null}
          </fieldset>

          <fieldset className="mt-8 border-t border-[color:var(--vm-color-line)] pt-8">
            <legend className="text-xl font-semibold tracking-[-.025em]">
              Autoriza el envío de tu solicitud
            </legend>
            <div className="mt-4 space-y-3">
              <Authorization
                checked={preferences.authorizesContact}
                onChange={(checked) =>
                  updatePreference("authorizesContact", checked)
                }
              >
                Autorizo a Colsubsidio a contactarme por el canal seleccionado
                para continuar mi orientación de vivienda.
              </Authorization>
              <Authorization
                checked={preferences.authorizesInformationSharing}
                onChange={(checked) =>
                  updatePreference("authorizesInformationSharing", checked)
                }
              >
                Autorizo compartir con el equipo de vivienda la información
                resumida en esta página.
              </Authorization>
            </div>
            {errors.authorizations ? (
              <FieldError>{errors.authorizations}</FieldError>
            ) : null}
          </fieldset>

          <button
            type="submit"
            disabled={submitting}
            className="mt-8 inline-flex min-h-13 w-full items-center justify-center gap-2 rounded-full bg-[color:var(--vm-color-brand-blue)] px-6 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-[color:var(--vm-color-brand-blue-deep)] focus-visible:outline-none focus-visible:shadow-[var(--vm-shadow-focus)] disabled:cursor-wait disabled:opacity-65 sm:w-auto"
          >
            {submitting ? "Guardando solicitud…" : "Enviar solicitud"}
            <Icon name={submitting ? "clock" : "arrow"} className="h-4 w-4" />
          </button>
        </form>

        <aside className="space-y-4 xl:sticky xl:top-6 xl:self-start">
          <section className="surface-solid p-6">
            <div className="text-xs font-bold uppercase tracking-[.08em] text-[color:var(--vm-color-brand-blue)]">
              Información que compartiremos
            </div>
            <ul className="mt-4 space-y-3 text-sm leading-6">
              {[
                "Resumen de lo que buscas y tu horizonte de compra.",
                "Capacidad mensual estimada y factores que la sustentan.",
                "Beneficios confirmados y aquellos por validar.",
                "Proyectos recomendados y razones de coincidencia.",
                "Conversación completa como soporte de tu orientación.",
              ].map((item) => (
                <li key={item} className="flex gap-2">
                  <Icon name="check" className="mt-1 h-4 w-4 shrink-0 text-[color:var(--vm-color-success)]" />
                  {item}
                </li>
              ))}
            </ul>
          </section>

          <section className="surface-guidance rounded-[var(--vm-radius-card)] border border-[color:var(--vm-color-brand-blue)]/15 p-6">
            <div className="text-xs font-bold uppercase tracking-[.08em] text-[color:var(--vm-color-brand-blue)]">
              Proyectos de tu orientación
            </div>
            <div className="mt-4 space-y-3">
              {projects.map((project, index) => (
                <div key={project.id} className="flex items-center gap-3">
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-white text-xs font-bold text-[color:var(--vm-color-brand-blue)]">
                    {index + 1}
                  </span>
                  <span className="text-sm font-semibold">{project.name}</span>
                </div>
              ))}
            </div>
          </section>
        </aside>
      </div>
    </PublicFlowShell>
  );
}

function Authorization({
  checked,
  onChange,
  children,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  children: ReactNode;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-3 rounded-[var(--vm-radius-control)] border border-[color:var(--vm-color-line)] bg-white p-4">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="mt-1 h-4 w-4 shrink-0 accent-[color:var(--vm-color-brand-blue)]"
      />
      <span className="text-sm leading-6">{children}</span>
    </label>
  );
}

function FieldError({ children }: { children: ReactNode }) {
  return (
    <p className="mt-3 flex items-center gap-2 text-xs font-semibold text-[color:var(--vm-color-danger)]" role="alert">
      <Icon name="alert" className="h-4 w-4 shrink-0" />
      {children}
    </p>
  );
}

function RequestConfirmation({
  session,
  request,
  onEdit,
}: {
  session: ProspectSession;
  request: ProspectContactRequest;
  onEdit: () => void;
}) {
  return (
    <PublicFlowShell
      eyebrow="Solicitud recibida"
      title="Tu solicitud ya está en proceso."
      description="Conservamos tus preferencias en este dispositivo para que puedas consultar el estado y retomarlas cuando lo necesites."
    >
      <section className="surface-guidance mx-auto max-w-3xl rounded-[var(--vm-radius-elevated)] border border-[color:var(--vm-color-brand-blue)]/15 p-6 shadow-[var(--vm-shadow-medium)] sm:p-9">
        <div className="flex items-start gap-4">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-[color:var(--vm-color-success)] text-white">
            <Icon name="check" />
          </span>
          <div>
            <div className="text-xs font-bold uppercase tracking-[.08em] text-[color:var(--vm-color-success)]">
              Estado · pendiente de revisión
            </div>
            <h2 className="mt-2 text-2xl font-semibold tracking-[-.03em]">
              El equipo de vivienda recibió tu preferencia.
            </h2>
            <p className="mt-3 text-sm leading-6 text-[color:var(--vm-color-ink-muted)]">
              Un asesor deberá revisar la orientación y confirmar el contacto.
              Esta solicitud todavía no representa una cita asignada.
            </p>
          </div>
        </div>

        <dl className="mt-8 grid gap-3 sm:grid-cols-2">
          <SummaryItem label="Canal preferido" value={contactChannelLabels[request.channel]} />
          <SummaryItem label="Horario preferido" value={contactTimeLabels[request.timePreference]} />
          <SummaryItem label="Referencia" value={request.id} />
          <SummaryItem
            label="Solicitud registrada"
            value={new Intl.DateTimeFormat("es-CO", {
              dateStyle: "medium",
              timeStyle: "short",
              timeZone: "America/Bogota",
            }).format(new Date(request.createdAt))}
          />
        </dl>

        <div className="mt-8 flex flex-col gap-3 border-t border-[color:var(--vm-color-line)] pt-6 sm:flex-row">
          <Link
            href={`/orientacion/resultado/${session.id}`}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[color:var(--vm-color-brand-blue)] px-6 text-sm font-bold text-white"
          >
            Ver mi orientación <Icon name="arrow" className="h-4 w-4" />
          </Link>
          <button
            type="button"
            onClick={onEdit}
            className="inline-flex min-h-12 items-center justify-center rounded-full border border-[color:var(--vm-color-brand-blue)]/25 px-6 text-sm font-bold text-[color:var(--vm-color-brand-blue)]"
          >
            Cambiar preferencias
          </button>
        </div>
      </section>
    </PublicFlowShell>
  );
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[var(--vm-radius-control)] bg-white p-4">
      <dt className="text-xs font-bold uppercase tracking-[.08em] text-[color:var(--vm-color-ink-muted)]">
        {label}
      </dt>
      <dd className="mt-2 break-words text-sm font-semibold">{value}</dd>
    </div>
  );
}

function HandoffState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: { href: string; label: string };
}) {
  return (
    <div className="grid min-h-screen place-items-center bg-[color:var(--vm-color-canvas)] px-5">
      <section className="surface-solid max-w-lg p-8 text-center">
        <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-[color:var(--vm-color-brand-blue)]/10 text-[color:var(--vm-color-brand-blue)]">
          <Icon name="home" />
        </span>
        <h1 className="mt-5 text-2xl font-semibold">{title}</h1>
        <p className="mt-3 text-sm leading-6 text-[color:var(--vm-color-ink-muted)]">
          {description}
        </p>
        {action ? (
          <Link
            href={action.href}
            className="mt-6 inline-flex min-h-12 items-center gap-2 rounded-full bg-[color:var(--vm-color-brand-blue)] px-6 text-sm font-bold text-white"
          >
            {action.label} <Icon name="arrow" className="h-4 w-4" />
          </Link>
        ) : null}
      </section>
    </div>
  );
}

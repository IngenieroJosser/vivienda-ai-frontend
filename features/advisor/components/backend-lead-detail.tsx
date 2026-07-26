"use client";

import Link from "next/link";
import { useState } from "react";
import { Icon } from "@/components/icon";
import { Pill } from "@/components/ui";
import { getHousingProject } from "../../../lib/housing-catalog";
import { CommercialActions } from "./commercial-actions";
import type {
  LeadDetailEvaluation,
  LeadDetailResponse,
  LeadRoute,
  ProjectRecommendation,
} from "../../../lib/api/leads";

type DetailTab = "SUMMARY" | "PROJECTS" | "CONVERSATION" | "ACTIVITY";

const routeLabels: Record<LeadRoute, string> = {
  READY_TO_CLOSE: "Listo para contacto",
  NEEDS_VALIDATION: "Validación pendiente",
  NON_AFFILIATE_REVIEW: "Revisión comercial",
  REGULATORY_WAITLIST: "Espera regulatoria 90/10",
  NURTURE: "Acompañamiento",
  FINANCIAL_PREPARATION: "Preparación financiera",
  OPTED_OUT: "Sin contacto",
};

export function BackendLeadDetail({
  detail,
  embedded = false,
  onDetailChange,
}: {
  readonly detail: LeadDetailResponse;
  readonly embedded?: boolean;
  readonly onDetailChange?: (detail: LeadDetailResponse) => void;
}) {
  const [activeTab, setActiveTab] = useState<DetailTab>("SUMMARY");
  const evaluation = detail.evaluation;
  const journey = detail.journey;
  const isCommercialRoute =
    journey &&
    ["READY_TO_CLOSE", "NON_AFFILIATE_REVIEW"].includes(journey.route);
  const tabs: Array<{ value: DetailTab; label: string; icon: Parameters<typeof Icon>[0]["name"] }> = [
    { value: "SUMMARY", label: "Resumen", icon: "document" },
    { value: "PROJECTS", label: "Proyectos", icon: "building" },
    { value: "CONVERSATION", label: "Conversación", icon: "mail" },
    { value: "ACTIVITY", label: "Trazabilidad", icon: "history" },
  ];

  return (
    <div className={`space-y-4 ${embedded ? "" : "mx-auto max-w-[1180px]"}`}>
      <section className="surface-solid p-6 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div>
            <div className="text-xs font-bold uppercase tracking-[.11em] text-[color:var(--vm-color-brand-blue)]">
              {isCommercialRoute
                ? "Oportunidad comercial"
                : "Ruta de acompañamiento"}
            </div>
            <h1 className="mt-2 text-3xl font-semibold tracking-[-.05em]">
              {detail.first_name?.trim() || "Prospecto sin nombre"}
            </h1>
            <p className="mt-2 text-sm text-[color:var(--vm-color-ink-muted)]">
              {detail.source} · campaña {detail.campaign || "sin campaña"} · actualizado {formatDate(detail.updated_at)}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Pill tone={evaluation?.priority === "HIGH" ? "green" : "yellow"}>
                {evaluation ? priorityLabel(evaluation.priority) : "Sin prioridad"}
              </Pill>
              <Pill>{evaluation ? routeLabels[evaluation.route] : "Sin evaluación"}</Pill>
              <Pill tone="gray">{detail.status}</Pill>
            </div>
          </div>
          <div className="rounded-[var(--vm-radius-control)] bg-[color:var(--vm-color-brand-blue)]/[.05] p-4 text-right">
            <div className="text-xs font-bold uppercase tracking-[.08em] text-[color:var(--vm-color-ink-muted)]">Referencia</div>
            <div className="mt-2 max-w-[260px] break-all text-xs font-semibold">{detail.id}</div>
          </div>
        </div>

        {journey ? (
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Metric
              label="Preparación"
              value={readinessLabels[journey.readiness.level]}
            />
            <Metric
              label="Confianza de datos"
              value={evidenceLabel(
                evaluation?.confidence_score,
                journey.readiness.missing_fields.length,
              )}
            />
            <Metric label="Cuota estimada" value={formatCop(journey.capacity.estimated_monthly_payment ?? 0)} />
            <Metric label="Siguiente acción" value={journey.handoff.next_action} />
          </div>
        ) : (
          <div className="surface-warning-soft mt-6 rounded-[var(--vm-radius-control)] border border-[color:var(--vm-color-warning)]/25 p-4 text-sm text-[color:var(--vm-color-warning)]">
            Esta oportunidad todavía no cuenta con una evaluación. El perfil, la conversación y la trazabilidad siguen disponibles.
          </div>
        )}

        <nav aria-label="Secciones del detalle" className="mt-6 flex gap-1 overflow-x-auto border-t border-[color:var(--vm-color-line)] pt-4">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => setActiveTab(tab.value)}
              aria-pressed={activeTab === tab.value}
              className={`inline-flex min-h-10 shrink-0 items-center gap-2 rounded-full px-3.5 text-xs font-bold transition ${activeTab === tab.value ? "bg-[color:var(--vm-color-brand-blue)] text-white" : "text-[color:var(--vm-color-ink-muted)] hover:bg-[color:var(--vm-color-brand-blue)]/[.05]"}`}
            >
              <Icon name={tab.icon} className="h-3.5 w-3.5" />
              {tab.label}
            </button>
          ))}
        </nav>
      </section>

      {isCommercialRoute ? (
        <CommercialActions
          leadId={detail.id}
          onCanonicalChange={(snapshot) => onDetailChange?.(snapshot.lead)}
        />
      ) : null}

      {activeTab === "SUMMARY" ? <SummaryPanel detail={detail} /> : null}
      {activeTab === "PROJECTS" ? <RecommendationsPanel recommendations={journey?.recommendations ?? []} /> : null}
      {activeTab === "CONVERSATION" ? <ConversationPanel detail={detail} /> : null}
      {activeTab === "ACTIVITY" ? <ActivityPanel detail={detail} /> : null}
    </div>
  );
}

function SummaryPanel({ detail }: { readonly detail: LeadDetailResponse }) {
  const evaluation = detail.evaluation;
  const journey = detail.journey;
  const profile = detail.profile as unknown as Record<string, unknown>;
  const contactChannel = String(profile.preferredChannel ?? "");
  const contactValue =
    contactChannel === "EMAIL"
      ? String(profile.email ?? "")
      : String(profile.phone ?? "");
  const handoffRequested = Boolean(journey?.handoff.requested);
  return (
    <>
      <section className="surface-solid p-6 sm:p-8">
        <SectionHeading
          title={
            handoffRequested
              ? "Entrega para contacto"
              : "Información para acompañamiento"
          }
          description={
            handoffRequested
              ? "Datos declarados y autorizados para que el asesor continúe desde el cierre, sin repetir el perfilamiento."
              : "Contexto declarado y autorizado para acompañar a la persona sin repetir el perfilamiento."
          }
        />
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Fact label="Nombre" value={String(profile.fullName ?? detail.first_name ?? "Por confirmar")} />
          <Fact label="Canal preferido" value={formatContactChannel(contactChannel)} />
          <Fact label="Dato de contacto" value={contactValue || "Por confirmar"} />
          <Fact label="Horario" value={formatContactTime(String(profile.contactTimePreference ?? ""))} />
          <Fact label="Autorización" value={profile.contactConsent === "YES" ? "Confirmada" : "No confirmada"} />
          <Fact
            label="Estado de entrega"
            value={
              handoffRequested
                ? "Solicitud recibida"
                : journey?.nurture_plan
                  ? "Ruta de acompañamiento activa"
                  : "Sin solicitud comercial"
            }
          />
        </div>
      </section>

      <section className="surface-solid p-6 sm:p-8">
        <SectionHeading
          title="Origen de la oportunidad"
          description="Contexto conservado desde el anuncio para entender qué atrajo a la persona y continuar con una atención coherente."
        />
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Fact label="Fuente" value={detail.source} />
          <Fact
            label="Medio"
            value={detail.acquisition.medium || "Por confirmar"}
          />
          <Fact label="Campaña" value={detail.campaign} />
          <Fact label="Contenido" value={detail.content} />
          <Fact
            label="Proyecto consultado"
            value={detail.acquisition.project_id || "Campaña general"}
          />
          <Fact
            label="Ubicación del anuncio"
            value={formatPlacement(
              detail.acquisition.placement,
              detail.acquisition.site_source,
            )}
          />
          <Fact
            label="Referencia de campaña"
            value={detail.acquisition.campaign_id || "No disponible"}
          />
          <Fact
            label="Referencia del anuncio"
            value={
              detail.acquisition.ad_name ||
              detail.acquisition.ad_id ||
              "No disponible"
            }
          />
          <Fact
            label="Atribución del clic"
            value={detail.acquisition.click_id ? "Disponible" : "No disponible"}
          />
          <Fact
            label="Dispositivo"
            value={formatDeviceClass(detail.acquisition.device_class)}
          />
          <Fact
            label="Idioma y zona"
            value={[
              detail.acquisition.locale,
              detail.acquisition.timezone,
            ].filter(Boolean).join(" · ") || "Por confirmar"}
          />
          <Fact
            label="Origen de navegación"
            value={detail.acquisition.referrer_origin || "Acceso directo"}
          />
        </div>
      </section>

      <section className="surface-solid p-6 sm:p-8">
        <SectionHeading title="Perfil y contexto" description="Datos recibidos en la sesión de perfilamiento." />
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Fact label="Estado" value={detail.status} />
          <Fact label="Consentimiento" value={detail.consent_accepted_at ? formatDate(detail.consent_accepted_at) : "No registrado"} />
          <Fact label="Creado" value={formatDate(detail.created_at)} />
        </div>
      </section>

      <section className="surface-solid p-6 sm:p-8">
        <SectionHeading title="Contexto del negocio" description="Información para decidir si el asesor debe cerrar, validar o dejar el acompañamiento automatizado activo." />
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Fact label="Canal" value={detail.is_paid ? "Lead pago" : "Canal orgánico o propio"} />
          <Fact label="Modo del chat" value={detail.chat_records?.at(-1)?.agent_mode ?? "No registrado"} />
          <Fact label="Estado conversacional" value={detail.chat_records?.at(-1)?.conversation_state ?? "No registrado"} />
          <Fact label="Ruta comercial" value={journey ? routeLabels[journey.route] : "Por evaluar"} />
          <Fact label="Estado 90/10" value={journey?.regulatory?.status ?? "No aplica o no consultado"} />
          <Fact label="Brecha de acompañamiento" value={journey?.nurture_plan?.primary_gap ?? "Sin brecha prioritaria"} />
        </div>
        {journey?.regulatory ? (
          <div className="mt-5 rounded-[var(--vm-radius-control)] border border-[color:var(--vm-color-line)] bg-[color:var(--vm-color-brand-blue)]/[.03] p-4 text-sm leading-6">
            <strong>Control regulatorio 90/10:</strong>{" "}
            {journey.regulatory.non_affiliate_sales} ventas no afiliadas de {journey.regulatory.total_sales} registradas en el periodo {journey.regulatory.period}. Disponibilidad adicional estimada: {journey.regulatory.available_non_affiliate_slots}. Esta señal orienta la ruta y no representa una promesa comercial.
          </div>
        ) : null}
      </section>

      <section className="surface-solid p-6 sm:p-8">
        <SectionHeading title="Lo que sabemos del prospecto" description="Información disponible antes y durante la orientación." />
        <KeyValueGrid values={detail.profile} emptyLabel="Sin datos de perfil" />
      </section>

      <section className="surface-solid p-6 sm:p-8">
        <SectionHeading title="Lo que descubrió la conversación" description="Contexto declarado por el prospecto durante la orientación." />
        <KeyValueGrid values={detail.discovery} emptyLabel="Sin discovery registrado" />
      </section>

      {journey ? (
        <section className="surface-solid p-6 sm:p-8">
          <SectionHeading title="Evaluación y siguiente paso" description="Resultado sustentado en reglas verificables y la información disponible." />
          <div className="mt-5 grid gap-5 lg:grid-cols-2">
            <ListBlock title="Factores observables" values={journey.readiness.factors} emptyLabel="Sin factores adicionales" />
            <ListBlock title="Condiciones pendientes" values={journey.readiness.blockers} emptyLabel="Sin condiciones pendientes" />
          </div>
          <div className="mt-5 rounded-[var(--vm-radius-control)] bg-[color:var(--vm-color-brand-blue)]/[.04] p-4">
            <div className="text-xs font-bold uppercase tracking-[.08em] text-[color:var(--vm-color-brand-blue)]">Siguiente acción</div>
            <p className="mt-2 text-sm font-semibold leading-6">
              {journey.handoff.next_action}
            </p>
          </div>
          {evaluation ? <CapacityPanel capacity={evaluation.capacity} /> : null}
        </section>
      ) : null}
    </>
  );
}

function RecommendationsPanel({ recommendations }: { readonly recommendations: ProjectRecommendation[] }) {
  if (!recommendations.length) {
    return (
      <section className="surface-solid p-10 text-center">
        <Icon name="building" className="mx-auto h-7 w-7 text-[color:var(--vm-color-brand-blue)]" />
        <h2 className="mt-3 font-semibold">No hay recomendaciones disponibles</h2>
        <p className="mt-1 text-sm text-[color:var(--vm-color-ink-muted)]">Todavía no hay proyectos compatibles para esta oportunidad.</p>
      </section>
    );
  }

  return (
    <section className="surface-solid p-6 sm:p-8">
      <SectionHeading title="Proyectos compatibles" description="Opciones priorizadas según el perfil y los recursos disponibles." />
      <div className="mt-5 grid gap-4 lg:grid-cols-3">
        {recommendations
          .slice()
          .sort((left, right) => left.rank - right.rank)
          .map((recommendation) => (
            <RecommendationCard key={`${recommendation.project_id}-${recommendation.rank}`} recommendation={recommendation} />
          ))}
      </div>
    </section>
  );
}

function RecommendationCard({ recommendation }: { readonly recommendation: ProjectRecommendation }) {
  const localProject = getHousingProject(recommendation.project_id);
  return (
    <article className="rounded-[var(--vm-radius-card)] border border-[color:var(--vm-color-line)] bg-white p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-xs font-bold uppercase tracking-[.08em] text-[color:var(--vm-color-brand-blue)]">Opción {recommendation.rank}</div>
          <h3 className="mt-2 text-lg font-semibold">{recommendation.project_name}</h3>
        </div>
        <Pill tone="blue">{recommendation.purpose === "MATCH" ? "Coincidencia" : "Referencia"}</Pill>
      </div>
      <div className="mt-4 rounded-[var(--vm-radius-control)] bg-[color:var(--vm-color-brand-blue)]/[.04] p-3">
        <div className="text-[11px] uppercase tracking-[.08em] text-[color:var(--vm-color-ink-muted)]">Referencia histórica de precio</div>
        <div className="mt-1 text-sm font-semibold">
          {formatPriceRange(recommendation)}
        </div>
        <div className="mt-1 text-[11px] text-[color:var(--vm-color-ink-muted)]">
          {recommendation.budget_status === "WITHIN_RANGE" ? "Compatible con la capacidad preliminar" : recommendation.budget_status === "REFERENCE_ONLY" ? "Opción de referencia; requiere revisión" : "Precio por confirmar"}
        </div>
      </div>
      <ul className="mt-4 space-y-2 text-sm leading-5">
        {recommendation.reasons.map((reason) => <li key={reason}>• {reason}</li>)}
      </ul>
      <div className="mt-5 flex flex-wrap gap-2 text-xs font-bold">
        {localProject ? <Link className="rounded-full bg-[color:var(--vm-color-brand-blue)] px-3 py-2 text-white" href={`/vivienda/proyectos/${recommendation.project_id}`}>Ver ficha</Link> : null}
        {recommendation.brochure_url ? <ExternalLink href={recommendation.brochure_url} label="Folleto" /> : null}
        {recommendation.tour_urls.map((url, index) => <ExternalLink key={url} href={url} label={`Recorrido ${index + 1}`} />)}
      </div>
    </article>
  );
}

function ConversationPanel({ detail }: { readonly detail: LeadDetailResponse }) {
  return (
    <section className="surface-solid p-6 sm:p-8">
      <SectionHeading title="Conversación completa" description="Evidencia original de lo declarado y de la orientación entregada." />
      {detail.turns.length ? (
        <ol className="mt-5 space-y-5">
          {detail.turns.map((turn) => (
            <li key={turn.id} className="space-y-3">
              <div className="ml-auto max-w-[88%] rounded-[20px_20px_6px_20px] bg-[color:var(--vm-color-brand-blue)] p-4 text-sm leading-6 text-white">{turn.user_text}</div>
              <div className="max-w-[88%] rounded-[20px_20px_20px_6px] border border-[color:var(--vm-color-line)] bg-[color:var(--vm-color-canvas)] p-4 text-sm leading-6">
                <p>{turn.assistant_text}</p>
                <time className="mt-2 block text-xs text-[color:var(--vm-color-ink-muted)]">{formatDate(turn.created_at)}</time>
                {turn.extracted_fields.length ? <p className="mt-2 text-xs text-[color:var(--vm-color-ink-muted)]">Información identificada: {turn.extracted_fields.map(humanizeKey).join(", ")}</p> : null}
              </div>
            </li>
          ))}
        </ol>
      ) : <EmptyPanel label="No hay conversación registrada para esta oportunidad." />}
    </section>
  );
}

function ActivityPanel({ detail }: { readonly detail: LeadDetailResponse }) {
  const evaluation = detail.evaluation;
  return (
    <>
      <section className="surface-solid p-6 sm:p-8">
        <SectionHeading title="Trazabilidad de la oportunidad" description="Actualizaciones y decisiones registradas durante el recorrido." />
        {detail.audit_events.length ? (
          <ol className="mt-5 space-y-4">
            {detail.audit_events.map((event, index) => (
              <li key={`${event.event_type}-${event.created_at}-${index}`} className="border-l-2 border-[color:var(--vm-color-brand-blue)]/25 pl-4">
                <div className="flex flex-wrap items-center gap-2">
                  <strong className="text-sm">{humanizeKey(event.event_type)}</strong>
                  <Pill tone="gray">{humanizeKey(event.actor)}</Pill>
                </div>
                <time className="mt-1 block text-xs text-[color:var(--vm-color-ink-muted)]">{formatDate(event.created_at)}</time>
              </li>
            ))}
          </ol>
        ) : <EmptyPanel label="No hay eventos de auditoría registrados." />}
      </section>

      {evaluation ? (
        <section className="surface-solid p-6 sm:p-8">
          <SectionHeading title="Registro de evaluación" description="Versión de reglas, momento y tiempo de cálculo." />
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Fact label="Versión de reglas" value={evaluation.rule_version} />
            <Fact label="Evaluado" value={formatDate(evaluation.evaluated_at)} />
            <Fact label="Actualizado" value={formatDate(detail.updated_at)} />
          </div>
        </section>
      ) : null}

    </>
  );
}

function CapacityPanel({ capacity }: { readonly capacity: LeadDetailEvaluation["capacity"] }) {
  return (
    <div className="mt-5 rounded-[var(--vm-radius-control)] border border-[color:var(--vm-color-line)] p-4">
      <div className="text-xs font-bold uppercase tracking-[.08em] text-[color:var(--vm-color-brand-blue)]">Capacidad orientativa</div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Fact label="Ingreso mensual" value={formatCop(capacity.monthly_income_estimate)} />
        <Fact label="Compromiso" value={`${Math.round(capacity.commitment_ratio * 100)} %`} />
        <Fact label="Margen vivienda" value={`${Math.round(capacity.maximum_housing_ratio * 100)} %`} />
        <Fact label="Estado" value={capacity.status} />
      </div>
    </div>
  );
}

function KeyValueGrid({ values, emptyLabel }: { readonly values: Record<string, unknown>; readonly emptyLabel: string }) {
  const entries = Object.entries(values);
  if (!entries.length) return <EmptyPanel label={emptyLabel} />;
  return <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{entries.map(([key, value]) => <Fact key={key} label={humanizeKey(key)} value={formatValue(value)} />)}</div>;
}

function ListBlock({ title, values, emptyLabel }: { readonly title: string; readonly values: string[]; readonly emptyLabel: string }) {
  return (
    <div>
      <div className="text-xs font-bold uppercase tracking-[.08em] text-[color:var(--vm-color-brand-blue)]">{title}</div>
      {values.length ? <ul className="mt-3 space-y-2 text-sm leading-5">{values.map((value) => <li key={value}>• {humanizeKey(value)}</li>)}</ul> : <p className="mt-3 text-sm text-[color:var(--vm-color-ink-muted)]">{emptyLabel}</p>}
    </div>
  );
}

function SectionHeading({ title, description }: { readonly title: string; readonly description: string }) {
  return <div><h2 className="text-lg font-semibold">{title}</h2><p className="mt-2 text-sm leading-6 text-[color:var(--vm-color-ink-muted)]">{description}</p></div>;
}

function Fact({ label, value }: { readonly label: string; readonly value: string }) {
  return <div className="rounded-[var(--vm-radius-control)] border border-[color:var(--vm-color-line)] p-4"><div className="text-xs uppercase tracking-[.08em] text-[color:var(--vm-color-ink-muted)]">{label}</div><div className="mt-2 break-words text-sm font-semibold">{value}</div></div>;
}

function Metric({ label, value }: { readonly label: string; readonly value: string }) {
  return <div className="rounded-[var(--vm-radius-card)] bg-[color:var(--vm-color-brand-blue)]/[.05] p-4"><div className="text-xs uppercase tracking-[.08em] text-[color:var(--vm-color-ink-muted)]">{label}</div><div className={`mt-2 font-semibold ${value.length > 28 ? "text-sm leading-5" : "text-xl"}`}>{value}</div></div>;
}

function ExternalLink({ href, label }: { readonly href: string; readonly label: string }) {
  const safeHref = getSafeExternalUrl(href);
  if (!safeHref) return null;
  return <a href={safeHref} target="_blank" rel="noreferrer" className="rounded-full border border-[color:var(--vm-color-line)] px-3 py-2 text-[color:var(--vm-color-brand-blue)]">{label}</a>;
}

function EmptyPanel({ label }: { readonly label: string }) {
  return <p className="mt-5 rounded-[var(--vm-radius-control)] border border-dashed border-[color:var(--vm-color-line)] p-5 text-center text-sm text-[color:var(--vm-color-ink-muted)]">{label}</p>;
}

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Por confirmar";
  return new Intl.DateTimeFormat("es-CO", { dateStyle: "medium", timeStyle: "short" }).format(date);
}

function formatCop(value: number): string {
  if (!value) return "Por confirmar";
  return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(value);
}

function formatPriceRange(recommendation: ProjectRecommendation): string {
  const from = recommendation.price_from_cop;
  const to = recommendation.price_to_cop;
  const reference = recommendation.price_reference_cop;
  if (from && to) return `${formatCop(from)} – ${formatCop(to)}`;
  if (reference) return `Referencia ${formatCop(reference)}`;
  return "Por confirmar";
}

function formatValue(value: unknown): string {
  if (value === null || value === undefined || value === "") return "Por confirmar";
  if (Array.isArray(value)) return value.map((item) => formatValue(item)).join(", ");
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

function formatContactChannel(value: string): string {
  const labels: Record<string, string> = {
    WHATSAPP: "WhatsApp",
    PHONE: "Llamada",
    EMAIL: "Correo electrónico",
  };
  return labels[value] ?? "Por confirmar";
}

function formatContactTime(value: string): string {
  const labels: Record<string, string> = {
    WEEKDAY_MORNING: "Entre semana en la mañana",
    WEEKDAY_AFTERNOON: "Entre semana en la tarde",
    SATURDAY: "Sábado",
    ANY: "Cualquier horario",
  };
  return labels[value] ?? "Por confirmar";
}

function formatPlacement(
  placement: string | null | undefined,
  siteSource: string | null | undefined,
): string {
  const values = [siteSource, placement].filter(
    (value): value is string => Boolean(value),
  );
  return values.length ? values.map(humanizeKey).join(" · ") : "Por confirmar";
}

function formatDeviceClass(value: string | null | undefined): string {
  const labels: Record<string, string> = {
    MOBILE: "Teléfono",
    TABLET: "Tableta",
    DESKTOP: "Computador",
  };
  return value ? labels[value] ?? humanizeKey(value) : "Por confirmar";
}

function humanizeKey(value: string): string {
  return value.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/[_-]/g, " ").replace(/^./, (letter) => letter.toUpperCase());
}

function priorityLabel(value: "HIGH" | "MEDIUM" | "LOW"): string {
  return value === "HIGH" ? "Prioridad alta" : value === "MEDIUM" ? "Prioridad media" : "Prioridad baja";
}

function getSafeExternalUrl(value: string): string | null {
  try {
    const url = new URL(value);
    return ["http:", "https:"].includes(url.protocol) ? url.toString() : null;
  } catch {
    return null;
  }
}

const readinessLabels = {
  HIGH: "Preparación alta",
  DEVELOPING: "En desarrollo",
  INITIAL: "Etapa inicial",
};

function evidenceLabel(
  confidenceScore: number | undefined,
  missingFields: number,
): string {
  if (typeof confidenceScore === "number") {
    const ratio = confidenceScore > 1 ? confidenceScore / 100 : confidenceScore;
    if (ratio >= 0.8) return "Sólida";
    if (ratio >= 0.65) return "Parcial";
    return "Por completar";
  }
  if (missingFields === 0) return "Sólida";
  if (missingFields <= 2) return "Parcial";
  return "Por completar";
}

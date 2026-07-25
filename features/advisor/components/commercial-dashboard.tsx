"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { FeedbackState } from "@/components/feedback-state";
import { Icon } from "@/components/icon";
import { Pill } from "@/components/ui";
import { LeadDetailClient } from "./lead-detail-client";
import {
  listLeads,
  type LeadListItem,
} from "../../../lib/api/leads";
import { ApiError } from "../../../lib/api/client";

type DashboardSection = "CLAIM" | "ASSIGNED" | "SLA";

type SectionState = {
  status: "LOADING" | "READY" | "ERROR";
  items: LeadListItem[];
  error?: string;
};

const SECTION_LABELS: Record<DashboardSection, string> = {
  CLAIM: "Por reclamar",
  ASSIGNED: "Asignadas a mí",
  SLA: "SLA o seguimiento vencido",
};

type Priority = "HIGH" | "MEDIUM" | "LOW";
type PriorityTone = "green" | "yellow" | "gray";

const PRIORITY_TONE: Record<Priority, PriorityTone> = {
  HIGH: "green",
  MEDIUM: "yellow",
  LOW: "gray",
};

const ROUTE_LABELS: Record<string, string> = {
  READY_TO_CLOSE: "Listo para contacto",
  NEEDS_VALIDATION: "Validación pendiente",
  NON_AFFILIATE_REVIEW: "Revisión comercial",
  NURTURE: "Acompañamiento",
  FINANCIAL_PREPARATION: "Preparación financiera",
  OPTED_OUT: "Sin contacto",
};

function safeRoute(value: string | null): string {
  if (!value) return "Sin ruta asignada";
  return ROUTE_LABELS[value] ?? value;
}

function safePriority(value: string | null): "HIGH" | "MEDIUM" | "LOW" {
  if (value === "HIGH" || value === "MEDIUM" || value === "LOW") return value;
  return "LOW";
}

function priorityLabel(value: string | null): string {
  const PRIORITY_LABELS: Record<"HIGH" | "MEDIUM" | "LOW", string> = {
    HIGH: "Alta",
    MEDIUM: "Media",
    LOW: "Baja",
  };
  return PRIORITY_LABELS[safePriority(value)];
}

function priorityTone(value: string | null): "green" | "yellow" | "gray" {
  return PRIORITY_TONE[safePriority(value)];
}

export function CommercialDashboard({ fullInbox = false }: { fullInbox?: boolean }) {
  const [claim, setClaim] = useState<SectionState>({ status: "LOADING", items: [] });
  const [assigned, setAssigned] = useState<SectionState>({ status: "LOADING", items: [] });
  const [sla, setSla] = useState<SectionState>({ status: "LOADING", items: [] });
  const [retryKey, setRetryKey] = useState(0);
  const [activeSection, setActiveSection] = useState<DashboardSection>("ASSIGNED");
  const detailRef = useRef<HTMLDivElement>(null);

  const loadSection = useCallback(
    async (
      section: DashboardSection,
      setter: (state: SectionState) => void,
    ) => {
      setter({ status: "LOADING", items: [] });
      try {
        const params =
          section === "CLAIM"
            ? { pendingAssignment: true }
            : section === "ASSIGNED"
              ? { assignedToMe: true }
              : { slaOverdue: true };
        const response = await listLeads({ ...params, limit: 100 });
        setter({ status: "READY", items: response });
      } catch (error) {
        const message =
          error instanceof ApiError
            ? `El servicio respondió con estado ${error.status}.`
            : error instanceof Error
              ? error.message
              : "No pudimos cargar la sección.";
        setter({ status: "ERROR", items: [], error: message });
      }
    },
    [],
  );

  useEffect(() => {
    void loadSection("CLAIM", setClaim);
    void loadSection("ASSIGNED", setAssigned);
    void loadSection("SLA", setSla);
  }, [loadSection, retryKey]);

  const sections: Record<DashboardSection, SectionState> = {
    CLAIM: claim,
    ASSIGNED: assigned,
    SLA: sla,
  };

  const activeState = sections[activeSection];
  const selectedItem = activeState.items[0];

  function selectSection(section: DashboardSection) {
    setActiveSection(section);
    if (!window.matchMedia("(max-width: 1279px)").matches) return;
    window.requestAnimationFrame(() => {
      detailRef.current?.scrollIntoView({ block: "start" });
    });
  }

  if (
    sections.CLAIM.status === "LOADING" &&
    sections.ASSIGNED.status === "LOADING" &&
    sections.SLA.status === "LOADING"
  ) {
    return <CommercialDashboardLoading fullInbox={fullInbox} />;
  }

  if (!fullInbox) {
    return (
      <OperationalSummary
        sections={sections}
        activeSection={activeSection}
        onSelect={selectSection}
      />
    );
  }

  return (
    <div className="space-y-4" data-testid="backend-dashboard">
      <SectionTabs
        sections={sections}
        activeSection={activeSection}
        onSelect={selectSection}
      />

      {activeState.status === "ERROR" ? (
        <SectionError
          section={activeSection}
          message={activeState.error ?? "Error desconocido"}
          onRetry={() => setRetryKey((current) => current + 1)}
        />
      ) : activeState.items.length === 0 ? (
        <SectionEmpty section={activeSection} />
      ) : (
        <section className="grid min-h-[680px] gap-4 xl:grid-cols-[minmax(360px,38fr)_minmax(0,62fr)]">
          <aside className="surface-solid h-fit overflow-hidden xl:sticky xl:top-20">
            <div className="border-b border-[color:var(--vm-color-line)] px-4 py-3">
              <h2 className="text-sm font-semibold">
                {SECTION_LABELS[activeSection]}
              </h2>
              <p className="mt-0.5 text-[11px] text-[color:var(--vm-color-ink-muted)]">
                {activeState.items.length} resultados · orden devuelto por el backend
              </p>
            </div>
            <div className="max-h-[calc(100vh-220px)] divide-y divide-[color:var(--vm-color-line)] overflow-y-auto">
              {activeState.items.map((item, index) => (
                <LeadItemRow
                  key={item.id}
                  item={item}
                  selected={selectedItem?.id === item.id}
                  first={index === 0}
                />
              ))}
            </div>
          </aside>

          <div
            ref={detailRef}
            key={selectedItem?.id}
            className="advisor-detail-enter min-w-0 scroll-mt-20"
          >
            {selectedItem ? (
              <LeadDetailClient leadId={selectedItem.id} embedded />
            ) : null}
          </div>
        </section>
      )}
    </div>
  );
}

function SectionTabs({
  sections,
  activeSection,
  onSelect,
}: {
  sections: Record<DashboardSection, SectionState>;
  activeSection: DashboardSection;
  onSelect: (section: DashboardSection) => void;
}) {
  return (
    <nav
      aria-label="Secciones del dashboard"
      className="surface-solid flex flex-wrap divide-y divide-[color:var(--vm-color-line)] overflow-hidden sm:flex-nowrap sm:divide-x sm:divide-y-0"
    >
      {(Object.keys(sections) as DashboardSection[]).map((section) => {
        const state = sections[section];
        const count = state.items.length;
        const active = section === activeSection;
        return (
          <button
            key={section}
            type="button"
            onClick={() => onSelect(section)}
            aria-pressed={active}
            data-testid={`section-tab-${section.toLowerCase()}`}
            className={`flex min-w-[180px] flex-1 flex-col items-start gap-1 px-5 py-3 text-left transition ${
              active
                ? "bg-[color:var(--vm-color-brand-blue)]/[.07]"
                : "bg-white hover:bg-[color:var(--vm-color-brand-blue)]/[.025]"
            }`}
          >
            <span className="text-xs font-bold uppercase tracking-[.08em] text-[color:var(--vm-color-ink-muted)]">
              {SECTION_LABELS[section]}
            </span>
            <span className="text-2xl font-semibold">
              {state.status === "LOADING" ? "…" : count}
            </span>
          </button>
        );
      })}
    </nav>
  );
}

function LeadItemRow({
  item,
  selected,
  first,
}: {
  item: LeadListItem;
  selected: boolean;
  first: boolean;
}) {
  const initials = (item.first_name ?? item.id).slice(0, 2).toUpperCase();
  return (
    <Link
      href={`/asesor/leads/${item.id}`}
      aria-current={selected ? "true" : undefined}
      data-testid={`lead-row-${item.id}`}
      className={`flex items-center gap-3 px-4 py-3 transition ${
        selected
          ? "bg-[color:var(--vm-color-brand-blue)]/[.07]"
          : "bg-white hover:bg-[color:var(--vm-color-brand-blue)]/[.025]"
      }`}
    >
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[color:var(--vm-color-brand-blue)] text-xs font-bold text-white">
        {initials}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="truncate text-sm font-semibold">
            {item.first_name ?? "Prospecto sin nombre"}
          </h3>
          {first ? <Pill tone="green">Primero</Pill> : null}
        </div>
        <p className="mt-0.5 truncate text-[11px] text-[color:var(--vm-color-ink-muted)]">
          {safeRoute(item.route)}
        </p>
      </div>
      <Pill tone={priorityTone(item.priority)}>
        {priorityLabel(item.priority)}
      </Pill>
    </Link>
  );
}

function OperationalSummary({
  sections,
  activeSection,
  onSelect,
}: {
  sections: Record<DashboardSection, SectionState>;
  activeSection: DashboardSection;
  onSelect: (section: DashboardSection) => void;
}) {
  const totalAssigned = sections.ASSIGNED.items.length;
  const totalClaim = sections.CLAIM.items.length;
  const totalSla = sections.SLA.items.length;
  const upcoming = sections.ASSIGNED.items
    .filter((item) => item.next_follow_up_at !== null)
    .slice(0, 5);

  return (
    <div className="space-y-4">
      <SectionTabs
        sections={sections}
        activeSection={activeSection}
        onSelect={onSelect}
      />

      <section className="surface-solid overflow-hidden">
        <div className="flex flex-col justify-between gap-3 border-b border-[color:var(--vm-color-line)] px-5 py-4 sm:flex-row sm:items-center">
          <div>
            <div className="text-xs font-bold uppercase tracking-[.1em] text-[color:var(--vm-color-brand-blue)]">
              Próximos seguimientos
            </div>
            <h2 className="mt-1 text-xl font-semibold tracking-[-.03em]">
              {totalAssigned > 0
                ? `${totalAssigned} oportunidades asignadas a ti`
                : "Sin oportunidades asignadas"}
            </h2>
          </div>
          <Link
            href="/asesor/leads"
            className="inline-flex min-h-10 items-center gap-2 text-xs font-bold text-[color:var(--vm-color-brand-blue)]"
          >
            Ver bandeja completa <Icon name="arrow" className="h-4 w-4" />
          </Link>
        </div>

        {upcoming.length ? (
          <div className="divide-y divide-[color:var(--vm-color-line)]">
            {upcoming.map((item, index) => (
              <Link
                key={item.id}
                href={`/asesor/leads/${item.id}`}
                className="advisor-row-enter grid gap-3 px-5 py-4 lg:grid-cols-[minmax(190px,.85fr)_minmax(220px,1.2fr)_minmax(180px,.8fr)_auto] lg:items-center"
              >
                <div className="flex items-center gap-3">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[color:var(--vm-color-brand-blue)] text-xs font-bold text-white">
                    {(item.first_name ?? item.id).slice(0, 2).toUpperCase()}
                  </span>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="truncate text-sm font-semibold">
                        {item.first_name ?? "Prospecto sin nombre"}
                      </h3>
                      {index === 0 ? <Pill tone="green">Atender primero</Pill> : null}
                    </div>
                    <p className="mt-1 text-[11px] text-[color:var(--vm-color-ink-muted)]">
                      {safeRoute(item.route)}
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold">
                    {item.next_action ?? "Definir siguiente acción"}
                  </p>
                  <p className="mt-1 text-[11px] text-[color:var(--vm-color-ink-muted)]">
                    {item.commercial_state ?? "Sin estado comercial"}
                  </p>
                </div>
                <div>
                  <Pill tone={item.sla_overdue ? "yellow" : "blue"}>
                    {item.sla_overdue
                      ? "SLA vencido"
                      : item.next_follow_up_at
                        ? `Seguimiento ${formatDateTime(item.next_follow_up_at)}`
                        : "Sin SLA"}
                  </Pill>
                </div>
                <span className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full bg-[color:var(--vm-color-brand-blue)] px-4 text-center text-xs font-bold whitespace-normal text-white">
                  Gestionar <Icon name="arrow" className="h-4 w-4" />
                </span>
              </Link>
            ))}
          </div>
        ) : (
          <div className="p-10 text-center">
            <Icon
              name="check"
              className="mx-auto h-7 w-7 text-[color:var(--vm-color-success)]"
            />
            <h3 className="mt-3 font-semibold">No hay oportunidades asignadas</h3>
            <p className="mt-1 text-sm text-[color:var(--vm-color-ink-muted)]">
              Cuando tomes una oportunidad aparecerá aquí.
            </p>
          </div>
        )}
      </section>

      <p className="text-[11px] text-[color:var(--vm-color-ink-muted)]">
        Por reclamar: {totalClaim} · Asignadas a ti: {totalAssigned} · SLA o seguimiento
        vencido: {totalSla}.
      </p>
    </div>
  );
}

function SectionError({
  section,
  message,
  onRetry,
}: {
  section: DashboardSection;
  message: string;
  onRetry: () => void;
}) {
  return (
    <FeedbackState
      title={`No pudimos cargar ${SECTION_LABELS[section].toLowerCase()}`}
      description={message}
      icon="alert"
      tone="error"
      action={{ label: "Reintentar", onClick: onRetry }}
    />
  );
}

function SectionEmpty({ section }: { section: DashboardSection }) {
  const messages: Record<DashboardSection, { title: string; description: string }> = {
    CLAIM: {
      title: "Sin oportunidades por reclamar",
      description: "Cuando un prospecto solicite contacto aparecerá en esta sección.",
    },
    ASSIGNED: {
      title: "No tienes oportunidades asignadas",
      description: "Toma una oportunidad de la sección Por reclamar para empezar.",
    },
    SLA: {
      title: "Todo al día",
      description: "No hay oportunidades con SLA o seguimiento vencido.",
    },
  };
  const message = messages[section];
  return (
    <div className="surface-solid p-10 text-center">
      <Icon
        name={section === "SLA" ? "check" : "search"}
        className={`mx-auto h-7 w-7 ${
          section === "SLA"
            ? "text-[color:var(--vm-color-success)]"
            : "text-[color:var(--vm-color-brand-blue)]"
        }`}
      />
      <h3 className="mt-3 font-semibold">{message.title}</h3>
      <p className="mt-1 text-sm text-[color:var(--vm-color-ink-muted)]">
        {message.description}
      </p>
    </div>
  );
}

function CommercialDashboardLoading({ fullInbox }: { fullInbox: boolean }) {
  return (
    <div aria-live="polite" aria-busy="true" className="space-y-4">
      <div className="h-20 animate-pulse rounded-[var(--vm-radius-card)] border border-[color:var(--vm-color-line)] bg-white" />
      <div
        className={`grid gap-4 ${fullInbox ? "xl:grid-cols-[38fr_62fr]" : ""}`}
      >
        <div className="h-[420px] animate-pulse rounded-[var(--vm-radius-card)] border border-[color:var(--vm-color-line)] bg-white" />
        {fullInbox ? (
          <div className="h-[620px] animate-pulse rounded-[var(--vm-radius-card)] border border-[color:var(--vm-color-line)] bg-white" />
        ) : null}
      </div>
      <span className="sr-only">Cargando dashboard del asesor</span>
    </div>
  );
}

function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat("es-CO", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

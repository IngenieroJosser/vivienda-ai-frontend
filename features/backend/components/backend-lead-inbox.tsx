"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Icon } from "@/components/icon";
import { Pill } from "@/components/ui";
import { getBackendLeads, type BackendLeadListItem } from "@/lib/backend-api";

export function BackendLeadInbox() {
  const [leads, setLeads] = useState<BackendLeadListItem[]>([]);
  const [status, setStatus] = useState<"LOADING" | "READY" | "ERROR">("LOADING");
  const [query, setQuery] = useState("");
  const [route, setRoute] = useState("ALL");

  async function load() {
    setStatus("LOADING");
    try {
      setLeads(await getBackendLeads(300));
      setStatus("READY");
    } catch {
      setStatus("ERROR");
    }
  }

  useEffect(() => { void load(); }, []);

  const filtered = useMemo(() => leads.filter((lead) => {
    const text = `${lead.first_name ?? ""} ${lead.campaign} ${lead.source} ${lead.affiliation_status}`.toLowerCase();
    return text.includes(query.trim().toLowerCase()) && (route === "ALL" || lead.route === route);
  }), [leads, query, route]);

  if (status === "LOADING") return <section className="surface-solid p-8">Cargando oportunidades desde el backend…</section>;
  if (status === "ERROR") return (
    <section className="surface-solid p-8">
      <h2 className="text-xl font-semibold">No fue posible consultar el backend.</h2>
      <p className="mt-2 text-sm text-[color:var(--vm-color-ink-muted)]">Verifica que FastAPI esté disponible en http://localhost:8000.</p>
      <button onClick={() => void load()} className="mt-5 rounded-full bg-[color:var(--vm-color-brand-blue)] px-5 py-3 text-sm font-bold text-white">Reintentar</button>
    </section>
  );

  const ready = leads.filter((lead) => lead.route === "READY_TO_CLOSE").length;
  const nonAffiliate = leads.filter((lead) => lead.route === "NON_AFFILIATE_REVIEW").length;
  const nurture = leads.filter((lead) => ["NURTURE", "FINANCIAL_PREPARATION"].includes(lead.route ?? "")).length;

  return <div className="space-y-4">
    <section className="surface-solid grid divide-y divide-[color:var(--vm-color-line)] sm:grid-cols-4 sm:divide-x sm:divide-y-0">
      <Metric label="Leads sincronizados" value={leads.length} />
      <Metric label="Listos para cierre" value={ready} />
      <Metric label="Validación 90/10" value={nonAffiliate} />
      <Metric label="En nutrición" value={nurture} />
    </section>
    <section className="surface-solid p-4">
      <div className="grid gap-3 lg:grid-cols-[1fr_280px_auto]">
        <label className="relative"><span className="sr-only">Buscar</span><span className="pointer-events-none absolute inset-y-0 left-0 flex w-12 items-center justify-center"><Icon name="search" className="h-4 w-4" /></span><input className="form-field pl-12" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar persona, campaña, canal o afiliación" /></label>
        <select className="form-field" value={route} onChange={(event) => setRoute(event.target.value)}>
          <option value="ALL">Todas las rutas</option><option value="READY_TO_CLOSE">Listos para cierre</option><option value="NEEDS_VALIDATION">Validación breve</option><option value="NON_AFFILIATE_REVIEW">Validación 90/10</option><option value="FINANCIAL_PREPARATION">Preparación financiera</option><option value="NURTURE">Nutrición</option>
        </select>
        <button onClick={() => void load()} className="rounded-full border border-[color:var(--vm-color-line)] px-5 text-sm font-bold">Actualizar</button>
      </div>
    </section>
    <section className="surface-solid overflow-hidden">
      {filtered.length ? <div className="divide-y divide-[color:var(--vm-color-line)]">{filtered.map((lead) => <LeadRow key={lead.id} lead={lead} />)}</div> : <div className="p-10 text-center text-sm text-[color:var(--vm-color-ink-muted)]">No hay leads para los filtros seleccionados.</div>}
    </section>
  </div>;
}

function Metric({ label, value }: { label: string; value: number }) { return <div className="p-5"><div className="text-[10px] font-bold uppercase tracking-[.1em] text-[color:var(--vm-color-ink-muted)]">{label}</div><div className="mt-2 text-3xl font-semibold">{value}</div></div>; }

function LeadRow({ lead }: { lead: BackendLeadListItem }) {
  const routeLabel: Record<string, string> = { READY_TO_CLOSE: "Listo para cierre", NEEDS_VALIDATION: "Validación breve", NON_AFFILIATE_REVIEW: "Revisión 90/10", FINANCIAL_PREPARATION: "Preparación financiera", NURTURE: "Nutrición", OPTED_OUT: "Sin autorización" };
  return <article className="grid gap-4 px-5 py-4 lg:grid-cols-[minmax(180px,1fr)_minmax(160px,.8fr)_minmax(180px,1fr)_120px_auto] lg:items-center">
    <div><h2 className="font-semibold">{lead.first_name || "Prospecto"}</h2><p className="mt-1 text-xs text-[color:var(--vm-color-ink-muted)]">{lead.source} · {lead.campaign}</p></div>
    <div><Pill tone={lead.affiliation_status === "AFFILIATE" ? "green" : lead.affiliation_status === "NON_AFFILIATE" ? "yellow" : "gray"}>{lead.affiliation_status === "AFFILIATE" ? "Afiliado" : lead.affiliation_status === "NON_AFFILIATE" ? "No afiliado" : "Por confirmar"}</Pill></div>
    <div><div className="text-sm font-semibold">{routeLabel[lead.route ?? ""] ?? "Pendiente de evaluación"}</div><div className="mt-1 text-xs text-[color:var(--vm-color-ink-muted)]">Proyecto: {lead.top_project_id ?? "por definir"}</div></div>
    <div><div className="text-[10px] uppercase text-[color:var(--vm-color-ink-muted)]">Preparación</div><div className="mt-1 text-xl font-semibold">{lead.readiness_score ?? 0}/100</div></div>
    <Link href={`/asesor/leads/${lead.id}`} className="inline-flex items-center gap-2 text-sm font-bold text-[color:var(--vm-color-brand-blue)]">Abrir <Icon name="arrow" className="h-4 w-4" /></Link>
  </article>;
}

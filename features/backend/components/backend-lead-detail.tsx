"use client";

import { useEffect, useState } from "react";
import { Pill } from "@/components/ui";
import { getBackendLead, type BackendLeadDetail } from "@/lib/backend-api";

export function BackendLeadDetailView({ leadId }: { leadId: string }) {
  const [lead, setLead] = useState<BackendLeadDetail>();
  const [error, setError] = useState(false);
  useEffect(() => { getBackendLead(leadId).then(setLead).catch(() => setError(true)); }, [leadId]);
  if (error) return <section className="surface-solid p-8">No fue posible cargar este lead desde el backend.</section>;
  if (!lead) return <section className="surface-solid p-8">Cargando expediente comercial…</section>;
  const evaluation = lead.evaluation;
  return <div className="space-y-4">
    <section className="surface-solid p-6 sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-5"><div><div className="text-[10px] font-bold uppercase tracking-[.12em] text-[color:var(--vm-color-brand-blue)]">Expediente persistido</div><h1 className="mt-2 text-3xl font-semibold">{lead.first_name || "Prospecto perfilado"}</h1><p className="mt-2 text-sm text-[color:var(--vm-color-ink-muted)]">{lead.source} · {lead.campaign} · {lead.content}</p></div><div className="flex gap-2"><Pill tone={lead.profile.affiliation === "AFFILIATE" ? "green" : "yellow"}>{lead.profile.affiliation === "AFFILIATE" ? "Afiliado" : lead.profile.affiliation === "NON_AFFILIATE" ? "No afiliado" : "Afiliación por confirmar"}</Pill>{evaluation ? <Pill>{evaluation.priority} prioridad</Pill> : null}</div></div>
      {evaluation ? <div className="mt-6 grid gap-3 sm:grid-cols-3"><Metric label="Preparación comercial" value={`${evaluation.readiness_score}/100`} /><Metric label="Confianza de datos" value={`${evaluation.confidence_score}/100`} /><Metric label="Ruta" value={evaluation.route} /></div> : null}
    </section>
    {evaluation ? <section className="surface-solid p-6 sm:p-8"><h2 className="text-xl font-semibold">Decisión y siguiente acción</h2><p className="mt-3 rounded-2xl bg-[color:var(--vm-color-brand-blue)]/[.04] p-4 text-sm leading-6">{evaluation.next_action ?? "Siguiente acción pendiente."}</p><div className="mt-5 grid gap-4 md:grid-cols-2"><List title="Bloqueadores" items={evaluation.blockers} /><List title="Razones de decisión" items={evaluation.reason_codes ?? []} /></div></section> : null}
    {evaluation?.recommendations?.length ? <section className="surface-solid p-6 sm:p-8"><h2 className="text-xl font-semibold">Proyectos recomendados por el modelo</h2><div className="mt-5 grid gap-4 md:grid-cols-3">{evaluation.recommendations.map((project) => <article key={project.project_id} className="rounded-2xl border border-[color:var(--vm-color-line)] p-5"><div className="text-xs font-bold text-[color:var(--vm-color-brand-blue)]">#{project.rank} · {project.model_source}</div><h3 className="mt-2 text-lg font-semibold">{project.project_name}</h3><div className="mt-2 text-sm">Afinidad: {Math.round(project.score)} puntos</div><ul className="mt-3 space-y-2 text-xs leading-5 text-[color:var(--vm-color-ink-muted)]">{project.reasons.slice(0,3).map((reason) => <li key={reason}>• {reason}</li>)}</ul></article>)}</div></section> : null}
    <section className="grid gap-4 lg:grid-cols-2"><div className="surface-solid p-6"><h2 className="text-lg font-semibold">Perfil consolidado</h2><dl className="mt-4 grid gap-3 sm:grid-cols-2">{Object.entries(lead.profile).map(([key, value]) => <div key={key}><dt className="text-[10px] font-bold uppercase text-[color:var(--vm-color-ink-muted)]">{key}</dt><dd className="mt-1 text-sm font-semibold">{String(value)}</dd></div>)}</dl></div><div className="surface-solid p-6"><h2 className="text-lg font-semibold">Conversación</h2><ol className="mt-4 space-y-4">{lead.turns.map((turn) => <li key={turn.id} className="space-y-2"><div className="ml-auto max-w-[90%] rounded-2xl bg-[color:var(--vm-color-brand-blue)] p-3 text-sm text-white">{turn.user_text}</div><div className="max-w-[90%] rounded-2xl border border-[color:var(--vm-color-line)] p-3 text-sm">{turn.assistant_text}</div></li>)}</ol></div></section>
  </div>;
}
function Metric({label,value}:{label:string;value:string}){return <div className="rounded-2xl border border-[color:var(--vm-color-line)] p-4"><div className="text-[10px] font-bold uppercase text-[color:var(--vm-color-ink-muted)]">{label}</div><div className="mt-2 text-xl font-semibold">{value}</div></div>}
function List({title,items}:{title:string;items:string[]}){return <div><h3 className="text-sm font-semibold">{title}</h3><ul className="mt-3 space-y-2 text-sm text-[color:var(--vm-color-ink-muted)]">{items.length?items.map((item)=><li key={item}>• {item}</li>):<li>Sin elementos registrados.</li>}</ul></div>}

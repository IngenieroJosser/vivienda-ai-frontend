import Link from "next/link";
import { notFound } from "next/navigation";
import { PortalShell } from "@/components/portal-shell";
import { Icon } from "@/components/icon";
import { Pill, ProgressBar } from "@/components/ui";
import { leads } from "@/lib/data";

export const dynamicParams = false;

export function generateStaticParams() {
  return leads.map((lead) => ({ id: lead.id }));
}

export default async function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const lead = leads.find((item) => item.id === id);
  if (!lead) notFound();

  return (
    <PortalShell role="asesor" title={lead.name} subtitle={`Escenario sintético · ${lead.source}`}>
      <Link href="/asesor/leads" className="mb-5 inline-flex items-center gap-2 text-xs font-semibold text-black/45 hover:text-[#0067b1]"><Icon name="arrow" className="h-4 w-4 rotate-180" />Volver a la bandeja</Link>
      <div className="grid gap-5 xl:grid-cols-[1.2fr_.8fr]">
        <div className="space-y-5">
          <section className="surface-card p-6 sm:p-8">
            <div className="flex flex-wrap items-center gap-3"><span className="grid h-14 w-14 place-items-center rounded-full bg-[#0067b1] font-bold text-white">{lead.initials}</span><div><h2 className="text-2xl font-semibold">{lead.name}</h2><div className="mt-2 flex gap-2"><Pill tone={lead.priority === "Alta" ? "green" : "yellow"}>{lead.priority} prioridad</Pill><Pill>{lead.route}</Pill></div></div></div>
            <div className="mt-7 grid gap-4 sm:grid-cols-3">
              <div className="rounded-[20px] bg-[#0067b1] p-5 text-white"><div className="text-[10px] uppercase tracking-[.12em] text-white/55">Propensión comercial</div><div className="mt-2 text-3xl font-semibold">{lead.score}/100</div></div>
              <div className="rounded-[20px] bg-black/[.025] p-5"><div className="text-[10px] uppercase tracking-[.12em] text-black/40">Confianza del perfil</div><div className="mt-2 text-2xl font-semibold">{Math.round(lead.confidence * 100)}%</div></div>
              <div className="rounded-[20px] bg-black/[.025] p-5"><div className="text-[10px] uppercase tracking-[.12em] text-black/40">Capacidad</div><div className="mt-2 text-2xl font-semibold">{lead.capacity}</div><div className="mt-1 text-xs text-black/45">Estimación orientativa</div></div>
            </div>
            <div className="mt-6"><ProgressBar value={lead.score} label="Preparación comercial" /></div>
          </section>
          <section className="surface-solid p-6 sm:p-8"><h2 className="text-lg font-semibold">Resumen ejecutivo</h2><div className="mt-5 grid gap-4 sm:grid-cols-2">{[["Objetivo", lead.goal], ["Ubicación", lead.location], ["Horizonte", lead.horizon], ["Afiliación", lead.affiliate], ["Barrera principal", lead.blocker], ["Proyecto", lead.project]].map(([label, value]) => <div key={label} className="rounded-[18px] border border-black/[.065] p-4"><div className="text-[10px] uppercase tracking-[.11em] text-black/40">{label}</div><div className="mt-2 text-sm font-semibold">{value}</div></div>)}</div></section>
          <section className="surface-card p-6 sm:p-8"><h2 className="text-lg font-semibold">Beneficios y financiación</h2><p className="mt-3 text-sm leading-6 text-black/52">Cualquier beneficio permanece pendiente de validación. La capacidad mostrada no constituye aprobación de crédito ni asignación de subsidio.</p></section>
        </div>
        <aside className="space-y-5 xl:sticky xl:top-24 xl:self-start">
          <section className="rounded-[26px] bg-[#0c1620] p-6 text-white"><div className="flex items-center justify-between"><div className="text-xs font-bold uppercase tracking-[.14em] text-[#ffd000]">Próxima mejor acción</div><Icon name="sparkles" className="h-5 w-5 text-[#ffd000]" /></div><h3 className="mt-5 text-2xl font-semibold tracking-[-.04em]">{lead.nextAction}</h3><p className="mt-3 text-xs leading-5 text-white/58">{lead.blocker}</p></section>
          {lead.project !== "Sin asignar" && lead.project !== "Por definir" ? <section className="surface-card p-6"><h3 className="text-lg font-semibold">Proyecto compatible</h3><div className="mt-4 text-xl font-semibold">{lead.project}</div><Link href="/asesor/comparador" className="mt-5 inline-flex h-11 w-full items-center justify-center gap-2 rounded-full border border-black/10 text-xs font-semibold"><Icon name="compare" className="h-4 w-4" />Abrir comparador</Link></section> : null}
        </aside>
      </div>
    </PortalShell>
  );
}

import Link from "next/link";
import { notFound } from "next/navigation";
import { PortalShell } from "@/components/portal-shell";
import { Icon } from "@/components/icon";
import { Pill, ProgressBar } from "@/components/ui";
import { leads } from "@/lib/data";

export function generateStaticParams() { return leads.map((lead) => ({ id: lead.id })); }

export default async function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const lead = leads.find((item) => item.id === id);
  if (!lead) notFound();
  return (
    <PortalShell
      role="asesor"
      title={lead.name}
      subtitle={`${lead.email} · ${lead.phone}`}
      actions={
        <>
          <button className="inline-flex h-11 items-center gap-2 rounded-full border border-black/[.08] bg-white px-5 text-xs font-semibold"><Icon name="mail" className="h-4 w-4" />Enviar correo</button>
          <button className="inline-flex h-11 items-center gap-2 rounded-full bg-[#0c1620] px-5 text-xs font-semibold text-white"><Icon name="phone" className="h-4 w-4" />Registrar llamada</button>
        </>
      }
    >
      <Link href="/asesor/leads" className="mb-5 inline-flex items-center gap-2 text-xs font-semibold text-black/45 hover:text-[#0067b1]"><Icon name="arrow" className="h-4 w-4 rotate-180" />Volver a la bandeja</Link>
      <div className="grid gap-5 xl:grid-cols-[1.25fr_.75fr]">
        <div className="space-y-5">
          <section className="surface-card p-6 sm:p-8">
            <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-start">
              <div className="flex items-center gap-4"><span className="grid h-16 w-16 place-items-center rounded-full bg-[#0067b1] text-lg font-bold text-white">{lead.initials}</span><div><div className="flex items-center gap-2"><h2 className="text-2xl font-semibold tracking-[-.04em]">{lead.name}</h2><Pill tone={lead.priority === "Alta" ? "red" : "yellow"}>{lead.priority} prioridad</Pill></div><div className="mt-2 flex flex-wrap gap-x-5 gap-y-2 text-xs text-black/45"><span className="inline-flex items-center gap-1.5"><Icon name="mail" className="h-3.5 w-3.5" />{lead.email}</span><span className="inline-flex items-center gap-1.5"><Icon name="phone" className="h-3.5 w-3.5" />{lead.phone}</span><span className="inline-flex items-center gap-1.5"><Icon name="location" className="h-3.5 w-3.5" />Bogotá</span></div></div></div>
              <select className="h-11 rounded-full border border-black/10 bg-white px-4 text-xs font-semibold outline-none"><option>{lead.state}</option><option>Contactado</option><option>Cita agendada</option><option>En negociación</option><option>Separación</option><option>Descartado</option></select>
            </div>
            <div className="mt-8 grid gap-4 sm:grid-cols-4"><div className="rounded-[20px] bg-[#0067b1] p-5 text-white"><div className="text-[10px] uppercase tracking-[.12em] text-white/50">Score</div><div className="mt-2 text-3xl font-semibold">{lead.score}</div><div className="mt-1 text-xs text-[#ffd000]">Nivel {lead.tier}</div></div><div className="rounded-[20px] bg-black/[.025] p-5"><div className="text-[10px] uppercase tracking-[.12em] text-black/40">Prob. conversión</div><div className="mt-2 text-2xl font-semibold">78%</div><div className="mt-1 text-xs text-emerald-700">Alta</div></div><div className="rounded-[20px] bg-black/[.025] p-5"><div className="text-[10px] uppercase tracking-[.12em] text-black/40">Capacidad</div><div className="mt-2 text-2xl font-semibold">{lead.capacity}</div><div className="mt-1 text-xs text-black/45">Orientativa</div></div><div className="rounded-[20px] bg-black/[.025] p-5"><div className="text-[10px] uppercase tracking-[.12em] text-black/40">Compra esperada</div><div className="mt-2 text-2xl font-semibold">1–3</div><div className="mt-1 text-xs text-black/45">meses</div></div></div>
          </section>

          <section className="surface-card p-6 sm:p-8"><div className="flex items-center justify-between"><div><h2 className="text-lg font-semibold">Perfil financiero</h2><p className="mt-1 text-xs text-black/40">Información declarada y validada durante el perfilamiento.</p></div><button className="inline-flex items-center gap-2 text-xs font-semibold text-[#0067b1]"><Icon name="edit" className="h-4 w-4" />Editar</button></div><div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{[["Ingreso del hogar","$4.800.000"],["Obligaciones","$520.000"],["Ahorros","$18.000.000"],["Cesantías","$13.500.000"],["Cuota disponible","$1.450.000"],["Tipo de contrato","Indefinido"]].map(([label,value]) => <div key={label} className="rounded-[18px] border border-black/[.065] p-4"><div className="text-[10px] uppercase tracking-[.11em] text-black/38">{label}</div><div className="mt-2 text-sm font-semibold">{value}</div></div>)}</div></section>

          <section className="surface-card p-6 sm:p-8"><h2 className="text-lg font-semibold">Preferencias y señales de intención</h2><div className="mt-6 grid gap-5 lg:grid-cols-2"><div><div className="space-y-3">{[["location","Ubicación","Bogotá occidental"],["building","Tipo","Apartamento nuevo"],["home","Habitaciones","2–3 habitaciones"],["clock","Horizonte","Menos de 3 meses"]].map(([icon,label,value]) => <div key={label} className="flex items-center gap-3 rounded-[18px] bg-black/[.025] p-4"><span className="grid h-9 w-9 place-items-center rounded-full bg-[#ffd000]/25 text-[#0067b1]"><Icon name={icon as Parameters<typeof Icon>[0]["name"]} className="h-4 w-4" /></span><div><div className="text-[10px] text-black/40">{label}</div><div className="mt-1 text-sm font-semibold">{value}</div></div></div>)}</div></div><div className="rounded-[24px] bg-emerald-50 p-5"><div className="flex items-center gap-2 text-sm font-semibold text-emerald-800"><Icon name="sparkles" className="h-4 w-4" />Razones del score alto</div><ul className="mt-4 space-y-3 text-xs leading-5 text-emerald-900/70"><li>• Contrato indefinido y antigüedad superior a 24 meses.</li><li>• Cuota inicial cercana al 17% del inmueble objetivo.</li><li>• Relación deuda/ingreso en rango saludable.</li><li>• Interacción completa con tres proyectos.</li></ul></div></div></section>

          <section className="surface-card p-6 sm:p-8"><div className="flex items-center justify-between"><h2 className="text-lg font-semibold">Historial de actividad</h2><button className="inline-flex items-center gap-2 text-xs font-semibold text-[#0067b1]"><Icon name="plus" className="h-4 w-4" />Añadir nota</button></div><div className="mt-6 space-y-0">{[
            ["Perfil completado", "El lead finalizó 8 preguntas y autorizó contacto comercial.", "21 jul · 10:24", "check"],
            ["Proyecto consultado", "Visualizó Reserva del Parque durante 4 min 12 s.", "21 jul · 10:31", "building"],
            ["Simulación guardada", "Escenario de $186 M con cuota inicial de $30 M.", "21 jul · 10:38", "money"],
            ["Asignación automática", "Asignado a Laura Cárdenas por zona y disponibilidad.", "21 jul · 10:42", "user"],
          ].map(([title,desc,time,icon], i, arr) => <div key={title} className="relative flex gap-4 pb-6"><div className="relative"><span className="grid h-10 w-10 place-items-center rounded-full bg-[#0067b1]/8 text-[#0067b1]"><Icon name={icon as Parameters<typeof Icon>[0]["name"]} className="h-4 w-4" /></span>{i < arr.length-1 ? <span className="absolute left-1/2 top-10 h-[calc(100%-2.5rem)] w-px -translate-x-1/2 bg-black/[.08]" /> : null}</div><div className="flex-1 pt-1"><div className="flex flex-col justify-between gap-1 sm:flex-row"><div className="text-sm font-semibold">{title}</div><div className="text-[10px] text-black/35">{time}</div></div><p className="mt-1 text-xs leading-5 text-black/48">{desc}</p></div></div>)}</div></section>
        </div>

        <aside className="space-y-5 xl:sticky xl:top-24 xl:self-start">
          <section className="rounded-[26px] bg-[#0c1620] p-6 text-white"><div className="flex items-center justify-between"><div className="text-xs font-bold uppercase tracking-[.14em] text-[#ffd000]">Próxima mejor acción</div><Icon name="sparkles" className="h-5 w-5 text-[#ffd000]" /></div><h3 className="mt-5 text-2xl font-semibold tracking-[-.04em]">Llamar hoy entre 2:00 y 4:00 p. m.</h3><p className="mt-3 text-xs leading-5 text-white/58">Confirmar saldo de cesantías y ofrecer visita virtual de Reserva del Parque.</p><div className="mt-6 rounded-[20px] bg-white/[.07] p-4"><div className="text-[10px] uppercase tracking-[.11em] text-white/35">Argumento sugerido</div><p className="mt-2 text-xs leading-5 text-white/70">“El proyecto está dentro de tu rango y la cuota inicial podría cubrirse con los recursos que ya reportaste.”</p></div><button className="mt-5 inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-[#ffd000] text-xs font-bold text-[#0c1620]"><Icon name="phone" className="h-4 w-4" />Iniciar llamada</button></section>
          <section className="surface-card p-6"><div className="flex items-center justify-between"><h3 className="text-lg font-semibold">Proyecto recomendado</h3><Pill tone="green">94% match</Pill></div><div className="mt-5 rounded-[20px] bg-[#ffd000]/18 p-5"><div className="text-xs font-semibold text-[#0067b1]">Bogotá · Fontibón</div><div className="mt-1 text-xl font-semibold">Reserva del Parque</div><div className="mt-4 flex justify-between text-xs"><span className="text-black/45">Precio desde</span><b>$186 M</b></div><div className="mt-3 flex justify-between text-xs"><span className="text-black/45">Cuota estimada</span><b>$1,31 M</b></div></div><div className="mt-5"><ProgressBar value={94} /></div><Link href="/asesor/comparador" className="mt-5 inline-flex h-11 w-full items-center justify-center gap-2 rounded-full border border-black/10 text-xs font-semibold"><Icon name="compare" className="h-4 w-4" />Comparar alternativas</Link></section>
          <section className="surface-card p-6"><h3 className="text-lg font-semibold">Documentos</h3><div className="mt-5 space-y-3">{[["Certificado laboral","Validado"],["Desprendible de nómina","Validado"],["Certificado de cesantías","Pendiente"]].map(([name,state]) => <div key={name} className="flex items-center justify-between rounded-[16px] bg-black/[.025] p-3"><div className="flex items-center gap-2 text-xs font-medium"><Icon name="document" className="h-4 w-4 text-[#0067b1]" />{name}</div><Pill tone={state === "Validado" ? "green" : "yellow"}>{state}</Pill></div>)}</div></section>
        </aside>
      </div>
    </PortalShell>
  );
}

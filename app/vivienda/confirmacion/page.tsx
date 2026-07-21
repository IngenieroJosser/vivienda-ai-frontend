import Link from "next/link";
import { PublicHeader } from "@/components/public-header";
import { Icon } from "@/components/icon";

export default function ConfirmacionPage() {
  return (
    <div className="internal-shell">
      <PublicHeader />
      <main className="mx-auto grid min-h-[calc(100vh-76px)] max-w-[1120px] place-items-center px-5 py-10 sm:px-8 lg:px-12">
        <div className="flow-panel w-full overflow-hidden">
          <div className="grid lg:grid-cols-[minmax(0,1fr)_330px]">
            <section className="p-7 text-center sm:p-10 lg:p-12">
              <div className="relative mx-auto grid h-28 w-28 place-items-center"><span className="absolute inset-0 rounded-full bg-emerald-100 pulse-soft" /><span className="relative grid h-20 w-20 place-items-center rounded-[24px] bg-emerald-600 text-white shadow-[0_18px_44px_rgba(5,150,105,.23)]"><Icon name="check" className="h-10 w-10" /></span></div>
              <div className="mt-7 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[.14em] text-emerald-700">Cita confirmada</div>
              <h1 className="mx-auto mt-5 max-w-2xl text-4xl font-bold leading-[.98] tracking-[-.055em] sm:text-5xl">Ya tienes un siguiente paso.</h1>
              <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-black/48">Enviaremos la confirmación a tu correo y teléfono. La asesora recibirá el resumen del perfil antes de la reunión.</p>

              <div className="mx-auto mt-8 grid max-w-2xl gap-3 text-left sm:grid-cols-2">
                {[["calendar", "Fecha y hora", "Jueves 23 de julio · 11:30 a. m."], ["camera", "Canal", "Videollamada · Google Meet"], ["building", "Proyecto", "Reserva del Parque"], ["document", "Radicado", "VMA-2026-07231"]].map(([icon, label, value]) => <div key={label} className="rounded-[17px] border border-black/[.065] bg-[#f8f9f9] p-4"><div className="flex items-center gap-3"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-[11px] bg-[#0067b1]/7 text-[#0067b1]"><Icon name={icon as Parameters<typeof Icon>[0]["name"]} className="h-4 w-4" /></span><div><div className="text-[8px] font-bold uppercase tracking-[.1em] text-black/35">{label}</div><div className={`mt-1 text-[11px] font-bold ${label === "Radicado" ? "font-mono" : ""}`}>{value}</div></div></div></div>)}
              </div>

              <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row"><button className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-black/[.08] bg-white px-6 text-xs font-bold shadow-sm transition hover:border-[#0067b1]/20 hover:text-[#0067b1]"><Icon name="calendar" className="h-4 w-4" />Añadir al calendario</button><Link href="/vivienda/proyectos" className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[#0067b1] px-6 text-xs font-bold text-white shadow-[0_12px_28px_rgba(0,103,177,.18)] transition hover:-translate-y-0.5 hover:bg-[#005995]">Volver a proyectos <Icon name="arrow" className="h-4 w-4" /></Link></div>
            </section>

            <aside className="relative overflow-hidden border-t border-black/[.06] bg-[#111820] p-7 text-white lg:border-l lg:border-t-0 lg:p-8">
              <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-[#ffd000]/20 blur-3xl" />
              <div className="relative"><div className="flex items-center justify-between"><div className="text-[9px] font-bold uppercase tracking-[.14em] text-[#ffd000]">Antes de la cita</div><Icon name="document" className="h-5 w-5 text-[#ffd000]" /></div><h2 className="mt-5 text-2xl font-bold tracking-[-.04em]">Prepárate para aprovecharla.</h2><div className="mt-6 space-y-4">{["Ten disponible tu documento de identidad.", "Confirma el saldo actualizado de cesantías.", "Revisa las características del proyecto.", "Prepara preguntas sobre financiación y subsidios."].map((item, index) => <div key={item} className="flex gap-3 text-[10px] leading-5 text-white/58"><span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-white/[.08] text-[9px] font-bold text-[#ffd000]">{index + 1}</span>{item}</div>)}</div><div className="mt-8 rounded-[17px] border border-white/10 bg-white/[.055] p-4"><div className="flex gap-3"><Icon name="shield" className="mt-0.5 h-5 w-5 shrink-0 text-[#ffd000]" /><div><div className="text-xs font-bold">Tu perfil ya fue compartido</div><p className="mt-1 text-[9px] leading-4 text-white/42">La asesora verá únicamente la información necesaria para orientar la conversación.</p></div></div></div><Link href="/" className="mt-6 inline-flex items-center gap-2 text-[10px] font-bold text-white">Volver al inicio <Icon name="arrow" className="h-3.5 w-3.5" /></Link></div>
            </aside>
          </div>
        </div>
      </main>
    </div>
  );
}

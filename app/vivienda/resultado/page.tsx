import Link from "next/link";
import { PublicFlowShell } from "@/components/public-flow-shell";
import { Icon } from "@/components/icon";
import { Pill, ProgressBar } from "@/components/ui";

export default function ResultadoPage() {
  return (
    <PublicFlowShell step={4} eyebrow="Resultado personalizado" title="Tu perfil está listo para avanzar." description="Este diagnóstico resume tu preparación actual, explica los factores principales y prioriza tus siguientes acciones.">
      <div className="space-y-5">
        <section className="flow-panel overflow-hidden">
          <div className="grid lg:grid-cols-[minmax(0,1fr)_310px]">
            <div className="p-7 sm:p-9">
              <div className="flex flex-col gap-7 sm:flex-row sm:items-center">
                <div className="relative grid h-36 w-36 shrink-0 place-items-center rounded-full bg-[conic-gradient(#0067b1_0_84%,rgba(0,103,177,.10)_84%_100%)] p-3">
                  <div className="grid h-full w-full place-items-center rounded-full bg-white"><div className="text-center"><div className="text-4xl font-extrabold tracking-[-.06em] text-[#0067b1]">84%</div><div className="mt-1 text-[9px] font-bold uppercase tracking-[.1em] text-black/38">Compatibilidad</div></div></div>
                </div>
                <div><Pill tone="green">Preparación alta</Pill><h2 className="mt-4 text-3xl font-bold tracking-[-.045em]">¡Excelente, tu perfil tiene alta afinidad!</h2><p className="mt-3 max-w-xl text-sm leading-6 text-black/48">Tu estabilidad, recursos iniciales y horizonte de compra te permiten avanzar a una conversación comercial enfocada.</p><div className="mt-5 rounded-[16px] border border-[#0067b1]/12 bg-[#0067b1]/5 p-4"><div className="flex gap-3"><Icon name="info" className="mt-0.5 h-4 w-4 shrink-0 text-[#0067b1]" /><p className="text-[10px] leading-5 text-black/50">Este nivel indica que encontramos proyectos que se ajustan bien a tu presupuesto, preferencias y momento de compra.</p></div></div></div>
              </div>
            </div>
            <aside className="border-t border-black/[.06] bg-gradient-to-br from-[#f7fbff] to-white p-7 lg:border-l lg:border-t-0">
              <div className="flex items-center justify-between"><h3 className="text-sm font-bold">¿Por qué el resultado es alto?</h3><Icon name="target" className="h-5 w-5 text-[#0067b1]" /></div>
              <div className="mt-5 space-y-4">{["Tu presupuesto se alinea con proyectos disponibles.", "La ubicación priorizada tiene oferta compatible.", "El nivel de endeudamiento está en un rango saludable.", "Tu intención de compra es inferior a seis meses."].map((item) => <div key={item} className="flex gap-2.5 text-[10px] leading-5 text-black/50"><span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-emerald-50 text-emerald-700"><Icon name="check" className="h-3 w-3" /></span>{item}</div>)}</div>
              <button className="mt-6 inline-flex items-center gap-2 text-[10px] font-bold text-[#0067b1]">Ver detalle de compatibilidad <Icon name="arrow" className="h-3.5 w-3.5" /></button>
            </aside>
          </div>
        </section>

        <div className="grid gap-5 sm:grid-cols-2">
          <section className="surface-card p-6"><div className="flex items-center justify-between"><div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-[13px] bg-[#ffd000]/22 text-[#0067b1]"><Icon name="money" className="h-5 w-5" /></span><h3 className="text-sm font-bold">Capacidad estimada</h3></div><span className="text-[9px] text-black/35">Orientativo</span></div><div className="mt-5 text-3xl font-extrabold tracking-[-.05em] text-[#0067b1]">$175M – $210M</div><p className="mt-2 text-[10px] leading-5 text-black/43">Rango aproximado del valor de vivienda compatible.</p><div className="mt-5 grid grid-cols-2 gap-3"><div className="rounded-[15px] bg-[#f6f7f7] p-4"><div className="text-[9px] text-black/38">Cuota mensual</div><div className="mt-1 text-sm font-bold">Hasta $1,45 M</div></div><div className="rounded-[15px] bg-[#f6f7f7] p-4"><div className="text-[9px] text-black/38">Cuota inicial</div><div className="mt-1 text-sm font-bold">$28–35 M</div></div></div></section>
          <section className="surface-card p-6"><div className="flex items-center justify-between"><div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-[13px] bg-[#0067b1]/7 text-[#0067b1]"><Icon name="building" className="h-5 w-5" /></span><h3 className="text-sm font-bold">Afinidad inmobiliaria</h3></div><span className="text-[9px] text-black/35">3 proyectos</span></div><div className="mt-5 text-3xl font-extrabold tracking-[-.05em]">94% mejor match</div><p className="mt-2 text-[10px] leading-5 text-black/43">Coincide con presupuesto, ubicación y tamaño del hogar.</p><div className="mt-6"><ProgressBar value={94} label="Compatibilidad del proyecto principal" /></div></section>
        </div>

        <section className="surface-card p-6 sm:p-8">
          <div className="flex items-center justify-between"><div><h3 className="text-lg font-bold">Fortalezas y siguientes pasos</h3><p className="mt-1 text-[10px] text-black/40">Acciones concretas para avanzar con mayor claridad.</p></div><Icon name="sparkles" className="h-5 w-5 text-[#ffd000]" /></div>
          <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_1fr_.8fr]">
            <div className="rounded-[18px] border border-emerald-100 bg-emerald-50/60 p-5"><div className="flex items-center gap-2 text-xs font-bold text-emerald-800"><Icon name="check" className="h-4 w-4" />Fortalezas</div><ul className="mt-4 space-y-3 text-[10px] leading-5 text-emerald-950/62"><li>Ingreso estable y verificable.</li><li>Ahorro inicial compatible.</li><li>Preferencias de ubicación claras.</li><li>Horizonte de compra definido.</li></ul></div>
            <div className="rounded-[18px] border border-[#ffd000]/25 bg-[#ffd000]/11 p-5"><div className="flex items-center gap-2 text-xs font-bold text-[#6f5900]"><Icon name="target" className="h-4 w-4" />Por validar</div><ul className="mt-4 space-y-3 text-[10px] leading-5 text-black/55"><li>Saldo actualizado de cesantías.</li><li>Valor final de obligaciones mensuales.</li><li>Disponibilidad de las unidades.</li><li>Condiciones formales de financiación.</li></ul></div>
            <div className="rounded-[18px] bg-[#111820] p-5 text-white"><div className="text-[9px] font-bold uppercase tracking-[.14em] text-[#ffd000]">Ruta recomendada</div><ol className="mt-4 space-y-3 text-[10px] leading-5 text-white/58"><li><b className="mr-2 text-white">1.</b>Explora proyectos compatibles.</li><li><b className="mr-2 text-white">2.</b>Compara y guarda favoritos.</li><li><b className="mr-2 text-white">3.</b>Agenda una asesoría.</li></ol></div>
          </div>
        </section>

        <div className="flex flex-col gap-3 sm:flex-row"><Link href="/vivienda/proyectos" className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-full bg-[#0067b1] px-6 text-sm font-bold text-white shadow-[0_12px_28px_rgba(0,103,177,.18)] transition hover:-translate-y-0.5 hover:bg-[#005995]">Ver proyectos recomendados <Icon name="arrow" className="h-4 w-4" /></Link><Link href="/vivienda/simulador" className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-black/[.08] bg-white px-6 text-sm font-bold shadow-sm transition hover:border-[#0067b1]/20 hover:text-[#0067b1]"><Icon name="money" className="h-4 w-4" />Abrir simulador</Link></div>
        <p className="rounded-[16px] border border-black/[.065] bg-white/75 p-4 text-[10px] leading-5 text-black/40">Este resultado es orientativo y no representa aprobación de crédito ni asignación garantizada de subsidios. Las condiciones finales dependen de validaciones formales.</p>
      </div>
    </PublicFlowShell>
  );
}

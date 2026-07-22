"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/icon";
import { AnimatedHeroBackground } from "@/components/animated-hero-background";

const cop = new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 });

export default function SimuladorPage() {
  const [price, setPrice] = useState(186000000);
  const [initial, setInitial] = useState(30000000);
  const [years, setYears] = useState(20);
  const [rate, setRate] = useState(11.5);
  const [income, setIncome] = useState(4800000);

  const result = useMemo(() => {
    const principal = Math.max(0, price - initial);
    const monthlyRate = rate / 100 / 12;
    const n = years * 12;
    const payment = monthlyRate ? principal * monthlyRate * Math.pow(1 + monthlyRate, n) / (Math.pow(1 + monthlyRate, n) - 1) : principal / n;
    return { principal, payment, ratio: payment / income * 100 };
  }, [price, initial, years, rate, income]);

  const healthy = result.ratio <= 30;

  return (
    <main className="mx-auto max-w-[1400px] px-5 py-9 sm:px-8 lg:px-12 lg:py-12">
        <div className="grid gap-6 xl:grid-cols-[340px_minmax(0,1fr)]">
          <aside className="xl:sticky xl:top-28 xl:self-start">
            <div className="simulator-hero relative overflow-hidden rounded-[30px] bg-[#111820] p-7 text-white shadow-[0_20px_54px_rgba(17,24,32,.17)]">
              <AnimatedHeroBackground variant="dark" compact interactive={false} />
              <div className="relative z-10 inline-flex items-center gap-2 rounded-full bg-white/[.07] px-3 py-1.5 text-[9px] font-bold uppercase tracking-[.14em] text-[#ffd000]"><Icon name="money" className="h-3.5 w-3.5" />Simulador financiero</div>
              <h1 className="mt-6 text-4xl font-bold leading-[.95] tracking-[-.055em]">Explora escenarios antes de decidir.</h1>
              <p className="mt-5 text-xs leading-6 text-white/48">Ajusta precio, cuota inicial, plazo y tasa de referencia. El cálculo es informativo y no corresponde a una oferta de crédito.</p>
              <div className="mt-7 rounded-[18px] bg-[#ffd000] p-5 text-[#111820]"><div className="flex items-start gap-3"><Icon name="sparkles" className="mt-0.5 h-5 w-5 shrink-0" /><div><div className="text-xs font-extrabold">Escenario recomendado</div><p className="mt-1 text-[10px] leading-5 text-black/58">Procura mantener la cuota por debajo del 30% de los ingresos mensuales del hogar.</p></div></div></div>
              <Link href="/vivienda/proyectos" className="mt-5 inline-flex items-center gap-2 text-[10px] font-bold text-white">Volver a proyectos <Icon name="arrow" className="h-3.5 w-3.5" /></Link>
            </div>
          </aside>

          <section className="flow-panel overflow-hidden">
            <div className="grid lg:grid-cols-[minmax(0,1fr)_320px]">
              <div className="p-6 sm:p-8 lg:p-9">
                <div className="flex items-center justify-between"><div><h2 className="text-2xl font-bold tracking-[-.04em]">Configura el escenario</h2><p className="mt-1 text-[10px] text-black/40">Valores aproximados en pesos colombianos.</p></div><button className="hidden items-center gap-2 text-[10px] font-bold text-[#0067b1] sm:inline-flex"><Icon name="history" className="h-4 w-4" />Restablecer</button></div>

                <div className="mt-7 grid gap-5 sm:grid-cols-2">
                  {[
                    ["Valor del inmueble", price, setPrice, 100000000, 400000000, 1000000],
                    ["Cuota inicial", initial, setInitial, 10000000, 150000000, 1000000],
                    ["Ingreso mensual del hogar", income, setIncome, 1500000, 15000000, 100000],
                  ].map(([label, value, setter, min, max, step]) => <label key={label as string}><span className="form-label">{label as string}</span><div className="relative"><span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold text-black/35">$</span><input className="form-field pl-8" type="number" value={value as number} min={min as number} max={max as number} step={step as number} onChange={(e) => (setter as (value: number) => void)(Number(e.target.value))} /></div></label>)}
                  <label><span className="form-label">Plazo</span><select className="form-field" value={years} onChange={(e) => setYears(Number(e.target.value))}><option value={10}>10 años</option><option value={15}>15 años</option><option value={20}>20 años</option><option value={25}>25 años</option><option value={30}>30 años</option></select></label>
                  <label><span className="form-label">Tasa de referencia efectiva anual</span><div className="relative"><input className="form-field pr-10" type="number" step="0.1" value={rate} onChange={(e) => setRate(Number(e.target.value))} /><span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-black/35">%</span></div></label>
                </div>

                <div className="mt-8 rounded-[20px] border border-black/[.065] bg-[#f7f8f8] p-5">
                  <div className="flex items-center justify-between"><div className="text-xs font-bold">Esfuerzo financiero estimado</div><span className={`rounded-full px-3 py-1 text-[9px] font-extrabold ${healthy ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}>{healthy ? "Rango saludable" : "Requiere ajuste"}</span></div>
                  <div className="mt-4 h-3 overflow-hidden rounded-full bg-black/[.065]"><div className={`h-full rounded-full transition-all ${healthy ? "bg-gradient-to-r from-[#ffd000] to-emerald-500" : "bg-gradient-to-r from-[#ffd000] to-rose-500"}`} style={{ width: `${Math.min(result.ratio, 100)}%` }} /></div>
                  <div className="mt-2 flex justify-between text-[9px] text-black/35"><span>0%</span><span>Recomendado 30%</span><span>100%</span></div>
                </div>

                <div className="mt-6 flex flex-col gap-3 sm:flex-row"><Link href="/vivienda/proyectos" className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-full bg-[#0067b1] text-sm font-bold text-white shadow-[0_12px_28px_rgba(0,103,177,.18)] transition hover:-translate-y-0.5 hover:bg-[#005995]">Buscar proyectos en este rango <Icon name="arrow" className="h-4 w-4" /></Link><button className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-black/[.08] bg-white px-5 text-xs font-bold shadow-sm"><Icon name="download" className="h-4 w-4" />Guardar escenario</button></div>
              </div>

              <aside className="border-t border-black/[.06] bg-gradient-to-b from-[#f7fbff] to-white p-6 lg:border-l lg:border-t-0 lg:p-7">
                <div className="text-[9px] font-bold uppercase tracking-[.14em] text-[#0067b1]">Resultado del escenario</div>
                <div className="mt-5 space-y-4">
                  <div className="rounded-[18px] bg-[#111820] p-5 text-white"><div className="text-[9px] text-white/38">Cuota mensual aproximada</div><div className="mt-2 text-3xl font-extrabold tracking-[-.05em] text-[#ffd000]">{cop.format(result.payment)}</div><div className="mt-2 text-[10px] text-white/42">Durante {years} años</div></div>
                  {[["Valor a financiar", cop.format(result.principal)], ["Relación cuota / ingreso", `${result.ratio.toFixed(1)}%`], ["Aporte inicial", `${Math.round(initial / price * 100)}%`]].map(([label, value]) => <div key={label} className="rounded-[16px] border border-black/[.06] bg-white p-4 shadow-sm"><div className="text-[9px] text-black/38">{label}</div><div className="mt-1.5 text-lg font-bold tracking-[-.03em]">{value}</div></div>)}
                </div>
                <div className={`mt-5 rounded-[17px] p-4 ${healthy ? "bg-emerald-50" : "bg-rose-50"}`}><div className="flex gap-3"><Icon name={healthy ? "check" : "alert"} className={`mt-0.5 h-4 w-4 shrink-0 ${healthy ? "text-emerald-700" : "text-rose-700"}`} /><p className={`text-[10px] leading-5 ${healthy ? "text-emerald-900/65" : "text-rose-900/65"}`}>{healthy ? "El esfuerzo estimado se encuentra en un rango saludable para el ingreso reportado." : "Considera aumentar la cuota inicial, reducir el valor del inmueble o extender el plazo."}</p></div></div>
              </aside>
            </div>
          </section>
        </div>
      </main>
  );
}

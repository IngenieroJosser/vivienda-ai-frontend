"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/icon";

const tasks = [
  { title: "Validación de identidad", detail: "Verificamos consistencia y calidad de la información." },
  { title: "Análisis financiero", detail: "Estimamos ingresos, obligaciones y capacidad de pago." },
  { title: "Evaluación de preparación", detail: "Aplicamos reglas claras y factores explicables." },
  { title: "Match con proyectos", detail: "Ordenamos opciones compatibles con tu perfil." },
];

export default function AnalizandoPage() {
  const router = useRouter();
  const [active, setActive] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setActive((value) => Math.min(tasks.length, value + 1)), 900);
    return () => clearInterval(id);
  }, []);

  const percentage = Math.min(100, Math.round((active / tasks.length) * 100));

  return (
    <main className="mx-auto grid min-h-[calc(100vh-76px)] max-w-[1220px] place-items-center px-5 py-10 sm:px-8 lg:px-12">
        <div className="flow-panel w-full overflow-hidden">
          <div className="grid lg:grid-cols-[minmax(0,1fr)_340px]">
            <section className="p-7 sm:p-10 lg:p-12">
              <div className="inline-flex items-center gap-2 rounded-full bg-[#0067b1]/6 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[.14em] text-[#0067b1]"><Icon name="brain" className="h-4 w-4" />Análisis inteligente</div>
              <h1 className="mt-6 max-w-2xl text-4xl font-bold leading-[.98] tracking-[-.055em] sm:text-5xl">Estamos construyendo tu recomendación.</h1>
              <p className="mt-4 max-w-xl text-sm leading-7 text-black/47">Procesamos tu información con reglas transparentes para que comprendas el resultado y las acciones sugeridas.</p>

              <div className="mt-9 rounded-[20px] border border-black/[.065] bg-[#f8f9f9] p-5 sm:p-6">
                <div className="flex items-center justify-between"><div><div className="text-sm font-bold">Análisis en progreso</div><div className="mt-1 text-[10px] text-black/40">Tiempo estimado: menos de 1 minuto</div></div><span className="text-lg font-extrabold text-[#0067b1]">{percentage}%</span></div>
                <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-black/[.065]"><div className="shimmer h-full rounded-full bg-gradient-to-r from-[#ffd000] to-[#0067b1] transition-all duration-500" style={{ width: `${Math.max(8, percentage)}%` }} /></div>
              </div>

              <div className="mt-7 grid gap-3 sm:grid-cols-2">
                {tasks.map((task, index) => {
                  const done = index < active;
                  const current = index === active;
                  return (
                    <div key={task.title} className={`rounded-[18px] border p-4 transition ${done ? "border-emerald-100 bg-emerald-50/55" : current ? "border-[#0067b1]/18 bg-[#f5faff] shadow-[0_10px_28px_rgba(0,103,177,.06)]" : "border-black/[.065] bg-white opacity-55"}`}>
                      <div className="flex items-center gap-3"><span className={`grid h-9 w-9 shrink-0 place-items-center rounded-[11px] ${done ? "bg-emerald-600 text-white" : current ? "bg-[#ffd000] text-[#111820]" : "bg-black/[.045] text-black/35"}`}>{done ? <Icon name="check" className="h-4 w-4" /> : <span className="text-xs font-extrabold">{index + 1}</span>}</span><div><div className="text-xs font-bold">{task.title}</div><div className="mt-1 text-[9px] leading-4 text-black/40">{task.detail}</div></div></div>
                      {current ? <div className="mt-3 flex items-center gap-2 text-[9px] font-bold text-[#0067b1]"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#0067b1]" />Procesando ahora</div> : done ? <div className="mt-3 text-[9px] font-bold text-emerald-700">Completado</div> : null}
                    </div>
                  );
                })}
              </div>

              {active >= tasks.length ? (
                <button onClick={() => router.push("/vivienda/resultado")} className="mt-8 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#0067b1] text-sm font-bold text-white shadow-[0_12px_28px_rgba(0,103,177,.18)] transition hover:-translate-y-0.5 hover:bg-[#005995]">Ver mi resultado <Icon name="arrow" className="h-4 w-4" /></button>
              ) : (
                <div className="mt-7 flex items-start gap-3 rounded-[16px] bg-[#0067b1]/5 p-4"><Icon name="info" className="mt-0.5 h-4 w-4 shrink-0 text-[#0067b1]" /><p className="text-[10px] leading-5 text-black/48">No cierres esta ventana. Guardaremos automáticamente el progreso cuando el análisis termine.</p></div>
              )}
            </section>

            <aside className="relative overflow-hidden border-t border-black/[.06] bg-[#111820] p-7 text-white lg:border-l lg:border-t-0 lg:p-9">
              <div className="absolute -right-28 -top-24 h-72 w-72 rounded-full bg-[#ffd000]/22 blur-3xl" />
              <div className="relative">
                <div className="mx-auto grid h-28 w-28 place-items-center rounded-full border border-white/10 bg-white/[.055]"><span className="pulse-soft absolute h-20 w-20 rounded-full bg-[#ffd000]/45" /><span className="relative grid h-16 w-16 place-items-center rounded-[20px] bg-[#ffd000] text-[#111820]"><Icon name="sparkles" className="h-8 w-8" /></span></div>
                <h2 className="mt-8 text-center text-xl font-bold tracking-[-.03em]">¿Qué estamos haciendo?</h2>
                <div className="mt-6 space-y-4">{["Verificamos la información declarada.", "Calculamos capacidad y esfuerzo financiero.", "Identificamos factores positivos y riesgos.", "Buscamos proyectos compatibles y disponibles."].map((item, index) => <div key={item} className="flex gap-3 text-[11px] leading-5 text-white/58"><span className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full ${index < active ? "bg-emerald-500 text-white" : "bg-white/10 text-white/35"}`}><Icon name={index < active ? "check" : "clock"} className="h-3 w-3" /></span>{item}</div>)}</div>
                <div className="mt-8 rounded-[18px] border border-white/10 bg-white/[.055] p-4"><div className="flex items-center gap-3"><Icon name="shield" className="h-5 w-5 text-[#ffd000]" /><div><div className="text-xs font-bold">Proceso controlado</div><p className="mt-1 text-[9px] leading-4 text-white/42">El sistema no aprueba créditos ni asigna subsidios automáticamente.</p></div></div></div>
              </div>
            </aside>
          </div>
        </div>
      </main>
  );
}

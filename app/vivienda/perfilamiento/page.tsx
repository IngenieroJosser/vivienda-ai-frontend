"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PublicFlowShell } from "@/components/public-flow-shell";
import { Icon } from "@/components/icon";

const questions = [
  { title: "¿Cuál es tu objetivo principal al buscar vivienda?", subtitle: "Esto nos permite orientar las siguientes preguntas y recomendar opciones más relevantes.", options: ["Vivir en mi propio hogar", "Invertir para arrendar", "Invertir para revender", "Traslado laboral o estudios"] },
  { title: "¿Con cuántas personas vivirías?", subtitle: "Esto ayuda a recomendar el tamaño adecuado.", options: ["Viviría solo(a)", "2 personas", "3 personas", "4 o más"] },
  { title: "¿Cuál es el ingreso mensual total de tu hogar?", subtitle: "Suma ingresos laborales, independientes y otros ingresos recurrentes.", options: ["Menos de $2 millones", "$2 a $4 millones", "$4 a $6 millones", "Más de $6 millones"] },
  { title: "¿Cómo recibes la mayor parte de tus ingresos?", subtitle: "Selecciona la opción que mejor representa tu situación actual.", options: ["Contrato indefinido", "Contrato fijo", "Independiente", "Mixto u otro"] },
  { title: "¿Cuánto pagas mensualmente en obligaciones?", subtitle: "Incluye créditos, tarjetas, libranzas y otras cuotas.", options: ["No tengo obligaciones", "Hasta $500 mil", "$500 mil a $1 millón", "Más de $1 millón"] },
  { title: "¿Con qué recursos cuentas para la cuota inicial?", subtitle: "Puedes seleccionar la fuente principal y ajustar el valor después.", options: ["Ahorros", "Cesantías", "Ahorros + cesantías", "Todavía no tengo recursos"] },
  { title: "¿Dónde te gustaría comprar vivienda?", subtitle: "Usaremos esta preferencia para ordenar los proyectos.", options: ["Bogotá", "Mosquera / Funza", "Soacha", "Estoy abierto(a) a opciones"] },
  { title: "¿Cuándo te gustaría comprar?", subtitle: "Esto determina la prioridad y el tipo de acompañamiento.", options: ["En menos de 3 meses", "Entre 3 y 6 meses", "Entre 6 y 12 meses", "Estoy explorando"] },
];

const optionIcons = ["home", "chart", "money", "location"] as const;

export default function PerfilamientoPage() {
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const question = questions[index];
  const progress = Math.round(((index + 1) / questions.length) * 100);

  function choose(answer: string) {
    const next = [...answers];
    next[index] = answer;
    setAnswers(next);
  }

  function next() {
    if (!answers[index]) return;
    if (index === questions.length - 1) router.push("/vivienda/documentos");
    else setIndex((v) => v + 1);
  }

  return (
    <PublicFlowShell step={2} eyebrow="Perfilamiento inteligente" title="Una pregunta a la vez." description="El flujo se adapta a tus respuestas y evita solicitar información que no aporte a la orientación.">
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_300px]">
        <section className="flow-panel min-h-[570px] p-6 sm:p-8 lg:p-9">
          <div className="flex items-center justify-between gap-4">
            <div className="inline-flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-[.14em] text-[#0067b1]"><Icon name="sparkles" className="h-4 w-4 text-[#ffd000]" />Pregunta {index + 1} de {questions.length}</div>
            <span className="rounded-full border border-black/[.06] bg-[#f7f8f8] px-3 py-1.5 text-[10px] font-bold text-black/42">≈ {Math.max(1, 5 - Math.floor(index / 2))} min restantes</span>
          </div>

          <div className="mt-7 max-w-3xl">
            <h2 className="text-3xl font-bold leading-[1.08] tracking-[-.045em] sm:text-4xl">{question.title}</h2>
            <p className="mt-3 text-sm leading-6 text-black/45">{question.subtitle}</p>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {question.options.map((option, optionIndex) => {
              const selected = answers[index] === option;
              return (
                <button
                  key={option}
                  onClick={() => choose(option)}
                  className={`group flex min-h-[86px] items-center gap-4 rounded-[18px] border p-4 text-left transition ${selected ? "border-[#0067b1] bg-[#f1f8fd] text-[#0067b1] shadow-[0_10px_26px_rgba(0,103,177,.09)]" : "border-black/[.085] bg-white hover:border-[#0067b1]/28 hover:bg-[#fafcff]"}`}
                >
                  <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-[14px] transition ${selected ? "bg-[#0067b1] text-white" : "bg-black/[.035] text-black/50 group-hover:bg-[#ffd000]/22 group-hover:text-[#0067b1]"}`}><Icon name={optionIcons[optionIndex] ?? "sparkles"} className="h-5 w-5" /></span>
                  <span className="flex-1 text-sm font-bold">{option}</span>
                  <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-full border transition ${selected ? "border-[#0067b1] bg-[#0067b1] text-white" : "border-black/12 text-transparent"}`}><Icon name="check" className="h-3.5 w-3.5" /></span>
                </button>
              );
            })}
          </div>

          <div className="mt-10 flex items-center justify-between border-t border-black/[.065] pt-6">
            <button onClick={() => setIndex((v) => Math.max(0, v - 1))} disabled={index === 0} className="inline-flex h-11 items-center gap-2 rounded-full px-3 text-xs font-bold text-black/42 transition hover:bg-black/[.035] hover:text-black disabled:opacity-20"><Icon name="arrow" className="h-4 w-4 rotate-180" />Anterior</button>
            <button onClick={next} disabled={!answers[index]} className="inline-flex h-12 items-center gap-2 rounded-full bg-[#0067b1] px-7 text-sm font-bold text-white shadow-[0_12px_28px_rgba(0,103,177,.18)] transition hover:-translate-y-0.5 hover:bg-[#005995] disabled:opacity-25">{index === questions.length - 1 ? "Finalizar perfil" : "Continuar"}<Icon name="arrow" className="h-4 w-4" /></button>
          </div>
        </section>

        <aside className="space-y-4">
          <section className="flow-aside-card p-5">
            <div className="flex items-center justify-between"><h3 className="text-sm font-bold">Tu progreso</h3><span className="text-sm font-extrabold text-[#0067b1]">{progress}%</span></div>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-black/[.06]"><div className="h-full rounded-full bg-gradient-to-r from-[#ffd000] to-[#0067b1] transition-all" style={{ width: `${progress}%` }} /></div>
            <p className="mt-4 text-[11px] leading-5 text-black/47">Estamos construyendo tu perfil para encontrar opciones ajustadas a tu realidad.</p>
          </section>

          <section className="surface-card p-5">
            <div className="flex items-center justify-between"><h3 className="text-sm font-bold">Resumen de tu perfil</h3><button className="text-[10px] font-bold text-[#0067b1]">Editar</button></div>
            <div className="mt-5 space-y-4">
              {[
                ["user", "Tipo de perfil", "Persona natural"],
                ["users", "Composición", answers[1] || "Por definir"],
                ["location", "Ciudad de interés", answers[6] || "Por definir"],
                ["briefcase", "Situación laboral", answers[3] || "Por definir"],
              ].map(([icon, label, value]) => <div key={label} className="flex items-center gap-3"><span className="grid h-8 w-8 shrink-0 place-items-center rounded-[10px] bg-black/[.035] text-black/45"><Icon name={icon as Parameters<typeof Icon>[0]["name"]} className="h-4 w-4" /></span><div className="min-w-0 flex-1"><div className="text-[9px] text-black/38">{label}</div><div className="mt-0.5 truncate text-[11px] font-bold">{value}</div></div></div>)}
            </div>
          </section>

          <section className="rounded-[22px] bg-[#111820] p-5 text-white">
            <div className="flex items-center justify-between"><div className="text-[9px] font-bold uppercase tracking-[.14em] text-[#ffd000]">Rango estimado</div><Icon name="home" className="h-5 w-5 text-white/30" /></div>
            <div className="mt-4 text-2xl font-bold tracking-[-.04em]">$175M – $210M</div>
            <p className="mt-2 text-[10px] leading-5 text-white/43">Este rango se ajustará a medida que completemos el perfil.</p>
          </section>
        </aside>
      </div>
    </PublicFlowShell>
  );
}

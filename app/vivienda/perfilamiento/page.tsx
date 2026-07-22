"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PublicFlowShell } from "@/components/public-flow-shell";
import { Icon } from "@/components/icon";

const questions = [
  { key:"goal", title:"¿En qué momento estás frente a la compra?", subtitle:"Tu respuesta cambia la profundidad del flujo.", options:["Quiero comprar en 0–3 meses","Quiero comprar en 3–6 meses","Podría comprar en 6–12 meses","Solo estoy explorando"], icons:["target","calendar","clock","search"] },
  { key:"income", title:"¿Cuál es el ingreso mensual total de tu hogar?", subtitle:"Incluye ingresos estables de quienes participarían en la compra.", options:["Menos de $2 millones","Entre $2 y $4 millones","Entre $4 y $6 millones","Más de $6 millones"], icons:["money","money","chart","chart"] },
  { key:"initial", title:"¿Con qué recursos cuentas para la cuota inicial?", subtitle:"Puedes combinar varias fuentes; por ahora selecciona la principal.", options:["Ahorros y cesantías","Solo ahorros","Solo cesantías","Aún no tengo recursos"], icons:["briefcase","money","document","clock"] },
  { key:"home", title:"¿Actualmente tienes vivienda propia?", subtitle:"Esto ayuda a identificar condiciones generales de subsidio y el tipo de proyecto aplicable.", options:["No tengo vivienda","Sí, tengo vivienda","Estoy en proceso de compra","No estoy seguro(a)"], icons:["home","building","document","info"] },
  { key:"debt", title:"¿Cómo describirías tus obligaciones mensuales?", subtitle:"No necesitamos consultar centrales de riesgo para esta orientación inicial.", options:["No tengo obligaciones","Menos de $500 mil","Entre $500 mil y $1 millón","Más de $1 millón"], icons:["check","money","chart","alert"] },
  { key:"credit", title:"¿Cómo ha sido tu comportamiento de pago recientemente?", subtitle:"Es una declaración orientativa; la solución no aprueba créditos.", options:["Siempre pago al día","Tuve retrasos menores","Tengo obligaciones en mora","Prefiero revisarlo con un asesor"], icons:["shield","clock","alert","users"] },
  { key:"location", title:"¿Dónde te gustaría comprar?", subtitle:"Ordenaremos el catálogo en lugar de mostrarte todos los proyectos.", options:["Bogotá","Mosquera / Funza","Soacha","Estoy abierto(a) a opciones"], icons:["location","location","location","search"] },
];

export default function PerfilamientoPage() {
  const router = useRouter();
  const [index,setIndex]=useState(0);
  const [answers,setAnswers]=useState<Record<string,string>>({});
  const q=questions[index];
  const selected=answers[q.key];
  const progress=Math.round(((index+1)/questions.length)*100);
  const choose=(answer:string)=>setAnswers((prev)=>({...prev,[q.key]:answer}));
  const next=()=>{if(!selected)return;if(index===questions.length-1)router.push("/vivienda/analizando");else setIndex((v)=>v+1)};

  return <PublicFlowShell step={2} eyebrow="Perfil adaptativo" title="No todos los leads necesitan las mismas preguntas." description="El motor combina intención, afiliación, capacidad, subsidio potencial y afinidad con inventario. La experiencia se mantiene breve y explicable.">
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_300px]">
      <section className="flow-panel min-h-[560px] p-6 sm:p-8 lg:p-9">
        <div className="flex items-center justify-between gap-4"><div className="inline-flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-[.14em] text-[#0067b1]"><Icon name="brain" className="h-4 w-4" />Pregunta adaptativa {index+1}</div><span className="rounded-full bg-[#ffd000]/18 px-3 py-1.5 text-[10px] font-bold text-[#6f5900]">{questions.length-index} por validar</span></div>
        <div className="mt-7 max-w-3xl"><h2 className="text-3xl font-bold leading-[1.08] tracking-[-.045em] sm:text-4xl">{q.title}</h2><p className="mt-3 text-sm leading-6 text-black/45">{q.subtitle}</p></div>
        <div className="mt-8 grid gap-3 sm:grid-cols-2">{q.options.map((option,i)=>{const active=selected===option;return <button key={option} onClick={()=>choose(option)} className={`group flex min-h-[88px] items-center gap-4 rounded-[18px] border p-4 text-left transition ${active?"border-[#0067b1] bg-[#f1f8fd] text-[#0067b1] shadow-[0_10px_26px_rgba(0,103,177,.09)]":"border-black/[.085] bg-white hover:border-[#0067b1]/28"}`}><span className={`grid h-11 w-11 shrink-0 place-items-center rounded-[14px] ${active?"bg-[#0067b1] text-white":"bg-black/[.035] text-black/50"}`}><Icon name={q.icons[i] as Parameters<typeof Icon>[0]["name"]} className="h-5 w-5" /></span><span className="flex-1 text-sm font-bold">{option}</span><span className={`grid h-7 w-7 place-items-center rounded-full border ${active?"border-[#0067b1] bg-[#0067b1] text-white":"border-black/12 text-transparent"}`}><Icon name="check" className="h-3.5 w-3.5" /></span></button>})}</div>
        <div className="mt-10 flex items-center justify-between border-t border-black/[.065] pt-6"><button onClick={()=>setIndex((v)=>Math.max(0,v-1))} disabled={index===0} className="inline-flex h-11 items-center gap-2 rounded-full px-3 text-xs font-bold text-black/42 disabled:opacity-20"><Icon name="arrow" className="h-4 w-4 rotate-180" />Anterior</button><button onClick={next} disabled={!selected} className="inline-flex h-12 items-center gap-2 rounded-full bg-[#0067b1] px-7 text-sm font-bold text-white disabled:opacity-25">{index===questions.length-1?"Calcular mi ruta":"Continuar"}<Icon name="arrow" className="h-4 w-4" /></button></div>
      </section>
      <aside className="space-y-4"><section className="flow-aside-card p-5"><div className="flex items-center justify-between"><h3 className="text-sm font-bold">Perfil completado</h3><b className="text-[#0067b1]">{progress}%</b></div><div className="mt-4 h-2 overflow-hidden rounded-full bg-black/[.06]"><div className="h-full rounded-full bg-gradient-to-r from-[#ffd000] to-[#0067b1] transition-all" style={{width:`${progress}%`}} /></div><p className="mt-4 text-[11px] leading-5 text-black/47">Las preguntas siguientes pueden cambiar según tus respuestas.</p></section><section className="surface-card p-5"><div className="text-[9px] font-bold uppercase tracking-[.14em] text-[#0067b1]">Señales construidas</div><div className="mt-4 space-y-3">{[["target","Intención",answers.goal],["money","Capacidad",answers.income],["home","Subsidio",answers.home],["location","Afinidad",answers.location]].map(([icon,label,value])=><div key={label} className="flex items-center gap-3"><span className="grid h-8 w-8 place-items-center rounded-[10px] bg-black/[.035]"><Icon name={icon as Parameters<typeof Icon>[0]["name"]} className="h-4 w-4" /></span><div><div className="text-[9px] text-black/38">{label}</div><div className="mt-0.5 text-[11px] font-bold">{value||"Por definir"}</div></div></div>)}</div></section><section className="rounded-[22px] bg-[#111820] p-5 text-white"><div className="text-[9px] font-bold uppercase tracking-[.14em] text-[#ffd000]">Posible salida</div><div className="mt-3 text-xl font-bold">Asesor, validación o nutrición</div><p className="mt-2 text-[10px] leading-5 text-white/45">Ningún lead se descarta: cada perfil recibe una siguiente acción.</p></section></aside>
    </div>
  </PublicFlowShell>;
}

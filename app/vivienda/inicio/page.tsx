"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PublicFlowShell } from "@/components/public-flow-shell";
import { Icon } from "@/components/icon";

const channels = ["Meta / Instagram", "Google", "WhatsApp", "Sitio Colsubsidio", "Contact center", "Otro"];

export default function InicioPage() {
  const router = useRouter();
  const [consent, setConsent] = useState(false);
  const [affiliate, setAffiliate] = useState("");
  const [channel, setChannel] = useState("Meta / Instagram");

  return (
    <PublicFlowShell step={1} eyebrow="Origen y afiliación" title="Empecemos por lo que realmente cambia tu ruta." description="Identificamos el canal de origen y tu relación con Colsubsidio desde el inicio. Así evitamos preguntas innecesarias y respetamos la regla 90/10.">
      <form onSubmit={(e) => { e.preventDefault(); if (consent && affiliate) router.push("/vivienda/perfilamiento"); }} className="flow-panel overflow-hidden">
        <div className="grid lg:grid-cols-[minmax(0,1fr)_300px]">
          <div className="p-6 sm:p-8 lg:p-9">
            <div className="flex items-start justify-between gap-5"><div><h2 className="text-2xl font-bold tracking-[-.04em]">Crea tu perfil en pocos minutos</h2><p className="mt-2 text-xs leading-5 text-black/45">No pediremos documentos ni información crediticia sensible. Solo lo necesario para orientarte.</p></div><span className="hidden rounded-full bg-[#ffd000]/20 px-3 py-1.5 text-[10px] font-bold text-[#6f5900] sm:inline-flex">Flujo adaptativo</span></div>

            <div className="mt-7 grid gap-5 sm:grid-cols-2">
              <label><span className="form-label">Nombre completo</span><input required className="form-field" placeholder="Daniela Rojas" autoComplete="name" /></label>
              <label><span className="form-label">Celular o WhatsApp</span><input required className="form-field" placeholder="300 000 0000" inputMode="tel" autoComplete="tel" /></label>
              <label><span className="form-label">Correo electrónico</span><input required type="email" className="form-field" placeholder="nombre@correo.com" autoComplete="email" /></label>
              <label><span className="form-label">¿Por cuál canal llegaste?</span><select value={channel} onChange={(e)=>setChannel(e.target.value)} className="form-field">{channels.map((item)=><option key={item}>{item}</option>)}</select></label>
            </div>

            <div className="mt-8"><div className="form-label">¿Estás afiliado(a) a Colsubsidio?</div><p className="mt-1 text-[10px] leading-5 text-black/42">Esta respuesta define la ruta comercial. Si no estás seguro, podremos validarlo después.</p><div className="mt-4 grid gap-3 sm:grid-cols-3">{["Sí, estoy afiliado(a)","No estoy afiliado(a)","No estoy seguro(a)"].map((item)=>{const selected=affiliate===item;return <button type="button" key={item} onClick={()=>setAffiliate(item)} className={`rounded-[17px] border p-4 text-left text-xs font-bold transition ${selected?"border-[#0067b1] bg-[#f1f8fd] text-[#0067b1]":"border-black/[.08] bg-white hover:border-[#0067b1]/25"}`}><span className={`mb-3 grid h-9 w-9 place-items-center rounded-[11px] ${selected?"bg-[#0067b1] text-white":"bg-black/[.035] text-black/45"}`}><Icon name={item.startsWith("Sí")?"shield":item.startsWith("No estoy seguro")?"info":"users"} className="h-4 w-4" /></span>{item}</button>})}</div></div>

            <label className="mt-7 flex cursor-pointer items-start gap-3 rounded-[16px] border border-black/[.065] bg-white p-4"><span className={`relative mt-0.5 h-6 w-11 shrink-0 rounded-full transition ${consent?"bg-[#0067b1]":"bg-black/10"}`}><input type="checkbox" className="sr-only" checked={consent} onChange={(e)=>setConsent(e.target.checked)} /><span className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition ${consent?"left-6":"left-1"}`} /></span><span><span className="block text-xs font-bold">Autorizo el tratamiento de mis datos</span><span className="mt-1 block text-[10px] leading-5 text-black/42">Para construir mi perfil, recomendar proyectos y contactarme según la ruta que resulte.</span></span></label>

            <div className="mt-7 flex justify-end border-t border-black/[.065] pt-6"><button disabled={!consent || !affiliate} className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[#0067b1] px-7 text-sm font-bold text-white shadow-[0_12px_28px_rgba(0,103,177,.18)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-30">Iniciar perfil inteligente <Icon name="arrow" className="h-4 w-4" /></button></div>
          </div>

          <aside className="border-t border-black/[.06] bg-gradient-to-b from-[#f7fbff] to-white p-6 lg:border-l lg:border-t-0 lg:p-7">
            <div className="rounded-[20px] bg-[#111820] p-5 text-white"><div className="text-[9px] font-bold uppercase tracking-[.14em] text-[#ffd000]">Regla 90/10</div><div className="mt-3 text-3xl font-extrabold">90%</div><p className="mt-2 text-[10px] leading-5 text-white/55">De las ventas deben corresponder a afiliados. Por eso identificamos la afiliación antes de usar tiempo comercial.</p></div>
            <h3 className="mt-6 text-sm font-bold">¿Qué hará la inteligencia?</h3><div className="mt-4 space-y-4">{["Preguntar solo lo que falte.","Estimar capacidad sin aprobar crédito.","Definir asesoría o nutrición.","Mostrar únicamente proyectos compatibles."].map((item)=><div key={item} className="flex gap-2.5 text-[11px] leading-5 text-black/50"><span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-emerald-50 text-emerald-700"><Icon name="check" className="h-3 w-3" /></span>{item}</div>)}</div>
          </aside>
        </div>
      </form>
    </PublicFlowShell>
  );
}

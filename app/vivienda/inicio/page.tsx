"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PublicFlowShell } from "@/components/public-flow-shell";
import { Icon } from "@/components/icon";

export default function InicioPage() {
  const router = useRouter();
  const [consent, setConsent] = useState(false);
  const [contact, setContact] = useState(true);
  const [risk, setRisk] = useState(true);

  return (
    <PublicFlowShell step={1} eyebrow="Identificación" title="Empecemos por conocerte." description="Validamos tu identidad y guardamos el progreso para ofrecerte una experiencia segura, continua y personalizada.">
      <form onSubmit={(e) => { e.preventDefault(); if (consent) router.push("/vivienda/perfilamiento"); }} className="flow-panel overflow-hidden">
        <div className="grid lg:grid-cols-[minmax(0,1fr)_280px]">
          <div className="p-6 sm:p-8 lg:p-9">
            <div className="flex items-start justify-between gap-5">
              <div><h2 className="text-2xl font-bold tracking-[-.04em]">Validemos tu identidad</h2><p className="mt-2 text-xs leading-5 text-black/45">Completa los datos tal como aparecen en tu documento.</p></div>
              <span className="hidden rounded-full bg-[#ffd000]/20 px-3 py-1.5 text-[10px] font-bold text-[#6f5900] sm:inline-flex">2 minutos</span>
            </div>

            <div className="mt-7 grid gap-5 sm:grid-cols-2">
              <label><span className="form-label">Tipo de documento</span><select className="form-field"><option>Cédula de ciudadanía</option><option>Cédula de extranjería</option><option>Pasaporte</option></select></label>
              <label><span className="form-label">Número de documento</span><input required className="form-field" placeholder="1.023.456.789" inputMode="numeric" /></label>
              <label><span className="form-label">Nombres</span><input required className="form-field" placeholder="Daniela" /></label>
              <label><span className="form-label">Apellidos</span><input required className="form-field" placeholder="Rojas Martínez" /></label>
              <label><span className="form-label">Correo electrónico</span><input required type="email" className="form-field" placeholder="nombre@correo.com" /></label>
              <label><span className="form-label">Teléfono celular</span><input required className="form-field" placeholder="300 000 0000" inputMode="tel" /></label>
              <label><span className="form-label">Ciudad de residencia</span><select className="form-field"><option>Bogotá</option><option>Soacha</option><option>Mosquera</option><option>Funza</option><option>Otra</option></select></label>
              <label><span className="form-label">Afiliación a Colsubsidio</span><select className="form-field"><option>Sí, estoy afiliado(a)</option><option>No</option><option>No estoy seguro(a)</option></select></label>
            </div>

            <div className="mt-8 border-t border-black/[.065] pt-6">
              <div className="text-sm font-bold">Consentimientos y autorizaciones</div>
              <p className="mt-1 text-xs leading-5 text-black/42">Puedes consultar el detalle de cada autorización antes de continuar.</p>
              <div className="mt-5 space-y-3">
                {[
                  { checked: consent, set: setConsent, icon: "shield" as const, title: "Tratamiento de datos personales", detail: "Necesario para crear y procesar tu perfil." },
                  { checked: risk, set: setRisk, icon: "chart" as const, title: "Consulta para orientación financiera", detail: "Permite estimar capacidad y nivel de preparación." },
                  { checked: contact, set: setContact, icon: "phone" as const, title: "Contacto comercial", detail: "Autoriza comunicación por teléfono, correo o WhatsApp." },
                ].map((item) => (
                  <label key={item.title} className="flex cursor-pointer items-center gap-3 rounded-[16px] border border-black/[.065] bg-white p-3.5 transition hover:border-[#0067b1]/18">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-[11px] bg-[#0067b1]/7 text-[#0067b1]"><Icon name={item.icon} className="h-4 w-4" /></span>
                    <span className="min-w-0 flex-1"><span className="block text-xs font-bold">{item.title}</span><span className="mt-0.5 block text-[10px] text-black/40">{item.detail}</span></span>
                    <span className={`relative h-6 w-11 shrink-0 rounded-full transition ${item.checked ? "bg-[#0067b1]" : "bg-black/10"}`}><input type="checkbox" className="sr-only" checked={item.checked} onChange={(e) => item.set(e.target.checked)} /><span className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition ${item.checked ? "left-6" : "left-1"}`} /></span>
                  </label>
                ))}
              </div>
            </div>

            <div className="mt-7 flex flex-col-reverse justify-between gap-3 border-t border-black/[.065] pt-6 sm:flex-row sm:items-center">
              <button type="button" className="text-xs font-bold text-black/42 transition hover:text-[#0067b1]">Ya tengo un proceso iniciado</button>
              <button disabled={!consent} className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[#0067b1] px-7 text-sm font-bold text-white shadow-[0_12px_28px_rgba(0,103,177,.18)] transition hover:-translate-y-0.5 hover:bg-[#005995] disabled:cursor-not-allowed disabled:opacity-30">Continuar <Icon name="arrow" className="h-4 w-4" /></button>
            </div>
          </div>

          <aside className="border-t border-black/[.06] bg-gradient-to-b from-[#f7fbff] to-white p-6 lg:border-l lg:border-t-0 lg:p-7">
            <div className="mx-auto grid h-24 w-24 place-items-center rounded-full border border-[#0067b1]/12 bg-white shadow-[0_16px_38px_rgba(0,103,177,.09)]"><span className="grid h-14 w-14 place-items-center rounded-[18px] bg-[#0067b1] text-white"><Icon name="shield" className="h-7 w-7" /></span></div>
            <h3 className="mt-6 text-center text-sm font-bold text-[#0067b1]">Seguridad y confianza</h3>
            <div className="mt-5 space-y-4">
              {["Tratamiento de datos con consentimiento explícito.", "Información cifrada y acceso controlado.", "Puedes solicitar corrección o eliminación.", "Cada consulta conserva trazabilidad."].map((item) => <div key={item} className="flex gap-2.5 text-[11px] leading-5 text-black/50"><span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-emerald-50 text-emerald-700"><Icon name="check" className="h-3 w-3" /></span>{item}</div>)}
            </div>
            <div className="mt-7 rounded-[17px] border border-[#ffd000]/28 bg-[#ffd000]/13 p-4"><div className="flex gap-2.5"><Icon name="info" className="h-4 w-4 shrink-0 text-[#7a6100]" /><p className="text-[10px] leading-5 text-black/55">El resultado es orientativo y no constituye aprobación de crédito ni asignación garantizada de subsidio.</p></div></div>
          </aside>
        </div>
      </form>
    </PublicFlowShell>
  );
}

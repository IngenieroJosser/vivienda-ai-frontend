"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PublicFlowShell } from "@/components/public-flow-shell";
import { Icon } from "@/components/icon";

const docs = [
  { name: "Documento de identidad", detail: "Frente y reverso", icon: "user" as const, required: true },
  { name: "Comprobante de ingresos", detail: "Último mes o certificado laboral", icon: "briefcase" as const, required: true },
  { name: "Certificado de cesantías", detail: "Opcional, mejora la precisión", icon: "document" as const, required: false },
];

export default function DocumentosPage() {
  const router = useRouter();
  const [uploaded, setUploaded] = useState<string[]>([docs[0].name]);

  return (
    <PublicFlowShell step={3} eyebrow="Validación documental" title="Haz más preciso tu resultado." description="Carga documentos para contrastar los datos declarados. Siempre tendrás control antes de confirmar cualquier ajuste.">
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_280px]">
        <section className="flow-panel p-6 sm:p-8 lg:p-9">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
            <div><h2 className="text-2xl font-bold tracking-[-.04em]">Carguemos tus documentos</h2><p className="mt-2 text-xs leading-5 text-black/45">Formatos permitidos: PDF, JPG o PNG · máximo 10 MB.</p></div>
            <span className="inline-flex w-fit items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-[10px] font-bold text-emerald-700"><Icon name="lock" className="h-3.5 w-3.5" />Carga cifrada</span>
          </div>

          <div className="mt-7 space-y-3">
            {docs.map((doc, index) => {
              const done = uploaded.includes(doc.name);
              const processing = index === 1 && done;
              return (
                <div key={doc.name} className={`grid gap-4 rounded-[18px] border p-4 transition sm:grid-cols-[minmax(190px,.75fr)_1fr_170px] sm:items-center ${done ? "border-[#0067b1]/16 bg-[#f9fcff]" : "border-black/[.075] bg-white hover:border-[#0067b1]/20"}`}>
                  <div className="flex items-center gap-3"><span className={`grid h-11 w-11 shrink-0 place-items-center rounded-[13px] ${done ? "bg-[#0067b1] text-white" : "bg-black/[.035] text-black/48"}`}><Icon name={done ? "check" : doc.icon} className="h-5 w-5" /></span><div><div className="flex items-center gap-2 text-xs font-bold">{doc.name}{doc.required ? <span className="text-[8px] font-bold uppercase tracking-[.1em] text-[#0067b1]">Requerido</span> : null}</div><div className="mt-1 text-[10px] text-black/40">{doc.detail}</div></div></div>
                  <label className={`flex min-h-16 cursor-pointer items-center justify-center rounded-[14px] border border-dashed px-4 text-center transition ${done ? "border-[#0067b1]/22 bg-white" : "border-black/14 bg-[#fafafa] hover:border-[#0067b1]/30"}`}>
                    <input type="file" className="hidden" onChange={(e) => { if (e.target.files?.length) setUploaded((v) => [...new Set([...v, doc.name])]); }} />
                    <span className="text-[10px] leading-4 text-black/43">{done ? <><b className="text-[#0067b1]">Archivo cargado</b><br />Haz clic para reemplazarlo</> : <><b className="text-black/62">Suelta el archivo aquí</b><br />o selecciona desde tu equipo</>}</span>
                  </label>
                  <div className="rounded-[14px] bg-white p-3.5 shadow-sm">
                    {done ? <div className="flex items-center gap-2.5"><span className={`grid h-8 w-8 place-items-center rounded-[10px] ${processing ? "bg-[#ffd000]/22 text-[#7a6100]" : "bg-emerald-50 text-emerald-700"}`}><Icon name={processing ? "brain" : "check"} className="h-4 w-4" /></span><div><div className="text-[10px] font-bold">{processing ? "Procesando OCR" : "OCR completado"}</div><button className="mt-0.5 text-[9px] font-bold text-[#0067b1]">{processing ? "Extrayendo datos…" : "Ver información"}</button></div></div> : <div className="flex items-center gap-2.5 text-[10px] text-black/38"><Icon name="upload" className="h-4 w-4" />Pendiente de carga</div>}
                  </div>
                </div>
              );
            })}
          </div>

          {uploaded.length > 0 ? (
            <div className="mt-6 rounded-[18px] border border-[#ffd000]/28 bg-[#ffd000]/12 p-4"><div className="flex gap-3"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-[11px] bg-[#ffd000] text-[#111820]"><Icon name="sparkles" className="h-4 w-4" /></span><div><div className="text-xs font-bold">Primera validación completada</div><p className="mt-1 text-[10px] leading-5 text-black/52">El documento de identidad es legible. Cualquier diferencia detectada deberá ser confirmada antes de actualizar tu perfil.</p></div></div></div>
          ) : null}

          <div className="mt-7 flex flex-col-reverse justify-between gap-3 border-t border-black/[.065] pt-6 sm:flex-row sm:items-center">
            <button onClick={() => router.push("/vivienda/analizando")} className="text-xs font-bold text-black/42 transition hover:text-[#0067b1]">Continuar sin documentos</button>
            <button onClick={() => router.push("/vivienda/analizando")} className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[#0067b1] px-7 text-sm font-bold text-white shadow-[0_12px_28px_rgba(0,103,177,.18)] transition hover:-translate-y-0.5 hover:bg-[#005995]">Analizar mi perfil <Icon name="arrow" className="h-4 w-4" /></button>
          </div>
        </section>

        <aside className="space-y-4">
          <section className="surface-card p-5"><div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-[13px] bg-[#0067b1]/7 text-[#0067b1]"><Icon name="camera" className="h-5 w-5" /></span><div><h3 className="text-sm font-bold">Mejores resultados</h3><p className="mt-0.5 text-[10px] text-black/40">Antes de cargar</p></div></div><div className="mt-5 space-y-3">{["Documento completo y sin recortes.", "Buena iluminación y texto legible.", "Evita reflejos, sombras o desenfoque.", "No compartas contraseñas ni claves."].map((tip) => <div key={tip} className="flex gap-2.5 text-[10px] leading-5 text-black/48"><span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[#0067b1]" />{tip}</div>)}</div></section>
          <section className="rounded-[22px] bg-[#111820] p-5 text-white"><div className="flex items-center justify-between"><div className="text-[9px] font-bold uppercase tracking-[.14em] text-[#ffd000]">Estado</div><Icon name="document" className="h-5 w-5 text-white/30" /></div><div className="mt-4 text-3xl font-bold tracking-[-.05em]">{uploaded.length}/3</div><p className="mt-1 text-[10px] text-white/42">documentos cargados</p><div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-[#ffd000] transition-all" style={{ width: `${uploaded.length / docs.length * 100}%` }} /></div></section>
          <section className="flow-aside-card p-5"><div className="flex items-start gap-3"><Icon name="phone" className="mt-0.5 h-5 w-5 text-[#0067b1]" /><div><h3 className="text-xs font-bold">¿Necesitas ayuda?</h3><p className="mt-1 text-[10px] leading-5 text-black/45">Un asesor puede orientarte sin interrumpir el proceso.</p><button className="mt-3 text-[10px] font-bold text-[#0067b1]">Contactar asesor →</button></div></div></section>
        </aside>
      </div>
    </PublicFlowShell>
  );
}

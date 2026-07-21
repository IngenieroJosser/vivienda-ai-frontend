"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ProductBrand } from "@/components/brand";
import { Icon } from "@/components/icon";

export default function LoginPage() {
  const router = useRouter();
  const [show, setShow] = useState(false);

  return (
    <main className="grid min-h-screen bg-[#f5f7f8] lg:grid-cols-[minmax(520px,.88fr)_1.12fr]">
      <section className="relative flex flex-col overflow-hidden bg-white p-6 sm:p-10 lg:p-12 xl:p-14">
        <div className="absolute -left-32 -top-36 h-80 w-80 rounded-full bg-[#ffd000]/12 blur-3xl" />
        <div className="relative z-10"><ProductBrand /></div>
        <div className="relative z-10 mx-auto flex w-full max-w-[430px] flex-1 flex-col justify-center py-14">
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-[#0067b1]/10 bg-[#0067b1]/5 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[.15em] text-[#0067b1]"><Icon name="lock" className="h-3.5 w-3.5" />Acceso empresarial seguro</div>
          <h1 className="mt-6 text-4xl font-bold leading-[.98] tracking-[-.055em] sm:text-5xl">Continúa donde el lead te necesita.</h1>
          <p className="mt-5 text-sm leading-7 text-black/48">Gestiona oportunidades, campañas, proyectos y decisiones del motor de perfilamiento desde un único entorno.</p>

          <form onSubmit={(e) => { e.preventDefault(); router.push("/asesor/dashboard"); }} className="mt-9 space-y-5">
            <label><span className="form-label">Correo corporativo</span><div className="relative"><Icon name="mail" className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-black/35" /><input required type="email" className="form-field pl-11" defaultValue="laura.cardenas@colsubsidio.com" /></div></label>
            <label><span className="form-label">Contraseña</span><div className="relative"><Icon name="lock" className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-black/35" /><input required type={show ? "text" : "password"} className="form-field px-11" defaultValue="Colsubsidio2026" /><button type="button" onClick={() => setShow((v) => !v)} className="absolute right-3 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-lg text-black/35 transition hover:bg-black/[.04] hover:text-black"><Icon name="eye" className="h-4 w-4" /></button></div></label>
            <div className="flex items-center justify-between"><label className="flex items-center gap-2 text-xs text-black/52"><input type="checkbox" defaultChecked className="h-4 w-4 accent-[#0067b1]" />Recordarme</label><button type="button" className="text-xs font-bold text-[#0067b1]">¿Olvidaste tu contraseña?</button></div>
            <button className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#0067b1] text-sm font-bold text-white shadow-[0_12px_28px_rgba(0,103,177,.2)] transition hover:-translate-y-0.5 hover:bg-[#005995]">Ingresar al portal <Icon name="arrow" className="h-4 w-4" /></button>
          </form>

          <div className="mt-7 flex items-center gap-3"><span className="h-px flex-1 bg-black/[.075]" /><span className="text-[9px] font-semibold uppercase tracking-[.13em] text-black/32">o continuar con</span><span className="h-px flex-1 bg-black/[.075]" /></div>
          <button onClick={() => router.push("/asesor/dashboard")} className="mt-5 inline-flex h-12 w-full items-center justify-center gap-3 rounded-full border border-black/[.085] bg-white text-sm font-bold shadow-sm transition hover:border-[#0067b1]/20 hover:bg-[#f7fbff]"><span className="grid h-7 w-7 place-items-center rounded-[8px] bg-[#0067b1] text-[10px] font-black text-white">M</span>Microsoft Entra ID</button>
        </div>
        <div className="relative z-10 flex items-center gap-2 text-[10px] text-black/35"><Icon name="shield" className="h-4 w-4 text-[#0067b1]" />Acceso protegido con MFA, sesión corporativa y registro de auditoría.</div>
      </section>

      <section className="relative hidden overflow-hidden bg-[#111820] text-white lg:block">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_82%_18%,rgba(255,208,0,.30),transparent_28%),radial-gradient(circle_at_15%_88%,rgba(0,103,177,.45),transparent_32%)]" />
        <div className="absolute -right-40 top-28 h-[520px] w-[520px] rounded-full border border-white/10" />
        <div className="absolute -right-28 top-40 h-[380px] w-[380px] rounded-full border border-white/10" />
        <div className="relative flex h-full flex-col justify-between p-12 xl:p-16">
          <div className="flex items-center justify-between"><span className="rounded-full border border-white/12 bg-white/[.055] px-4 py-2 text-[10px] font-semibold text-white/65 backdrop-blur">Vivienda Match AI · Operación 2026</span><span className="grid h-11 w-11 place-items-center rounded-[15px] bg-[#ffd000] text-[#111820]"><Icon name="sparkles" className="h-5 w-5" /></span></div>
          <div className="max-w-3xl">
            <div className="text-[clamp(3.8rem,6vw,7rem)] font-semibold leading-[.83] tracking-[-.075em]">Cada lead llega con una historia lista para continuar.</div>
            <div className="mt-11 grid max-w-2xl grid-cols-3 divide-x divide-white/12 border-y border-white/12 py-6">
              <div className="pr-6"><div className="text-3xl font-bold text-[#ffd000]">84%</div><p className="mt-1 text-[11px] leading-4 text-white/45">Precisión del scoring</p></div>
              <div className="px-6"><div className="text-3xl font-bold">−38%</div><p className="mt-1 text-[11px] leading-4 text-white/45">Tiempo de perfilamiento</p></div>
              <div className="pl-6"><div className="text-3xl font-bold">+22%</div><p className="mt-1 text-[11px] leading-4 text-white/45">Conversión esperada</p></div>
            </div>
          </div>
          <div className="max-w-xl rounded-[24px] border border-white/10 bg-white/[.055] p-5 backdrop-blur"><div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-[13px] bg-[#ffd000] text-[#111820]"><Icon name="brain" className="h-5 w-5" /></span><div><div className="text-sm font-bold">Decisiones explicables</div><p className="mt-1 text-xs text-white/45">Cada score, recomendación y cambio conserva evidencia y trazabilidad.</p></div></div></div>
        </div>
      </section>
    </main>
  );
}

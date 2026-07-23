"use client";

import { ProductBrand } from "@/components/brand";
import { Icon } from "@/components/icon";
import { AnimatedHeroBackground } from "@/components/animated-hero-background";

export default function LoginPage() {
  return (
    <main className="login-stage grid min-h-screen bg-[#f5f7f8] lg:grid-cols-[minmax(520px,.88fr)_1.12fr]">
      <section className="relative flex flex-col bg-white p-6 sm:p-10 lg:p-12">
        <ProductBrand />
        <div className="mx-auto flex w-full max-w-[430px] flex-1 flex-col justify-center py-14">
          <div className="inline-flex w-fit items-center gap-2 rounded-full bg-[#0067b1]/5 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[.15em] text-[#0067b1]"><Icon name="lock" className="h-3.5 w-3.5" />Acceso para asesores</div>
          <h1 className="mt-6 text-4xl font-bold tracking-[-.055em] sm:text-5xl">Portal comercial</h1>
          <p className="mt-5 text-sm leading-7 text-black/48">La autenticación corporativa aún no está conectada. Esta pantalla no acepta credenciales ni inicia sesiones.</p>
          <form className="mt-9 space-y-5" aria-describedby="login-status">
            <label><span className="form-label">Correo corporativo</span><div className="relative"><Icon name="mail" className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-black/35" /><input disabled type="email" className="form-field pl-11 disabled:opacity-55" autoComplete="username" /></div></label>
            <label><span className="form-label">Contraseña</span><div className="relative"><Icon name="lock" className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-black/35" /><input disabled type="password" className="form-field pl-11 disabled:opacity-55" autoComplete="current-password" /></div></label>
            <button disabled className="inline-flex h-12 w-full items-center justify-center rounded-full bg-[#0067b1] text-sm font-bold text-white opacity-45">Acceso no configurado</button>
          </form>
          <p id="login-status" className="mt-5 text-xs leading-5 text-black/42">Se habilitará únicamente mediante el proveedor de identidad corporativo y contratos de sesión reales.</p>
        </div>
      </section>
      <section className="relative hidden overflow-hidden bg-[#111820] text-white lg:block"><AnimatedHeroBackground variant="dark" /><div className="relative z-10 flex h-full items-end p-14"><div><div className="text-xs font-bold uppercase tracking-[.18em] text-[#ffd000]">Vivienda Match AI</div><div className="mt-5 max-w-2xl text-6xl font-semibold leading-[.9] tracking-[-.06em]">Información útil para actuar con contexto.</div></div></div></section>
    </main>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import { ProductBrand } from "./brand";
import { Icon } from "./icon";

type Role = "asesor" | "marketing" | "admin";
type NavItem = { label: string; href: string; icon: Parameters<typeof Icon>[0]["name"] };

const roleConfig: Record<Role, { label: string; userRole: string; nav: NavItem[]; insight: string }> = {
  asesor: {
    label: "Portal comercial",
    userRole: "Asesora senior",
    insight: "Tienes 7 oportunidades de alta prioridad pendientes de contacto.",
    nav: [
      { label: "Dashboard", href: "/asesor/dashboard", icon: "grid" },
      { label: "Leads", href: "/asesor/leads", icon: "users" },
      { label: "Agenda", href: "/asesor/agenda", icon: "calendar" },
      { label: "Comparador", href: "/asesor/comparador", icon: "compare" },
    ],
  },
  marketing: {
    label: "Marketing intelligence",
    userRole: "Marketing manager",
    insight: "La campaña “Subsidio + vivienda” concentra la mejor calidad de lead esta semana.",
    nav: [
      { label: "Dashboard", href: "/marketing/dashboard", icon: "chart" },
      { label: "Campañas", href: "/marketing/campanas", icon: "campaign" },
      { label: "Leads", href: "/asesor/leads", icon: "users" },
    ],
  },
  admin: {
    label: "Administración",
    userRole: "Administración",
    insight: "El modelo v2.4.1 permanece estable y sin alertas críticas de drift.",
    nav: [
      { label: "Proyectos", href: "/admin/proyectos", icon: "building" },
      { label: "Motor de scoring", href: "/admin/scoring", icon: "brain" },
      { label: "Auditoría", href: "/admin/auditoria", icon: "shield" },
      { label: "Marketing", href: "/marketing/dashboard", icon: "chart" },
    ],
  },
};

export function PortalShell({ role, title, subtitle, actions, children }: { role: Role; title: string; subtitle?: string; actions?: ReactNode; children: ReactNode }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [roleOpen, setRoleOpen] = useState(false);
  const config = roleConfig[role];

  const nav = (
    <>
      <div className="px-3"><ProductBrand compact /></div>
      <div className="mx-2 mt-7 rounded-[18px] border border-[#0067b1]/10 bg-gradient-to-br from-[#f7fbff] to-white p-3.5">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="text-[9px] font-extrabold uppercase tracking-[.16em] text-[#0067b1]/65">Espacio actual</div>
            <div className="mt-1 truncate text-sm font-bold text-[#111820]">{config.label}</div>
          </div>
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-[12px] bg-[#ffd000] text-[#111820] shadow-[0_8px_20px_rgba(255,208,0,.22)]"><Icon name="sparkles" className="h-4 w-4" /></span>
        </div>
      </div>
      <nav className="mt-5 space-y-1 px-2">
        {config.nav.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`group flex items-center gap-3 rounded-[15px] px-3.5 py-3 text-sm transition ${active ? "bg-[#0067b1] text-white shadow-[0_10px_26px_rgba(0,103,177,.18)]" : "text-black/52 hover:bg-[#0067b1]/[.055] hover:text-[#0067b1]"}`}
            >
              <span className={`grid h-8 w-8 place-items-center rounded-[10px] transition ${active ? "bg-white/12" : "bg-black/[.035] group-hover:bg-white"}`}><Icon name={item.icon} className="h-[17px] w-[17px]" /></span>
              <span className="font-semibold">{item.label}</span>
              {active ? <span className="ml-auto h-2 w-2 rounded-full bg-[#ffd000]" /> : null}
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto px-2 pb-1">
        <div className="rounded-[18px] bg-[#111820] p-4 text-white shadow-[0_14px_36px_rgba(17,24,32,.13)]">
          <div className="flex items-center justify-between"><div className="text-[9px] font-extrabold uppercase tracking-[.14em] text-[#ffd000]">Insight del día</div><Icon name="brain" className="h-4 w-4 text-[#ffd000]" /></div>
          <p className="mt-3 text-[11px] leading-5 text-white/58">{config.insight}</p>
          <Link href={role === "admin" ? "/admin/scoring" : role === "marketing" ? "/marketing/dashboard" : "/asesor/leads"} className="mt-4 inline-flex items-center gap-2 text-[11px] font-bold text-white">Ver detalle <Icon name="arrow" className="h-3.5 w-3.5" /></Link>
        </div>
        <Link href="/login" className="mt-3 flex items-center gap-3 rounded-[15px] px-3.5 py-3 text-xs font-semibold text-black/40 transition hover:bg-black/[.035] hover:text-black"><Icon name="logout" className="h-4 w-4" />Cerrar sesión</Link>
      </div>
    </>
  );

  return (
    <div className="portal-app text-[#111820]">
      <aside className="portal-sidebar fixed inset-y-0 left-0 z-50 hidden w-[254px] border-r border-black/[.055] px-3 py-5 lg:flex lg:flex-col">{nav}</aside>

      {mobileOpen ? <button aria-label="Cerrar menú" className="fixed inset-0 z-40 bg-[#111820]/35 backdrop-blur-sm lg:hidden" onClick={() => setMobileOpen(false)} /> : null}
      <aside className={`portal-sidebar fixed inset-y-0 left-0 z-50 flex w-[280px] flex-col border-r border-black/[.06] p-4 transition-transform lg:hidden ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="mb-2 flex justify-end"><button onClick={() => setMobileOpen(false)} className="grid h-9 w-9 place-items-center rounded-full border border-black/[.08] bg-white"><Icon name="close" className="h-4 w-4" /></button></div>
        {nav}
      </aside>

      <main className="relative lg:pl-[254px]">
        <div className="portal-content-grid pointer-events-none fixed inset-x-0 top-0 z-0 h-[360px] lg:left-[254px]" />
        <header className="sticky top-0 z-30 border-b border-black/[.055] bg-white/84 backdrop-blur-2xl">
          <div className="flex h-[72px] items-center justify-between px-5 sm:px-8 lg:px-9">
            <div className="flex items-center gap-3">
              <button onClick={() => setMobileOpen(true)} className="grid h-10 w-10 place-items-center rounded-[13px] border border-black/[.08] bg-white shadow-sm lg:hidden"><Icon name="menu" /></button>
              <div className="relative hidden md:block">
                <button onClick={() => setRoleOpen((v) => !v)} className="flex items-center gap-2 rounded-full border border-black/[.065] bg-white px-4 py-2.5 text-xs font-bold text-black/62 shadow-sm transition hover:border-[#0067b1]/20">
                  {config.label}<Icon name="chevron" className={`h-3.5 w-3.5 transition ${roleOpen ? "rotate-90" : ""}`} />
                </button>
                {roleOpen ? (
                  <div className="absolute left-0 top-12 z-50 w-60 rounded-[18px] border border-black/[.075] bg-white p-2 shadow-[0_22px_60px_rgba(17,24,32,.14)]">
                    <Link href="/asesor/dashboard" className="block rounded-xl px-3 py-2.5 text-sm font-semibold hover:bg-black/[.035]">Portal comercial</Link>
                    <Link href="/marketing/dashboard" className="block rounded-xl px-3 py-2.5 text-sm font-semibold hover:bg-black/[.035]">Marketing intelligence</Link>
                    <Link href="/admin/proyectos" className="block rounded-xl px-3 py-2.5 text-sm font-semibold hover:bg-black/[.035]">Administración</Link>
                  </div>
                ) : null}
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <button className="relative grid h-10 w-10 place-items-center rounded-[13px] border border-black/[.065] bg-white shadow-sm"><Icon name="search" className="h-4 w-4 text-black/52" /></button>
              <button className="relative grid h-10 w-10 place-items-center rounded-[13px] border border-black/[.065] bg-white shadow-sm"><Icon name="alert" className="h-4 w-4 text-black/52" /><span className="absolute right-1.5 top-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-[#0067b1] px-1 text-[8px] font-black text-white ring-2 ring-white">3</span></button>
              <div className="flex items-center gap-3 rounded-full border border-black/[.065] bg-white py-1.5 pl-1.5 pr-3 shadow-sm">
                <span className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-[#0067b1] to-[#004f8c] text-[10px] font-extrabold text-white">LC</span>
                <div className="hidden text-left sm:block"><div className="text-[11px] font-bold">Laura Cárdenas</div><div className="text-[9px] text-black/40">{config.userRole}</div></div>
                <Icon name="chevron" className="hidden h-3 w-3 text-black/35 sm:block" />
              </div>
            </div>
          </div>
        </header>

        <div className="relative z-10 px-5 py-7 sm:px-8 lg:px-9 lg:py-8">
          <div className="mb-7 flex flex-col justify-between gap-5 xl:flex-row xl:items-end">
            <div>
              <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-[#0067b1]/10 bg-white/75 px-3 py-1.5 text-[9px] font-extrabold uppercase tracking-[.15em] text-[#0067b1] shadow-sm backdrop-blur"><span className="h-1.5 w-1.5 rounded-full bg-[#ffd000]" />Vivienda Match AI</div>
              <h1 className="text-3xl font-bold tracking-[-0.048em] sm:text-4xl">{title}</h1>
              {subtitle ? <p className="mt-2 max-w-3xl text-sm leading-6 text-black/48">{subtitle}</p> : null}
            </div>
            {actions ? <div className="flex flex-wrap gap-2.5">{actions}</div> : null}
          </div>
          {children}
        </div>
      </main>
    </div>
  );
}

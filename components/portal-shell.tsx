"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { createContext, useContext, useState, type ReactNode } from "react";
import { ProductBrand } from "./brand";
import { Icon } from "./icon";
import { AnimatedHeroBackground } from "./animated-hero-background";

type Role = "asesor";
type NavItem = { label: string; href: string; icon: Parameters<typeof Icon>[0]["name"] };

const roleConfig: Record<Role, { label: string; userRole: string; nav: NavItem[] }> = {
  asesor: {
    label: "Portal comercial",
    userRole: "Asesora senior",
    nav: [
      { label: "Resumen", href: "/asesor", icon: "chart" },
      { label: "Oportunidades", href: "/asesor/leads", icon: "users" },
      { label: "Agenda", href: "/asesor/agenda", icon: "calendar" },
      { label: "Nutrición", href: "/asesor/nutricion", icon: "heart" },
      { label: "Comparador", href: "/asesor/comparador", icon: "compare" },
    ],
  },
};

const PortalChromeContext = createContext<Role | null>(null);

export function PortalLayout({ role, children }: { role: Role; children: ReactNode }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
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
          const active = item.href === "/asesor"
            ? pathname === "/asesor" || pathname === "/asesor/resumen"
            : pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              prefetch
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
        <Link href="/login" prefetch className="mt-3 flex items-center gap-3 rounded-[15px] px-3.5 py-3 text-xs font-semibold text-black/40 transition hover:bg-black/[.035] hover:text-black"><Icon name="logout" className="h-4 w-4" />Cerrar sesión</Link>
      </div>
    </>
  );

  return (
    <PortalChromeContext.Provider value={role}>
      <div className={`portal-app portal-app--${role} text-[#111820]`}>
        <AnimatedHeroBackground variant={role} className="fixed inset-0" />
        <aside className="portal-sidebar fixed inset-y-0 left-0 z-50 hidden w-[254px] border-r border-black/[.055] px-3 py-5 lg:flex lg:flex-col">{nav}</aside>

        {mobileOpen ? <button aria-label="Cerrar menú" className="fixed inset-0 z-40 bg-[#111820]/35 lg:hidden" onClick={() => setMobileOpen(false)} /> : null}
        <aside className={`portal-sidebar fixed inset-y-0 left-0 z-50 flex w-[280px] flex-col border-r border-black/[.06] p-4 transition-transform lg:hidden ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}>
          <div className="mb-2 flex justify-end"><button onClick={() => setMobileOpen(false)} className="grid h-9 w-9 place-items-center rounded-full border border-black/[.08] bg-white"><Icon name="close" className="h-4 w-4" /></button></div>
          {nav}
        </aside>

        <main className="relative lg:pl-[254px]">
          <div className="portal-content-grid pointer-events-none fixed inset-x-0 top-0 z-0 h-[360px] lg:left-[254px]" />
          <header className="sticky top-0 z-30 border-b border-black/[.055] bg-white/95">
            <div className="flex h-[72px] items-center justify-between px-5 sm:px-8 lg:px-9">
              <div className="flex items-center gap-3">
                <button onClick={() => setMobileOpen(true)} className="grid h-10 w-10 place-items-center rounded-[13px] border border-black/[.08] bg-white shadow-sm lg:hidden"><Icon name="menu" /></button>
                <div className="hidden rounded-full border border-black/[.065] bg-white px-4 py-2.5 text-xs font-bold text-black/62 shadow-sm md:block">{config.label}</div>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="flex items-center gap-3 rounded-full border border-black/[.065] bg-white py-1.5 pl-1.5 pr-3 shadow-sm">
                  <span className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-[#0067b1] to-[#004f8c] text-[10px] font-extrabold text-white">AS</span>
                  <div className="hidden text-left sm:block"><div className="text-[11px] font-bold">Sesión de asesor</div><div className="text-[9px] text-black/40">{config.userRole}</div></div>
                </div>
              </div>
            </div>
          </header>

          <div className="portal-page relative z-10 px-5 py-7 sm:px-8 lg:px-9 lg:py-8">{children}</div>
        </main>
      </div>
    </PortalChromeContext.Provider>
  );
}

function PortalPage({ role, title, subtitle, actions, children }: { role: Role; title: string; subtitle?: string; actions?: ReactNode; children: ReactNode }) {
  const config = roleConfig[role];
  return (
    <>
      <section className={`portal-hero portal-hero--${role} mb-7 overflow-hidden rounded-[30px] border border-white/60 px-6 py-6 shadow-[0_18px_54px_rgba(17,24,32,.065)] sm:px-8 sm:py-7`}>
        <AnimatedHeroBackground variant={role} compact interactive={false} />
        <div className="portal-hero__content relative z-10 flex flex-col justify-between gap-6 xl:flex-row xl:items-end">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/55 bg-white/72 px-3 py-1.5 text-[9px] font-extrabold uppercase tracking-[.15em] text-[#0067b1] shadow-sm"><span className="h-1.5 w-1.5 rounded-full bg-[#ffd000] shadow-[0_0_0_5px_rgba(255,208,0,.14)]" />{config.label}</div>
            <h1 className="max-w-4xl text-3xl font-bold tracking-[-0.052em] text-[#101820] sm:text-4xl lg:text-[2.75rem]">{title}</h1>
            {subtitle ? <p className="mt-3 max-w-3xl text-sm leading-6 text-black/52">{subtitle}</p> : null}
          </div>
          <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
            {actions ? <div className="flex flex-wrap gap-2.5">{actions}</div> : null}
          </div>
        </div>
      </section>
      <div className="portal-page-reveal">{children}</div>
    </>
  );
}

export function PortalShell(props: { role: Role; title: string; subtitle?: string; actions?: ReactNode; children: ReactNode }) {
  const inheritedRole = useContext(PortalChromeContext);
  const page = <PortalPage {...props} />;
  return inheritedRole === props.role ? page : <PortalLayout role={props.role}>{page}</PortalLayout>;
}

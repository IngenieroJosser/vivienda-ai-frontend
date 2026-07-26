"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { ProductBrand } from "./brand";
import { Icon } from "./icon";
import { buildAgendaItems } from "@/features/advisor/agenda";
import { useCommercialStates } from "@/features/advisor/use-commercial-states";
import { useQualifiedLeads } from "@/features/conversation/components/use-qualified-leads";
import {
  isCommercialOpportunity,
  isNurturingLead,
} from "@/features/conversation/qualified-leads";

type Role = "asesor";
type NavItem = {
  label: string;
  href: string;
  icon: Parameters<typeof Icon>[0]["name"];
  count?: "opportunities" | "agenda" | "nurturing";
};

const roleConfig: Record<Role, { label: string; userRole: string; nav: NavItem[] }> = {
  asesor: {
    label: "Portal comercial",
    userRole: "Equipo comercial",
    nav: [
      { label: "Resumen", href: "/asesor", icon: "chart" },
      { label: "Oportunidades", href: "/asesor/leads", icon: "users", count: "opportunities" },
      { label: "Agenda", href: "/asesor/agenda", icon: "calendar", count: "agenda" },
      { label: "Acompañamiento", href: "/asesor/nutricion", icon: "heart", count: "nurturing" },
      { label: "Inteligencia", href: "/asesor/inteligencia", icon: "brain" },
    ],
  },
};

const PortalChromeContext = createContext<Role | null>(null);

export function PortalLayout({ role, children }: { role: Role; children: ReactNode }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const config = roleConfig[role];
  const qualifiedLeads = useQualifiedLeads();
  const { states } = useCommercialStates();
  const now = useMemo(() => new Date(), []);
  const counts = useMemo(() => {
    const opportunities = qualifiedLeads.filter(
      ({ evaluation, scenario }) =>
        isCommercialOpportunity(evaluation) &&
        !["WON", "DEFERRED", "NOT_VIABLE"].includes(
          states[scenario.leadId]?.status ?? "NEW",
        ),
    ).length;
    return {
      opportunities,
      agenda: buildAgendaItems(qualifiedLeads, states, now).length,
      nurturing: qualifiedLeads.filter(
        ({ evaluation, source }) =>
          source === "BACKEND" && isNurturingLead(evaluation),
      ).length,
    };
  }, [now, qualifiedLeads, states]);


  const nav = (
    <>
      <div className="flex flex-col items-center border-b border-[color:var(--vm-color-line)] px-3 pb-5 text-center">
        <ProductBrand compact iconOnly className="w-full justify-center" />
        <span className="mt-1 text-sm font-bold tracking-[-.025em] text-[color:var(--vm-color-brand-blue-deep)]">
          Vivienda
        </span>
      </div>
      <div className="mx-2 mt-7 rounded-[var(--vm-radius-card)] border border-[color:var(--vm-color-line)] bg-gradient-to-br from-[color:var(--vm-color-orientation-sky-soft)] to-white p-3.5">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="text-[11px] font-extrabold uppercase tracking-[.12em] text-[color:var(--vm-color-brand-blue)]">Espacio actual</div>
            <div className="mt-1 truncate text-sm font-bold text-[color:var(--vm-color-ink)]">{config.label}</div>
          </div>
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-[var(--vm-radius-control)] bg-[color:var(--vm-color-orientation-sky-soft)] text-[color:var(--vm-color-brand-blue)]"><Icon name="briefcase" className="h-4 w-4" /></span>
        </div>
      </div>
      <nav className="mt-5 space-y-1 px-2">
        {config.nav.map((item) => {
          const active = item.href === "/asesor"
            ? pathname === "/asesor" || pathname === "/asesor/resumen"
            : pathname === item.href || pathname.startsWith(`${item.href}/`);
          const count = item.count ? counts[item.count] : 0;
          return (
            <Link
              key={item.href}
              href={item.href}
              prefetch
              onClick={() => setMobileOpen(false)}
              className={`group flex items-center gap-3 rounded-[var(--vm-radius-control)] px-3.5 py-3 text-sm transition ${active ? "bg-[color:var(--vm-color-brand-blue)] text-white shadow-[var(--vm-shadow-brand-medium)]" : "text-[color:var(--vm-color-ink-muted)] hover:bg-[color:var(--vm-color-orientation-sky-soft)] hover:text-[color:var(--vm-color-brand-blue)]"}`}
            >
              <span className={`grid h-8 w-8 place-items-center rounded-[var(--vm-radius-control)] transition ${active ? "bg-white/12" : "bg-[color:var(--vm-color-orientation-wash)] group-hover:bg-white"}`}><Icon name={item.icon} className="h-[17px] w-[17px]" /></span>
              <span className="font-semibold">{item.label}</span>
              {count ? (
                <span className={`ml-auto grid min-w-6 place-items-center rounded-full px-1.5 py-0.5 text-[10px] font-extrabold ${active ? "bg-white text-[color:var(--vm-color-brand-blue)]" : "bg-[color:var(--vm-color-orientation-sky-soft)] text-[color:var(--vm-color-brand-blue)]"}`}>
                  {count}
                </span>
              ) : null}
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto px-2 pb-1">
        <Link href="/login" prefetch className="mt-3 flex items-center gap-3 rounded-[var(--vm-radius-control)] px-3.5 py-3 text-xs font-semibold text-[color:var(--vm-color-ink-muted)] transition hover:bg-[color:var(--vm-color-orientation-wash)] hover:text-[color:var(--vm-color-ink)]"><Icon name="logout" className="h-4 w-4" />Cerrar sesión</Link>
      </div>
    </>
  );

  return (
    <PortalChromeContext.Provider value={role}>
      <div className={`portal-app portal-app--${role} text-[color:var(--vm-color-ink)]`}>
        <aside className="portal-sidebar fixed inset-y-0 left-0 z-50 hidden w-[254px] border-r border-[color:var(--vm-color-line)] px-3 py-5 lg:flex lg:flex-col">{nav}</aside>

        {mobileOpen ? <button aria-label="Cerrar menú" className="fixed inset-0 z-40 bg-[color:var(--vm-color-brand-blue-deep)]/35 lg:hidden" onClick={() => setMobileOpen(false)} /> : null}
        <aside className={`portal-sidebar fixed inset-y-0 left-0 z-50 flex w-[280px] flex-col border-r border-[color:var(--vm-color-line)] p-4 transition-transform lg:hidden ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}>
          <div className="mb-2 flex justify-end"><button onClick={() => setMobileOpen(false)} className="grid h-9 w-9 place-items-center rounded-full border border-[color:var(--vm-color-line)] bg-white"><Icon name="close" className="h-4 w-4" /></button></div>
          {nav}
        </aside>

        <main className="relative lg:pl-[254px]">
          <header className="sticky top-0 z-30 border-b border-[color:var(--vm-color-line)] bg-white/95">
            <div className="flex h-[64px] items-center justify-between px-5 sm:px-8 lg:px-9">
              <div className="flex items-center gap-3">
                <button onClick={() => setMobileOpen(true)} className="grid h-10 w-10 place-items-center rounded-[var(--vm-radius-control)] border border-[color:var(--vm-color-line)] bg-white shadow-sm lg:hidden"><Icon name="menu" /></button>
                <div className="hidden rounded-full border border-[color:var(--vm-color-line)] bg-white px-4 py-2.5 text-xs font-bold text-[color:var(--vm-color-ink-muted)] shadow-sm md:block">{config.label}</div>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="flex items-center gap-3 rounded-full border border-[color:var(--vm-color-line)] bg-white py-1.5 pl-1.5 pr-3 shadow-sm">
                  <span className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-[color:var(--vm-color-brand-blue)] to-[color:var(--vm-color-brand-blue-deep)] text-[10px] font-extrabold text-white">AS</span>
                  <div className="hidden text-left sm:block"><div className="text-xs font-bold">Sesión de asesor</div><div className="text-[11px] text-[color:var(--vm-color-ink-muted)]">{config.userRole}</div></div>
                </div>
              </div>
            </div>
          </header>

          <div className="portal-page relative z-10 px-5 py-5 sm:px-8 lg:px-9 lg:py-6">{children}</div>
        </main>
      </div>
    </PortalChromeContext.Provider>
  );
}

function PortalPage({ role, title, subtitle, actions, children }: { role: Role; title: string; subtitle?: string; actions?: ReactNode; children: ReactNode }) {
  const config = roleConfig[role];
  return (
    <>
      <section className={`portal-hero portal-hero--${role} mb-4 overflow-hidden rounded-[var(--vm-radius-card)] border border-[color:var(--vm-color-line)] bg-white px-5 py-3.5 shadow-[var(--vm-shadow-low)] sm:px-6 sm:py-4`}>
        <div className="portal-hero__content relative z-10 flex flex-col justify-between gap-4 xl:flex-row xl:items-center">
          <div>
            <div className="mb-1.5 inline-flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-[.12em] text-[color:var(--vm-color-brand-blue)]"><span className="h-1.5 w-1.5 rounded-full bg-[color:var(--vm-color-brand-yellow)]" />{config.label}</div>
            <h1 className="max-w-4xl text-xl font-bold tracking-[-0.035em] text-[color:var(--vm-color-ink)] sm:text-2xl">{title}</h1>
            {subtitle ? <p className="mt-1.5 max-w-3xl text-xs leading-5 text-[color:var(--vm-color-ink-muted)] sm:text-sm">{subtitle}</p> : null}
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

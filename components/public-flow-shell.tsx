import type { ReactNode } from "react";
import Link from "next/link";
import { Icon } from "./icon";

export function PublicFlowShell({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
      <main className="flow-shell-content mx-auto max-w-[1460px] px-5 py-7 sm:px-8 lg:px-12 lg:py-10">
        <div className="mb-6">
          <Link href="/" className="glass-subtle inline-flex items-center gap-2 px-3.5 py-2 text-[11px] font-semibold text-[color:var(--vm-color-ink-muted)] transition hover:border-[color:var(--vm-color-brand-blue)] hover:text-[color:var(--vm-color-brand-blue)] focus-visible:outline-none">
            <Icon name="arrow" className="h-3.5 w-3.5 rotate-180" /> Volver al inicio
          </Link>
        </div>

        <div className="grid gap-7 xl:grid-cols-[320px_minmax(0,1fr)] xl:gap-9">
          <aside className="xl:sticky xl:top-28 xl:self-start">
            <div className="flow-intro-card glass-elevated relative overflow-hidden p-6 sm:p-7">
              <div className="flow-intro-card__glow" aria-hidden="true" />
              <div className="relative inline-flex items-center gap-2 rounded-full bg-[#0067b1]/7 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[.15em] text-[#0067b1]">
                <Icon name="sparkles" className="h-3.5 w-3.5" /> {eyebrow}
              </div>
              <h1 className="relative mt-5 text-4xl font-semibold leading-[.98] tracking-[-.055em] xl:text-[3.2rem]">{title}</h1>
              {description ? <p className="relative mt-5 text-sm leading-7 text-[color:var(--vm-color-ink-muted)]">{description}</p> : null}
            </div>

            <div className="flow-aside-card mt-4 p-5">
              <div className="flex items-start gap-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[13px] bg-[#0067b1] text-white shadow-[0_10px_24px_rgba(0,103,177,.17)]"><Icon name="shield" className="h-5 w-5" /></span>
                <div><div className="text-sm font-bold">Información protegida</div><p className="mt-1.5 text-xs leading-5 text-black/48">Tus datos se usan para perfilar, priorizar y definir la ruta de atención más adecuada.</p></div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2 text-[10px] text-black/45">
                <span className="rounded-xl bg-white px-3 py-2">Consentimiento</span>
                <span className="rounded-xl bg-white px-3 py-2">Trazabilidad</span>
              </div>
            </div>

            <div className="surface-solid mt-4 hidden p-5 xl:block">
              <div className="flex items-center justify-between"><span className="text-[10px] font-bold uppercase tracking-[.14em] text-[color:var(--vm-color-brand-blue)]">Asistencia</span><Icon name="phone" className="h-4 w-4 text-[color:var(--vm-color-brand-blue)]" /></div>
              <p className="mt-3 text-xs leading-5 text-[color:var(--vm-color-ink-muted)]">Los canales se confirmarán cuando exista disponibilidad comercial real.</p>
            </div>
          </aside>

          <section className="min-w-0 flow-page-reveal">{children}</section>
        </div>
      </main>
  );
}

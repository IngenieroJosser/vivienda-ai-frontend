import type { ReactNode } from "react";
import { Icon } from "./icon";
import {
  HousingWindow,
  OrientationBackLink,
  OrientationTrustStrip,
} from "./orientation-visuals";

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
    <main className="orientation-experience flow-shell-content mx-auto max-w-none px-5 py-7 sm:px-8 lg:px-12 lg:py-10">
      <div className="mx-auto max-w-[1320px]">
        <div className="mb-6">
          <OrientationBackLink />
        </div>

        <div className="grid gap-7 xl:grid-cols-[340px_minmax(0,1fr)] xl:gap-10">
          <aside className="xl:sticky xl:top-28 xl:self-start">
            <HousingWindow compact />
            <div className="flow-intro-card glass-elevated relative mt-4 overflow-hidden p-6 sm:p-7">
              <div className="flow-intro-card__glow" aria-hidden="true" />
              <div className="relative inline-flex items-center gap-2 rounded-full bg-[color:var(--vm-color-brand-blue)]/[.07] px-3 py-1.5 text-xs font-extrabold uppercase tracking-[.1em] text-[color:var(--vm-color-brand-blue)]">
                <Icon name="home" className="h-3.5 w-3.5" /> {eyebrow}
              </div>
              <h1 className="relative mt-5 text-4xl font-semibold leading-[.98] tracking-[-.055em] xl:text-[3.2rem]">
                {title}
              </h1>
              {description ? (
                <p className="relative mt-5 text-sm leading-7 text-[color:var(--vm-color-ink-muted)]">
                  {description}
                </p>
              ) : null}
            </div>

            <div className="flow-aside-card mt-4 p-5 text-[color:var(--vm-color-ink)]">
              <div className="flex items-start gap-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[var(--vm-radius-control)] bg-[color:var(--vm-color-brand-blue)] text-white shadow-[var(--vm-shadow-brand-medium)]">
                  <Icon name="shield" className="h-5 w-5" />
                </span>
                <div>
                  <div className="text-sm font-bold">
                    Tú decides cómo avanzar
                  </div>
                  <p className="mt-1.5 text-xs leading-5 text-[color:var(--vm-color-ink-muted)]">
                    Compartiremos únicamente la información que autorizaste
                    durante tu orientación.
                  </p>
                </div>
              </div>
              <div className="mt-5 border-t border-[color:var(--vm-color-line)] pt-4">
                <OrientationTrustStrip />
              </div>
            </div>
          </aside>

          <section className="min-w-0 flow-page-reveal">{children}</section>
        </div>
      </div>
    </main>
  );
}

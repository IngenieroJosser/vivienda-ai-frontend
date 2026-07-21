import type { ReactNode } from "react";
import Link from "next/link";
import { PublicHeader } from "./public-header";
import { Icon } from "./icon";

const defaultSteps = ["Identificación", "Perfil", "Documentos", "Análisis", "Siguiente paso"];

export function PublicFlowShell({
  eyebrow,
  title,
  description,
  children,
  step,
  total = 5,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  children: ReactNode;
  step?: number;
  total?: number;
}) {
  const steps = defaultSteps.slice(0, total);

  return (
    <div className="internal-shell">
      <PublicHeader />
      <main className="mx-auto max-w-[1460px] px-5 py-7 sm:px-8 lg:px-12 lg:py-10">
        <div className="mb-6 flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-2 rounded-full border border-black/[.07] bg-white/80 px-3.5 py-2 text-[11px] font-semibold text-black/48 shadow-sm backdrop-blur transition hover:border-[#0067b1]/20 hover:text-[#0067b1]">
            <Icon name="arrow" className="h-3.5 w-3.5 rotate-180" /> Volver al inicio
          </Link>
          {typeof step === "number" ? (
            <span className="rounded-full border border-black/[.06] bg-white/75 px-3.5 py-2 text-[10px] font-bold uppercase tracking-[.12em] text-black/40 shadow-sm backdrop-blur">
              Paso {step} de {total}
            </span>
          ) : null}
        </div>

        {typeof step === "number" ? (
          <div className="flow-panel mb-8 hidden px-6 py-5 md:block">
            <div className="grid items-start" style={{ gridTemplateColumns: `repeat(${total}, minmax(0, 1fr))` }}>
              {steps.map((label, index) => {
                const n = index + 1;
                const completed = n < step;
                const active = n === step;
                return (
                  <div key={label} className="relative flex items-center">
                    {index > 0 ? <span className={`absolute right-1/2 top-4 h-px w-full ${n <= step ? "bg-[#0067b1]/35" : "bg-black/[.08]"}`} /> : null}
                    <div className="relative z-10 flex w-full flex-col items-center text-center">
                      <span className={`grid h-8 w-8 place-items-center rounded-full border text-[11px] font-extrabold transition ${completed ? "border-[#0067b1] bg-[#0067b1] text-white" : active ? "border-[#ffd000] bg-[#ffd000] text-[#111820] shadow-[0_0_0_5px_rgba(255,208,0,.16)]" : "border-black/10 bg-white text-black/35"}`}>
                        {completed ? <Icon name="check" className="h-3.5 w-3.5" /> : n}
                      </span>
                      <span className={`mt-2 text-[10px] font-semibold ${active ? "text-[#111820]" : completed ? "text-[#0067b1]" : "text-black/35"}`}>{label}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : null}

        <div className="grid gap-7 xl:grid-cols-[320px_minmax(0,1fr)] xl:gap-9">
          <aside className="xl:sticky xl:top-28 xl:self-start">
            <div className="rounded-[28px] border border-black/[.06] bg-white/78 p-6 shadow-[0_18px_50px_rgba(17,24,32,.045)] backdrop-blur-xl sm:p-7">
              <div className="inline-flex items-center gap-2 rounded-full bg-[#0067b1]/7 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[.15em] text-[#0067b1]">
                <Icon name="sparkles" className="h-3.5 w-3.5" /> {eyebrow}
              </div>
              <h1 className="mt-5 text-4xl font-semibold leading-[.98] tracking-[-.055em] xl:text-[3.2rem]">{title}</h1>
              {description ? <p className="mt-5 text-sm leading-7 text-black/50">{description}</p> : null}
              {typeof step === "number" ? (
                <div className="mt-7">
                  <div className="mb-2 flex items-center justify-between text-[10px] font-semibold text-black/42"><span>Progreso del perfil</span><span>{Math.round((step / total) * 100)}%</span></div>
                  <div className="h-2 overflow-hidden rounded-full bg-black/[.065]"><div className="h-full rounded-full bg-gradient-to-r from-[#ffd000] to-[#0067b1] transition-all" style={{ width: `${(step / total) * 100}%` }} /></div>
                </div>
              ) : null}
            </div>

            <div className="flow-aside-card mt-4 p-5">
              <div className="flex items-start gap-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[13px] bg-[#0067b1] text-white shadow-[0_10px_24px_rgba(0,103,177,.17)]"><Icon name="shield" className="h-5 w-5" /></span>
                <div><div className="text-sm font-bold">Información protegida</div><p className="mt-1.5 text-xs leading-5 text-black/48">Tus datos se usan únicamente para orientar el perfil y preparar la atención comercial.</p></div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2 text-[10px] text-black/45">
                <span className="rounded-xl bg-white px-3 py-2">Consentimiento</span>
                <span className="rounded-xl bg-white px-3 py-2">Trazabilidad</span>
              </div>
            </div>

            <div className="mt-4 hidden rounded-[22px] bg-[#111820] p-5 text-white xl:block">
              <div className="flex items-center justify-between"><span className="text-[10px] font-bold uppercase tracking-[.14em] text-[#ffd000]">Asistencia</span><Icon name="phone" className="h-4 w-4 text-white/55" /></div>
              <p className="mt-3 text-xs leading-5 text-white/52">¿Tienes dudas durante el proceso? Un asesor puede ayudarte sin perder tu progreso.</p>
              <button className="mt-4 inline-flex items-center gap-2 text-xs font-bold text-white">Contactar asesor <Icon name="arrow" className="h-3.5 w-3.5" /></button>
            </div>
          </aside>

          <section className="min-w-0">{children}</section>
        </div>
      </main>
    </div>
  );
}

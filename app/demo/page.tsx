import Link from "next/link";
import { PublicHeader } from "@/components/public-header";
import { Icon } from "@/components/icon";
import { leads } from "@/lib/data";

const scenarioCopy = {
  "lead-jonathan": {
    label: "Afiliado listo",
    description: "Colsubsidio ya conoce parte de su información. La conversación confirma su sueño, ubicación, horizonte y ahorro.",
  },
  "lead-laura": {
    label: "No afiliada con capacidad",
    description: "Recibe la misma calidad de orientación y una ruta comercial que reconoce su condición sin penalizarla.",
  },
  "lead-camila": {
    label: "Afiliada en preparación",
    description: "Su horizonte y barrera de ahorro activan un plan de acompañamiento en lugar de enviarla a cierre.",
  },
} as const;

export default async function DemoPage({ searchParams }: { searchParams: Promise<{ scenario?: string }> }) {
  const { scenario } = await searchParams;
  const selected = leads.find((lead) => lead.id === scenario);

  return (
    <div className="public-experience min-h-screen bg-[color:var(--vm-color-canvas)]">
      <PublicHeader />
      <main className="mx-auto max-w-[1180px] px-5 py-12 sm:px-8 lg:px-12 lg:py-16">
        <div className="max-w-3xl">
          <div className="text-xs font-bold uppercase tracking-[.1em] text-[color:var(--vm-color-brand-blue)]">Demo guiada</div>
          <h1 className="mt-4 text-4xl font-semibold leading-[.98] tracking-[-.05em] sm:text-6xl">Elige una historia para comenzar.</h1>
          <p className="mt-5 text-base leading-7 text-[color:var(--vm-color-ink-muted)]">Cada escenario demuestra una ruta diferente. Los datos son sintéticos y no representan personas reales.</p>
        </div>

        <div className="mt-10 grid gap-4 lg:grid-cols-3">
          {leads.map((lead) => {
            const copy = scenarioCopy[lead.id];
            const active = selected?.id === lead.id;
            return (
              <Link key={lead.id} href={`/demo?scenario=${lead.id}`} aria-current={active ? "true" : undefined} className={`surface-solid group p-6 transition duration-200 hover:-translate-y-0.5 hover:border-[color:var(--vm-color-brand-blue)] focus-visible:outline-none focus-visible:shadow-[var(--vm-shadow-focus)] ${active ? "border-[color:var(--vm-color-brand-blue)] shadow-[var(--vm-shadow-medium)]" : ""}`}>
                <div className="flex items-start justify-between gap-4">
                  <span className="grid h-11 w-11 place-items-center rounded-full bg-[color:var(--vm-color-brand-blue)]/10 text-sm font-bold text-[color:var(--vm-color-brand-blue)]">{lead.initials}</span>
                  <Icon name="arrow" className="h-4 w-4 text-[color:var(--vm-color-brand-blue)]/35 transition group-hover:translate-x-0.5 group-hover:text-[color:var(--vm-color-brand-blue)]" />
                </div>
                <div className="mt-5 text-[10px] font-bold uppercase tracking-[.08em] text-[color:var(--vm-color-brand-blue)]">{copy.label}</div>
                <h2 className="mt-2 text-2xl font-semibold tracking-[-.035em]">{lead.name}</h2>
                <p className="mt-3 text-sm leading-6 text-[color:var(--vm-color-ink-muted)]">{copy.description}</p>
              </Link>
            );
          })}
        </div>

        {selected ? (
          <section className="surface-solid mt-8 p-6 sm:p-8" aria-live="polite">
            <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-start">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-[.08em] text-[color:var(--vm-color-success)]">Escenario seleccionado</div>
                <h2 className="mt-2 text-2xl font-semibold">{selected.name} · {scenarioCopy[selected.id].label}</h2>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-[color:var(--vm-color-ink-muted)]">El shell del selector está activo. La conversación adaptativa será el siguiente incremento y no se simula desde esta pantalla.</p>
              </div>
              <Link href="/vivienda/proyectos" className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-full border border-[color:var(--vm-color-brand-blue)]/20 px-5 text-sm font-bold hover:border-[color:var(--vm-color-brand-blue)] hover:text-[color:var(--vm-color-brand-blue)]">Conocer el proyecto vigente <Icon name="building" className="h-4 w-4" /></Link>
            </div>
          </section>
        ) : (
          <div className="mt-8 rounded-[var(--vm-radius-card)] border border-dashed border-[color:var(--vm-color-brand-blue)]/20 p-6 text-sm text-[color:var(--vm-color-ink-muted)]">Selecciona uno de los tres escenarios para revisar su punto de partida.</div>
        )}
      </main>
    </div>
  );
}

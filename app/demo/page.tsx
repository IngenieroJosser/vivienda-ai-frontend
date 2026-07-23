import Link from "next/link";
import { Icon } from "@/components/icon";

const juryJourneys = [
  {
    name: "Jonathan",
    description: "Afiliado interesado en Versalles con ingresos y composición del hogar conocidos.",
    href: "/orientacion?utm_source=meta&utm_campaign=versalles_jurado&utm_content=jonathan&leadId=vm_Jonathan30X1",
  },
  {
    name: "Laura",
    description: "No afiliada con la misma calidad de orientación y sin penalización artificial.",
    href: "/orientacion?utm_source=organico&utm_campaign=vivienda_jurado&utm_content=laura&leadId=vm_Laura30X2026",
  },
  {
    name: "Camila",
    description: "Afiliada que necesita una ruta de preparación antes de solicitar contacto.",
    href: "/orientacion?utm_source=meta&utm_campaign=cuota_jurado&utm_content=camila&leadId=vm_Camila30X2026",
  },
] as const;

export default function DemoPage() {
  return (
    <main className="min-h-screen bg-[color:var(--vm-color-canvas)] px-5 py-12 text-[color:var(--vm-color-ink)] sm:px-8">
      <div className="mx-auto max-w-[980px]">
        <div className="text-xs font-bold uppercase tracking-[.1em] text-[color:var(--vm-color-brand-blue)]">Lanzador interno</div>
        <h1 className="mt-4 text-4xl font-semibold tracking-[-.04em]">Recorridos de evaluación</h1>
        <p className="mt-4 max-w-2xl text-sm leading-6 text-[color:var(--vm-color-ink-muted)]">Esta ruta no forma parte de la navegación pública. Permite iniciar los tres casos sobre la misma experiencia que usaría una persona proveniente de pauta.</p>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {juryJourneys.map((journey) => (
            <article key={journey.name} className="surface-solid p-6">
              <h2 className="text-2xl font-semibold">{journey.name}</h2>
              <p className="mt-3 min-h-24 text-sm leading-6 text-[color:var(--vm-color-ink-muted)]">{journey.description}</p>
              <Link href={journey.href} className="mt-5 inline-flex min-h-11 items-center gap-2 text-sm font-bold text-[color:var(--vm-color-brand-blue)]">
                Iniciar recorrido <Icon name="arrow" className="h-4 w-4" />
              </Link>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}

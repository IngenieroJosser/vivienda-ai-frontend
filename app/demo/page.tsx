import { PublicHeader } from "@/components/public-header";
import { DemoSelector } from "@/features/conversation/components/demo-selector";
import { scenarios } from "@/features/conversation/scenarios";

export default function DemoPage() {
  return (
    <div className="public-experience min-h-screen bg-[color:var(--vm-color-canvas)]">
      <PublicHeader />
      <main className="mx-auto max-w-[1180px] px-5 py-12 sm:px-8 lg:px-12 lg:py-16">
        <div className="max-w-3xl">
          <div className="text-xs font-bold uppercase tracking-[.1em] text-[color:var(--vm-color-brand-blue)]">Simulador para el jurado</div>
          <h1 className="mt-4 text-4xl font-semibold leading-[.98] tracking-[-.05em] sm:text-6xl">Tres leads. Tres decisiones distintas.</h1>
          <p className="mt-5 text-base leading-7 text-[color:var(--vm-color-ink-muted)]">Selecciona un escenario sintético para comprobar cómo Vivienda Match AI aprovecha datos conocidos, descubre únicamente lo que falta y decide entre atención comercial o nutrición.</p>
        </div>

        <DemoSelector scenarios={Object.values(scenarios)} />
      </main>
    </div>
  );
}

import { PublicHeader } from "@/components/public-header";
import { ScenarioSelector } from "@/features/conversation/components/scenario-selector";
import { scenarios } from "@/features/conversation/scenarios";

export default function ScenariosPage() {
  return (
    <div className="public-experience min-h-screen bg-[color:var(--vm-color-canvas)]">
      <PublicHeader />
      <main className="mx-auto max-w-[1180px] px-5 py-12 sm:px-8 lg:px-12 lg:py-16">
        <div className="max-w-3xl">
          <div className="text-xs font-bold uppercase tracking-[.1em] text-[color:var(--vm-color-brand-blue)]">Recorridos disponibles</div>
          <h1 className="mt-4 text-4xl font-semibold leading-[.98] tracking-[-.05em] sm:text-6xl">Tres personas. Tres orientaciones distintas.</h1>
          <p className="mt-5 text-base leading-7 text-[color:var(--vm-color-ink-muted)]">Elige un perfil para probar el recorrido completo y comprobar cómo Vivienda Match AI aprovecha la información disponible, pregunta únicamente lo necesario y recomienda atención inmediata o una ruta de preparación.</p>
        </div>

        <ScenarioSelector scenarios={Object.values(scenarios)} />
      </main>
    </div>
  );
}

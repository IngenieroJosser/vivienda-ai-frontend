import { housingProjects } from "@/lib/housing-catalog";
import { Icon } from "@/components/icon";
import { AnimatedHeroBackground } from "@/components/animated-hero-background";
import { ProjectCatalog } from "@/components/project-catalog";

export default function ProyectosPage() {
  return (
    <main className="mx-auto max-w-[1460px] px-5 py-10 sm:px-8 lg:px-12 lg:py-14">
      <section className="projects-hero surface-solid relative overflow-hidden px-6 py-9 sm:px-9 lg:px-11">
        <AnimatedHeroBackground variant="projects" compact interactive={false} />
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 rounded-full bg-[color:var(--vm-color-brand-blue)]/[.06] px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-[.1em] text-[color:var(--vm-color-brand-blue)]">
            <Icon name="building" className="h-4 w-4 text-[color:var(--vm-color-brand-yellow)]" />
            Vivienda Colsubsidio
          </div>
          <h1 className="mt-5 max-w-4xl text-4xl font-bold leading-[.96] tracking-[-.055em] sm:text-6xl">
            Proyectos para imaginar tu próxima etapa.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-[color:var(--vm-color-ink-muted)]">
            Explora ubicaciones, espacios y recorridos oficiales. Cuando un dato comercial
            requiera validación, te lo diremos con claridad.
          </p>
          <div className="mt-7 flex flex-wrap gap-3 text-xs font-semibold text-[color:var(--vm-color-ink-muted)]">
            <span className="inline-flex items-center gap-2 rounded-full bg-white px-3.5 py-2 shadow-sm">
              <Icon name="check" className="h-4 w-4 text-[color:var(--vm-color-success)]" />
              {housingProjects.length} proyectos documentados
            </span>
            <span className="inline-flex items-center gap-2 rounded-full bg-white px-3.5 py-2 shadow-sm">
              <Icon name="eye" className="h-4 w-4 text-[color:var(--vm-color-brand-blue)]" />
              Recorridos virtuales disponibles
            </span>
          </div>
        </div>
      </section>
      <ProjectCatalog projects={housingProjects} />
    </main>
  );
}

import { ProjectCard } from "@/components/project-card";
import { projects } from "@/lib/data";
import { Icon } from "@/components/icon";
import { AnimatedHeroBackground } from "@/components/animated-hero-background";

export default function ProyectosPage() {
  return (
    <main className="mx-auto max-w-[1460px] px-5 py-10 sm:px-8 lg:px-12 lg:py-14">
      <section className="projects-hero relative overflow-hidden rounded-[34px] border border-[color:var(--vm-color-line)] bg-white/82 px-6 py-9 shadow-[var(--vm-shadow-low)] backdrop-blur sm:px-9 lg:px-11">
        <AnimatedHeroBackground variant="projects" compact interactive={false} />
        <div className="relative z-10"><div className="inline-flex items-center gap-2 rounded-full bg-[color:var(--vm-color-brand-blue)]/[.06] px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[.14em] text-[color:var(--vm-color-brand-blue)]"><Icon name="sparkles" className="h-4 w-4 text-[color:var(--vm-color-brand-yellow)]" />Proyectos de vivienda</div><h1 className="mt-5 max-w-3xl text-4xl font-bold leading-[.96] tracking-[-.06em] sm:text-6xl">Explora los proyectos disponibles.</h1><p className="mt-4 max-w-2xl text-sm leading-7 text-[color:var(--vm-color-ink-muted)]">Conoce ubicación, espacios y precio publicado. La disponibilidad y financiación deben confirmarse con un asesor.</p></div>
      </section>
      <div className="projects-grid mt-7 grid gap-6 lg:grid-cols-3">{projects.map((project) => <ProjectCard key={project.id} project={project} />)}</div>
    </main>
  );
}

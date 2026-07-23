import { ProjectCard } from "@/components/project-card";
import { projects } from "@/lib/data";
import { Icon } from "@/components/icon";
import { AnimatedHeroBackground } from "@/components/animated-hero-background";

export default function ProyectosPage() {
  return (
    <main className="mx-auto max-w-[1460px] px-5 py-10 sm:px-8 lg:px-12 lg:py-14">
      <section className="projects-hero relative overflow-hidden rounded-[34px] border border-black/[.06] bg-white/82 px-6 py-9 shadow-[0_20px_60px_rgba(17,24,32,.055)] backdrop-blur sm:px-9 lg:px-11">
        <AnimatedHeroBackground variant="projects" compact interactive={false} />
        <div className="relative z-10"><div className="inline-flex items-center gap-2 rounded-full bg-[#0067b1]/6 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[.14em] text-[#0067b1]"><Icon name="sparkles" className="h-4 w-4 text-[#ffd000]" />Catálogo del escenario aprobado</div><h1 className="mt-5 max-w-3xl text-4xl font-bold leading-[.96] tracking-[-.06em] sm:text-6xl">Proyectos disponibles para validación.</h1><p className="mt-4 max-w-2xl text-sm leading-7 text-black/48">La compatibilidad y disponibilidad son preliminares hasta conectarse con las fuentes comerciales reales.</p></div>
      </section>
      <div className="projects-grid mt-7 grid gap-6 lg:grid-cols-3">{projects.map((project) => <ProjectCard key={project.id} project={project} />)}</div>
    </main>
  );
}

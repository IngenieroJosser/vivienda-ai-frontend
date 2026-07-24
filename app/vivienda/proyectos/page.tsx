import type { Metadata } from "next";
import { getHousingProjectsFromBackend } from "@/lib/housing-catalog/data-source";
import { Icon } from "@/components/icon";
import { AnimatedHeroBackground } from "@/components/animated-hero-background";
import { ProjectCatalog } from "@/components/project-catalog";
import { StructuredData } from "@/components/structured-data";
import { absoluteUrl, createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Proyectos de vivienda",
  description:
    "Explora proyectos de vivienda Colsubsidio, sus ubicaciones, espacios, planos y recorridos virtuales disponibles.",
  path: "/vivienda/proyectos",
});

export default async function ProyectosPage() {
  const projects = await getHousingProjectsFromBackend();
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Proyectos de vivienda Colsubsidio",
    url: absoluteUrl("/vivienda/proyectos"),
    numberOfItems: projects.length,
    itemListElement: projects.map((project, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: project.name,
      url: absoluteUrl(`/vivienda/proyectos/${project.id}`),
      image: absoluteUrl(project.image),
    })),
  };

  return (
    <main className="mx-auto max-w-[1460px] px-5 py-10 sm:px-8 lg:px-12 lg:py-14">
      <StructuredData data={structuredData} />
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
              {projects.length} proyectos documentados
            </span>
            <span className="inline-flex items-center gap-2 rounded-full bg-white px-3.5 py-2 shadow-sm">
              <Icon name="eye" className="h-4 w-4 text-[color:var(--vm-color-brand-blue)]" />
              Recorridos virtuales disponibles
            </span>
          </div>
        </div>
      </section>
      <ProjectCatalog projects={projects} />
    </main>
  );
}

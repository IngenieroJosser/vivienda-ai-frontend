import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Icon } from "@/components/icon";
import { ProjectMediaGallery } from "@/components/project-media-gallery";
import { StructuredData } from "@/components/structured-data";
import { Pill } from "@/components/ui";
import {
  formatProjectAreaRange,
  formatProjectPrice,
  formatTypologyArea,
  formatVerificationDate,
  getHousingProject,
  getHousingTypeLabel,
  getProjectEvidence,
  getValidityLabel,
  housingProjects,
} from "@/lib/housing-catalog";
import { absoluteUrl, createPageMetadata } from "@/lib/seo";

export const dynamicParams = false;

export function generateStaticParams() {
  return housingProjects.map((project) => ({ id: project.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const project = getHousingProject(id);
  if (!project) {
    return {
      title: "Proyecto no encontrado",
      robots: { index: false, follow: false },
    };
  }

  return createPageMetadata({
    title: `${project.name}, proyecto de vivienda en ${project.location.city}`,
    description: `${project.summary} Conoce su ubicación, tipologías, características y recursos oficiales disponibles.`,
    path: `/vivienda/proyectos/${project.id}`,
    image: project.image,
  });
}

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const project = getHousingProject(id);
  if (!project) notFound();
  const priceSources = getProjectEvidence(project, project.priceFromCop);
  const officialSource = priceSources.find((source) => source.kind === "OFFICIAL_PROJECT_PAGE");
  const availableTours = project.tours.filter(({ availability }) => availability === "AVAILABLE");
  const projectUrl = absoluteUrl(`/vivienda/proyectos/${project.id}`);
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ApartmentComplex",
        "@id": `${projectUrl}#project`,
        name: project.name,
        description: project.summary,
        url: projectUrl,
        image: [
          absoluteUrl(project.image),
          ...project.gallery.map(({ image }) => absoluteUrl(image)),
        ],
        address: {
          "@type": "PostalAddress",
          addressLocality: project.location.city,
          addressRegion: project.location.department,
          addressCountry: "CO",
        },
        amenityFeature: project.features.map((feature) => ({
          "@type": "LocationFeatureSpecification",
          name: feature,
          value: true,
        })),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Inicio",
            item: absoluteUrl("/"),
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Proyectos",
            item: absoluteUrl("/vivienda/proyectos"),
          },
          {
            "@type": "ListItem",
            position: 3,
            name: project.name,
            item: projectUrl,
          },
        ],
      },
    ],
  };

  return (
    <main className="project-detail-page mx-auto max-w-[1300px] px-5 py-8 sm:px-8 lg:px-12 lg:py-10">
      <StructuredData data={structuredData} />
      <Link href="/vivienda/proyectos" className="inline-flex items-center gap-2 rounded-full border border-[color:var(--vm-color-line)] bg-white px-3.5 py-2 text-[10px] font-bold text-[color:var(--vm-color-brand-blue)] shadow-sm"><Icon name="arrow" className="h-3.5 w-3.5 rotate-180" />Volver a proyectos</Link>

      <header className="mt-7 grid gap-6 border-b border-[color:var(--vm-color-line)] pb-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
        <div>
          <div className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.13em] text-[color:var(--vm-color-brand-blue)]">
            <Icon name="location" className="h-4 w-4" />
            {project.location.city} · {project.location.department}
          </div>
          <h1 className="mt-3 text-5xl font-semibold leading-[.94] tracking-[-.06em] sm:text-6xl">
            {project.name}
          </h1>
          <p className="mt-4 text-sm font-semibold text-[color:var(--vm-color-ink-muted)]">
            {project.location.development}
          </p>
        </div>
        <div className="flex flex-wrap gap-2 lg:justify-end">
          <Pill tone="yellow">Material comercial aprobado</Pill>
          <Pill tone="blue">{getHousingTypeLabel(project.housingType)}</Pill>
          {availableTours.length ? (
            <span className="inline-flex min-h-8 items-center gap-2 rounded-full border border-[color:var(--vm-color-brand-blue)]/15 bg-white px-3 text-[10px] font-bold text-[color:var(--vm-color-brand-blue)]">
              <Icon name="eye" className="h-3.5 w-3.5" />
              {availableTours.length === 1
                ? "Recorrido virtual"
                : `${availableTours.length} recorridos virtuales`}
            </span>
          ) : null}
        </div>
      </header>

      <ProjectMediaGallery project={project} />

      <div className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <section className="space-y-5">
          <section className="surface-solid p-6 sm:p-8">
            <div className="flex flex-wrap items-center gap-3">
              <div className="text-[10px] font-bold uppercase tracking-[.12em] text-[color:var(--vm-color-brand-blue)]">
                Sobre el proyecto
              </div>
            </div>
            <p className="mt-5 text-base leading-7 text-[color:var(--vm-color-ink-muted)]">{project.summary}</p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">{project.features.map((feature) => <div key={feature} className="flex items-center gap-3 rounded-[15px] border border-[color:var(--vm-color-line)] p-3.5 text-sm font-semibold"><Icon name="check" className="h-4 w-4 shrink-0 text-[color:var(--vm-color-success)]" />{feature}</div>)}</div>
          </section>
          <section className="surface-solid p-6 sm:p-8">
            <h2 className="text-lg font-semibold">Tipologías construidas</h2>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              {project.typologies.map((typology) => <div key={typology.id} className="rounded-[15px] border border-[color:var(--vm-color-line)] p-4"><div className="text-xs text-[color:var(--vm-color-ink-muted)]">{typology.label}</div><div className="mt-2 text-lg font-bold">{formatTypologyArea(typology.builtAreaM2)}</div></div>)}
            </div>
          </section>
        </section>
        <aside className="space-y-5 xl:sticky xl:top-24 xl:self-start">
          <section className="surface-card p-6">
            <div className="text-[10px] uppercase tracking-[.12em] text-[color:var(--vm-color-ink-muted)]">Información del proyecto</div>
            <div className="mt-5 space-y-3 text-xs">
              {[
                ["Precio desde", formatProjectPrice(project)],
                ["Áreas", formatProjectAreaRange(project)],
                ["Habitaciones", project.bedrooms.value ?? "Por confirmar"],
                ["Apartamentos", project.totalUnits.value?.toLocaleString("es-CO") ?? "Por confirmar"],
                ["Torres", project.towers.value?.toLocaleString("es-CO") ?? "Por confirmar"],
                ["Pisos por torre", project.floorsPerTower.value ?? "Por confirmar"],
                ["Acabado", project.finish.value ?? "Por confirmar"],
                ["Certificación", project.certification.value ?? "No indicada"],
                ["Inventario", getValidityLabel(project.inventory.validity)],
                ["Entrega", getValidityLabel(project.deliveryDate.validity)],
              ].map(([label, value]) => <div key={label} className="flex justify-between gap-4"><span className="text-[color:var(--vm-color-ink-muted)]">{label}</span><b className="text-right">{value}</b></div>)}
            </div>
            <div className="mt-5 border-t border-[color:var(--vm-color-line)] pt-4 text-[10px] leading-5 text-[color:var(--vm-color-ink-muted)]">
              <div>{getValidityLabel(project.priceFromCop.validity)} · verificado {formatVerificationDate(project.priceFromCop.verifiedAt)}</div>
              {officialSource?.url ? <a href={officialSource.url} target="_blank" rel="noreferrer" className="font-semibold text-[color:var(--vm-color-brand-blue)] underline-offset-4 hover:underline">{officialSource.title}</a> : null}
            </div>
          </section>
          <Link href={`/orientacion?utm_source=portal&utm_campaign=${project.id}_proyecto&utm_content=ficha`} className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-[color:var(--vm-color-brand-blue)] px-5 text-sm font-bold text-white"><Icon name="arrow" className="h-4 w-4" />Iniciar orientación</Link>
        </aside>
      </div>
    </main>
  );
}

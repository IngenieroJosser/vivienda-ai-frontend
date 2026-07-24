import Image from "next/image";
import Link from "next/link";
import { Icon } from "./icon";
import { Pill } from "./ui";
import {
  formatProjectAreaRange,
  formatProjectPrice,
  getHousingTypeLabel,
  type HousingProject,
} from "@/lib/housing-catalog";

export function ProjectCard({ project, compact = false }: { project: HousingProject; compact?: boolean }) {
  const mediaCount =
    1 +
    project.typologies.length +
    project.tours.filter(({ availability }) => availability === "AVAILABLE")
      .length +
    (project.brochureUrl ? 1 : 0);

  return (
    <article className="project-card surface-card surface-card--interactive group overflow-hidden">
      <span aria-hidden="true" className="project-card__ambient" />
      <div className={`relative overflow-hidden ${compact ? "h-44" : "h-56"}`}>
        <Image src={project.image} alt={`Vista del proyecto ${project.name}`} fill sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw" loading="lazy" quality={75} unoptimized={project.image.endsWith(".svg")} className="project-card__image object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[color:var(--vm-color-brand-blue-deep)]/55 via-transparent to-white/5" />
        <div className="absolute left-4 top-4 flex flex-wrap gap-2">
          <Pill tone="image-overlay">{getHousingTypeLabel(project.housingType)}</Pill>
          {project.tours.some(({ availability }) => availability === "AVAILABLE") ? (
            <span className="rounded-full border border-[color:var(--vm-color-brand-blue)]/15 bg-[color:var(--vm-surface-solid)] px-3 py-1.5 text-[11px] font-bold text-[color:var(--vm-color-brand-blue)] shadow-[var(--vm-shadow-medium)]">
              Recorrido virtual
            </span>
          ) : null}
        </div>
        <span className="project-card__media-count">
          <Icon name="camera" className="h-3.5 w-3.5" />
          {mediaCount} recursos para explorar
        </span>
      </div>
      <div className="p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="text-[11px] font-bold uppercase tracking-[.08em] text-[color:var(--vm-color-brand-blue)]">{project.location.city} · {project.location.department}</div>
            <h3 className="mt-1.5 text-2xl font-bold tracking-[-.038em]">{project.name}</h3>
            <p className="mt-1 text-xs text-[color:var(--vm-color-ink-muted)]">{project.location.development}</p>
          </div>
          <div className="shrink-0 text-right">
            <div className="text-[11px] font-semibold text-[color:var(--vm-color-ink-muted)]">Precio publicado</div>
            <div className="mt-1 text-base font-extrabold tracking-[-.03em]">{formatProjectPrice(project)}</div>
          </div>
        </div>
        <div className="mt-5 grid grid-cols-3 divide-x divide-[color:var(--vm-color-line)] rounded-[16px] border border-[color:var(--vm-color-line)] bg-[color:var(--vm-color-canvas)] py-3 text-center">
          <div><div className="text-xs font-bold">{formatProjectAreaRange(project)}</div><div className="mt-1 text-[10px] text-[color:var(--vm-color-ink-muted)]">Área construida</div></div>
          <div><div className="text-xs font-bold">{project.bedrooms.value ?? "Por confirmar"}</div><div className="mt-1 text-[10px] text-[color:var(--vm-color-ink-muted)]">Habitaciones</div></div>
          <div><div className="text-xs font-bold">{project.totalUnits.value ?? "Por confirmar"}</div><div className="mt-1 text-[10px] text-[color:var(--vm-color-ink-muted)]">Total proyecto</div></div>
        </div>
        <p className="mt-5 min-h-14 text-sm leading-6 text-[color:var(--vm-color-ink-muted)]">{project.summary}</p>
        <Link href={`/vivienda/proyectos/${project.id}`} prefetch className="liquid-button mt-5 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-[color:var(--vm-color-brand-blue)] px-5 text-sm font-bold text-white shadow-[0_12px_30px_rgba(0,103,177,.18)] transition hover:-translate-y-1 hover:bg-[color:var(--vm-color-brand-blue-deep)]">Conocer el proyecto <Icon name="arrow" className="h-4 w-4" /></Link>
      </div>
    </article>
  );
}

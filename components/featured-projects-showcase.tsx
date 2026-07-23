import Image from "next/image";
import Link from "next/link";
import { Icon } from "./icon";
import { getHousingProjects, housingProjects } from "@/lib/housing-catalog";

const featuredProjects = getHousingProjects([
  "versalles",
  "bosque-de-arrayan",
  "la-macarena",
]);

export function FeaturedProjectsShowcase() {
  const [mainProject, ...secondaryProjects] = featuredProjects;

  return (
    <aside
      aria-label="Proyectos destacados de Vivienda Colsubsidio"
      className="motion-rise motion-delay-2 relative grid min-h-[480px] grid-cols-2 grid-rows-[minmax(270px,1.4fr)_minmax(180px,1fr)] gap-3 sm:min-h-[560px] sm:gap-4 lg:h-[min(76svh,760px)] lg:min-h-[620px] lg:grid-cols-[minmax(0,1.35fr)_minmax(240px,.65fr)] lg:grid-rows-2"
    >
      <ProjectTile
        project={mainProject}
        priority
        className="col-span-2 lg:col-span-1 lg:row-span-2"
        sizes="(min-width: 1024px) 38vw, 100vw"
      />

      {secondaryProjects.map((project) => (
        <ProjectTile
          key={project.id}
          project={project}
          className="min-w-0"
          sizes="(min-width: 1024px) 22vw, 50vw"
          compact
        />
      ))}

      <Link
        href="/vivienda/proyectos"
        className="absolute left-4 top-4 z-20 inline-flex min-h-11 items-center gap-2 rounded-full bg-white/95 px-4 text-sm font-bold text-[color:var(--vm-color-brand-blue)] shadow-[var(--vm-shadow-medium)] transition duration-150 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:shadow-[var(--vm-shadow-focus)] sm:left-5 sm:top-5"
      >
        <Icon name="grid" className="h-4 w-4" />
        Explorar {housingProjects.length} proyectos
      </Link>
    </aside>
  );
}

function ProjectTile({
  project,
  className,
  sizes,
  priority = false,
  compact = false,
}: {
  project: (typeof featuredProjects)[number];
  className?: string;
  sizes: string;
  priority?: boolean;
  compact?: boolean;
}) {
  return (
    <Link
      href={`/vivienda/proyectos/${project.id}`}
      aria-label={`Conocer el proyecto ${project.name} en ${project.location.city}`}
      className={`group relative overflow-hidden rounded-[var(--vm-radius-elevated)] bg-[color:var(--vm-color-surface-solid)] shadow-[var(--vm-shadow-high)] focus-visible:outline-none focus-visible:shadow-[var(--vm-shadow-focus)] ${className ?? ""}`}
    >
      <Image
        src={project.image}
        alt={`Vista del proyecto ${project.name} en ${project.location.city}`}
        fill
        priority={priority}
        sizes={sizes}
        quality={84}
        className="object-cover transition duration-300 ease-out group-hover:scale-[1.025]"
      />
      <span
        aria-hidden="true"
        className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,79,140,0)_38%,rgba(0,79,140,.78)_100%)]"
      />
      <span className={`absolute inset-x-0 bottom-0 z-10 text-white ${compact ? "p-4 sm:p-5" : "p-5 sm:p-8"}`}>
        <span className="block text-[11px] font-bold uppercase tracking-[.08em] text-white/78">
          {project.location.city}
        </span>
        <span className={`mt-1 block font-bold tracking-[-.035em] ${compact ? "text-lg sm:text-xl" : "text-2xl sm:text-4xl"}`}>
          {project.name}
        </span>
        {!compact ? (
          <span className="mt-3 inline-flex items-center gap-2 text-sm font-semibold">
            Conocer proyecto <Icon name="arrow" className="h-4 w-4" />
          </span>
        ) : null}
      </span>
    </Link>
  );
}

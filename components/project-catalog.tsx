"use client";

import { useMemo, useState } from "react";
import { Icon } from "./icon";
import { ProjectCard } from "./project-card";
import type { HousingProject } from "@/lib/housing-catalog";

type LocationFilter = "Todos" | string;

export function ProjectCatalog({ projects }: { projects: readonly HousingProject[] }) {
  const [query, setQuery] = useState("");
  const [location, setLocation] = useState<LocationFilter>("Todos");

  const locations = useMemo(
    () => ["Todos", ...new Set(projects.map((project) => project.location.city))],
    [projects],
  );

  const visibleProjects = useMemo(() => {
    const normalizedQuery = normalize(query);

    return projects.filter((project) => {
      const matchesLocation =
        location === "Todos" || project.location.city === location;
      const searchable = normalize([
        project.name,
        project.location.city,
        project.location.department,
        project.location.development,
        project.summary,
        project.housingType ?? "",
      ].join(" "));

      return matchesLocation && searchable.includes(normalizedQuery);
    });
  }, [location, projects, query]);

  return (
    <section className="mt-8" aria-labelledby="catalog-title">
      <div className="surface-solid rounded-[26px] p-4 sm:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[.09em] text-[color:var(--vm-color-brand-blue)]">
              Catálogo aprobado
            </p>
            <h2 id="catalog-title" className="mt-1 text-2xl font-bold tracking-[-.035em]">
              Encuentra un proyecto por ubicación
            </h2>
          </div>

          <label className="relative block w-full lg:max-w-[420px]">
            <span className="sr-only">Buscar proyectos</span>
            <Icon
              name="search"
              className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[color:var(--vm-color-brand-blue)]"
            />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Busca por proyecto, ciudad o ciudadela"
              className="h-12 w-full rounded-full border border-[color:var(--vm-color-line)] bg-white pl-12 pr-5 text-sm text-[color:var(--vm-color-ink)] outline-none transition focus:border-[color:var(--vm-color-brand-blue)] focus:ring-4 focus:ring-[color:var(--vm-color-brand-blue)]/10"
            />
          </label>
        </div>

        <div className="mt-5 flex gap-2 overflow-x-auto pb-1" aria-label="Filtrar por ubicación">
          {locations.map((item) => {
            const active = location === item;
            return (
              <button
                key={item}
                type="button"
                aria-pressed={active}
                onClick={() => setLocation(item)}
                className={`min-h-11 shrink-0 rounded-full border px-4 text-xs font-bold tracking-[.01em] transition ${
                  active
                    ? "border-[color:var(--vm-color-brand-blue)] bg-[color:var(--vm-color-brand-blue)] text-white shadow-[0_8px_22px_rgba(0,103,177,.16)]"
                    : "border-[color:var(--vm-color-line)] bg-white text-[color:var(--vm-color-ink)] hover:border-[color:var(--vm-color-brand-blue)] hover:text-[color:var(--vm-color-brand-blue)]"
                }`}
              >
                {item}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between gap-4">
        <p aria-live="polite" className="text-sm text-[color:var(--vm-color-ink-muted)]">
          <b className="text-[color:var(--vm-color-ink)]">{visibleProjects.length}</b>{" "}
          {visibleProjects.length === 1 ? "proyecto encontrado" : "proyectos encontrados"}
        </p>
        <p className="hidden text-xs text-[color:var(--vm-color-ink-muted)] sm:block">
          Precio e inventario se confirman antes de avanzar
        </p>
      </div>

      {visibleProjects.length > 0 ? (
        <div className="projects-grid mt-4 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {visibleProjects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      ) : (
        <div className="surface-solid mt-4 flex min-h-56 flex-col items-center justify-center rounded-[26px] px-6 text-center">
          <Icon name="search" className="h-8 w-8 text-[color:var(--vm-color-brand-blue)]" />
          <h3 className="mt-4 text-lg font-bold">No encontramos ese proyecto</h3>
          <p className="mt-2 max-w-md text-sm leading-6 text-[color:var(--vm-color-ink-muted)]">
            Prueba con otra ciudad o limpia la búsqueda para ver todo el catálogo.
          </p>
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setLocation("Todos");
            }}
            className="mt-5 min-h-11 rounded-full bg-[color:var(--vm-color-brand-blue)] px-5 text-xs font-bold text-white"
          >
            Ver todos los proyectos
          </button>
        </div>
      )}
    </section>
  );
}

function normalize(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLocaleLowerCase("es-CO")
    .trim();
}

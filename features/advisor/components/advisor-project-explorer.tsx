"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Icon } from "@/components/icon";
import {
  createProjectResources,
  type ProjectResource,
} from "@/components/project-media-gallery-model";
import { useProjectResourceConnectionHints } from "@/components/use-project-resource-connection-hints";
import { Pill } from "@/components/ui";
import {
  formatProjectAreaRange,
  formatProjectPrice,
  getHousingTypeLabel,
  getValidityLabel,
} from "@/lib/housing-catalog";
import type { ResolvedProjectMatch } from "@/features/conversation/matching";

const ProjectImageViewer = dynamic(
  () =>
    import("@/components/project-image-viewer").then(
      ({ ProjectImageViewer: Viewer }) => Viewer,
    ),
  { ssr: false },
);

const ProjectResourceViewer = dynamic(
  () =>
    import("@/components/project-resource-viewer").then(
      ({ ProjectResourceViewer: Viewer }) => Viewer,
    ),
  { ssr: false },
);

export function AdvisorProjectExplorer({
  matches,
}: {
  matches: readonly ResolvedProjectMatch[];
}) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [imagesOpen, setImagesOpen] = useState(false);
  const [activeResource, setActiveResource] =
    useState<ProjectResource | null>(null);
  const selected = matches[selectedIndex] ?? matches[0];
  const resources = useMemo(
    () => createProjectResources(selected.project),
    [selected.project],
  );
  useProjectResourceConnectionHints(resources);

  const tour = resources.find(({ kind }) => kind === "TOUR");
  const brochure = resources.find(({ kind }) => kind === "BROCHURE");
  const { project, match } = selected;

  return (
    <>
      <section
        className="advisor-project-explorer surface-solid"
        aria-labelledby="advisor-project-explorer-title"
      >
        <header className="advisor-project-explorer__header">
          <div>
            <div className="advisor-project-explorer__eyebrow">
              <Icon name="building" className="h-4 w-4" />
              Contexto visual de la recomendación
            </div>
            <h2 id="advisor-project-explorer-title">
              Explora lo que verá el prospecto.
            </h2>
            <p>
              Misma recomendación, evidencia y recursos utilizados durante la
              orientación.
            </p>
          </div>
          <Pill tone="blue">
            {matches.length} {matches.length === 1 ? "opción" : "opciones"}
          </Pill>
        </header>

        <div className="advisor-project-explorer__workspace">
          <div className="advisor-project-explorer__visual">
            <Image
              key={project.image}
              src={project.image}
              alt={`Vista principal de ${project.name}`}
              fill
              sizes="(max-width: 1024px) 100vw, 760px"
              quality={90}
              className="object-cover"
            />
            <span className="advisor-project-explorer__visual-shade" />
            <div className="advisor-project-explorer__visual-copy">
              <span>
                {match.signals.includes("CAMPAIGN")
                  ? "Proyecto de la campaña"
                  : `Recomendación ${selectedIndex + 1}`}
              </span>
              <h3>{project.name}</h3>
              <p>
                {project.location.city} · {project.location.development}
              </p>
            </div>
            <div className="advisor-project-explorer__visual-actions">
              <button type="button" onClick={() => setImagesOpen(true)}>
                <Icon name="camera" className="h-4 w-4" />
                Imágenes y planos
              </button>
              {tour ? (
                <button
                  type="button"
                  onClick={() => setActiveResource(tour)}
                  className="advisor-project-explorer__primary-action"
                >
                  <Icon name="eye" className="h-4 w-4" />
                  Recorrido 360
                </button>
              ) : null}
              {brochure ? (
                <button
                  type="button"
                  onClick={() => setActiveResource(brochure)}
                >
                  <Icon name="document" className="h-4 w-4" />
                  Ver folleto
                </button>
              ) : null}
            </div>
          </div>

          <aside
            className="advisor-project-explorer__options"
            aria-label="Proyectos recomendados"
          >
            {matches.map(({ project: option, match: optionMatch }, index) => (
              <button
                key={option.id}
                type="button"
                onClick={() => setSelectedIndex(index)}
                aria-pressed={selectedIndex === index}
                className={
                  selectedIndex === index
                    ? "advisor-project-explorer__option advisor-project-explorer__option--active"
                    : "advisor-project-explorer__option"
                }
              >
                <span className="advisor-project-explorer__option-index">
                  {index + 1}
                </span>
                <span>
                  <strong>{option.name}</strong>
                  <small>
                    {optionMatch.signals.includes("CAMPAIGN")
                      ? "Origen de campaña"
                      : `${optionMatch.reasons.length} razones de coincidencia`}
                  </small>
                </span>
                <Icon name="chevron" className="ml-auto h-4 w-4" />
              </button>
            ))}
          </aside>
        </div>

        <div className="advisor-project-explorer__evidence">
          <div className="advisor-project-explorer__facts">
            <ExplorerFact
              label="Precio"
              value={
                project.priceFromCop.validity === "CURRENT"
                  ? formatProjectPrice(project)
                  : "Por confirmar"
              }
            />
            <ExplorerFact label="Áreas" value={formatProjectAreaRange(project)} />
            <ExplorerFact
              label="Tipo"
              value={getHousingTypeLabel(project.housingType)}
            />
            <ExplorerFact
              label="Inventario"
              value={getValidityLabel(project.inventory.validity)}
            />
          </div>
          <div className="advisor-project-explorer__reasons">
            <div>
              <span>Por qué encaja</span>
              <strong>
                {match.reasons.length}{" "}
                {match.reasons.length === 1
                  ? "razón verificable"
                  : "razones verificables"}
              </strong>
            </div>
            <ul>
              {match.reasons.map((reason) => (
                <li key={reason}>
                  <Icon name="check" className="h-4 w-4" />
                  {reason}
                </li>
              ))}
            </ul>
            <Link href={`/vivienda/proyectos/${project.id}`}>
              Abrir ficha completa
              <Icon name="arrow" className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {imagesOpen ? (
        <ProjectImageViewer
          images={project.gallery}
          initialIndex={0}
          projectName={project.name}
          onClose={() => setImagesOpen(false)}
        />
      ) : null}

      {activeResource ? (
        <ProjectResourceViewer
          projectName={project.name}
          resource={activeResource}
          onClose={() => setActiveResource(null)}
        />
      ) : null}
    </>
  );
}

function ExplorerFact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

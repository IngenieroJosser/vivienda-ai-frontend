"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import {
  useCallback,
  useMemo,
  useRef,
  useState,
} from "react";
import { Icon } from "./icon";
import {
  createProjectGalleryImages,
  createProjectResources,
  getCenteredSlideOffset,
  getClosestSlideIndex,
} from "./project-media-gallery-model";
import { useProjectResourceConnectionHints } from "./use-project-resource-connection-hints";
import type { ProjectResource } from "./project-media-gallery-model";
import type { HousingProject } from "@/lib/housing-catalog";

const ProjectImageViewer = dynamic(
  () =>
    import("./project-image-viewer").then(
      ({ ProjectImageViewer: Viewer }) => Viewer,
    ),
  { ssr: false },
);

const ProjectResourceViewer = dynamic(
  () =>
    import("./project-resource-viewer").then(
      ({ ProjectResourceViewer: Viewer }) => Viewer,
    ),
  { ssr: false },
);

export function ProjectMediaGallery({
  project,
}: {
  project: HousingProject;
}) {
  const images = useMemo(() => createProjectGalleryImages(project), [project]);
  const resources = useMemo(() => createProjectResources(project), [project]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [fullscreenStartIndex, setFullscreenStartIndex] =
    useState<number | null>(null);
  const [activeResource, setActiveResource] =
    useState<ProjectResource | null>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const dragStartXRef = useRef<number | null>(null);
  const didDragRef = useRef(false);
  const image = images[activeIndex] ?? images[0];
  useProjectResourceConnectionHints(resources);

  const scrollToIndex = useCallback((index: number) => {
    setActiveIndex(index);
    const track = trackRef.current;
    const slide = track?.children.item(index) as HTMLElement | null;
    if (!track || !slide) return;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    track.scrollTo({
      left: getCenteredSlideOffset({
        trackWidth: track.clientWidth,
        slideOffset: slide.offsetLeft,
        slideWidth: slide.clientWidth,
      }),
      behavior: reducedMotion ? "auto" : "smooth",
    });
  }, []);

  const showPrevious = useCallback(() => {
    scrollToIndex((activeIndex - 1 + images.length) % images.length);
  }, [activeIndex, images.length, scrollToIndex]);
  const showNext = useCallback(() => {
    scrollToIndex((activeIndex + 1) % images.length);
  }, [activeIndex, images.length, scrollToIndex]);

  return (
    <section className="project-gallery" aria-labelledby="project-gallery-title">
      <div className="project-gallery__heading">
        <div>
          <div className="project-gallery__eyebrow">
            <Icon name="camera" className="h-4 w-4" />
            Galería del proyecto
          </div>
          <h2 id="project-gallery-title">
            Explora sus espacios y distribución.
          </h2>
        </div>
        <div className="project-gallery__counter" aria-label={`${images.length} vistas disponibles`}>
          <strong>{images.length}</strong>
          <span>{images.length === 1 ? "imagen disponible" : "imágenes disponibles"}</span>
        </div>
      </div>

      <div
        ref={trackRef}
        className="project-gallery__track"
        onPointerDown={(event) => {
          if (event.pointerType !== "touch") return;
          dragStartXRef.current = event.clientX;
          didDragRef.current = false;
        }}
        onPointerMove={(event) => {
          if (dragStartXRef.current === null) return;
          if (Math.abs(event.clientX - dragStartXRef.current) >= 8) {
            didDragRef.current = true;
          }
        }}
        onPointerUp={() => {
          dragStartXRef.current = null;
        }}
        onPointerCancel={() => {
          dragStartXRef.current = null;
          didDragRef.current = false;
        }}
        onScroll={(event) => {
          if (!window.matchMedia("(max-width: 767px)").matches) return;
          const track = event.currentTarget;
          const slides = Array.from(track.children) as HTMLElement[];
          setActiveIndex(
            getClosestSlideIndex({
              scrollLeft: track.scrollLeft,
              trackWidth: track.clientWidth,
              slides: slides.map((slide) => ({
                offset: slide.offsetLeft,
                width: slide.clientWidth,
              })),
            }),
          );
        }}
      >
        {images.map((galleryImage, index) => (
          <button
            key={galleryImage.id}
            type="button"
            onClick={() => {
              if (didDragRef.current) {
                didDragRef.current = false;
                return;
              }
              scrollToIndex(index);
            }}
            className={`project-gallery__panel ${
              index === activeIndex ? "project-gallery__panel--active" : ""
            }`}
            data-media-kind={galleryImage.kind}
            aria-pressed={index === activeIndex}
            aria-label={`Mostrar ${galleryImage.label}`}
          >
            <span className="project-gallery__media-frame">
              <Image
                src={galleryImage.image}
                alt=""
                fill
                sizes={
                  index === 0
                    ? "(max-width: 767px) 88vw, (max-width: 1200px) 75vw, 850px"
                    : index === activeIndex
                    ? "(max-width: 1200px) 75vw, 850px"
                    : "120px"
                }
                loading={index === 0 ? "eager" : "lazy"}
                fetchPriority={index === 0 ? "high" : "auto"}
                quality={90}
                className="project-gallery__image"
              />
            </span>
            <span className="project-gallery__panel-shade" />
            <span className="project-gallery__panel-label">
              <small>
                {galleryImage.sourcePage
                  ? `Folleto · Pág. ${galleryImage.sourcePage}`
                  : "Imagen oficial"}
              </small>
              <strong>{galleryImage.label}</strong>
              {index === activeIndex ? (
                <span>{galleryImage.description}</span>
              ) : null}
            </span>
          </button>
        ))}
      </div>

      <div className="project-gallery__details">
        <div className="project-gallery__active-copy">
          <small>
            {image.sourcePage
              ? `Contenido del folleto oficial · Página ${image.sourcePage}`
              : "Imagen oficial del proyecto"}
          </small>
          <strong>{image.label}</strong>
          <p>{image.description}</p>
        </div>
        <div className="project-gallery__actions">
          <button
            type="button"
            onClick={() => setFullscreenStartIndex(activeIndex)}
            className="project-gallery__action project-gallery__action--primary"
          >
            <Icon name="eye" className="h-4 w-4" />
            Ver imagen completa
          </button>
          <span className="project-gallery__position">
            {activeIndex + 1} de {images.length}
          </span>
          {images.length > 1 ? (
            <div className="project-gallery__arrows">
              <button
                type="button"
                onClick={showPrevious}
                aria-label="Ver imagen anterior"
              >
                <Icon name="arrow" className="h-4 w-4 rotate-180" />
              </button>
              <button
                type="button"
                onClick={showNext}
                aria-label="Ver imagen siguiente"
              >
                <Icon name="arrow" className="h-4 w-4" />
              </button>
            </div>
          ) : null}
        </div>
      </div>

      {resources.length ? (
        <div className="project-gallery__resource-list">
          <div className="project-gallery__resource-intro">
            <small>Recursos adicionales</small>
            <strong>Información para explorar por separado</strong>
            <p>
              Consulta el folleto completo o recorre el proyecto en 360°.
            </p>
          </div>
          <div className="project-gallery__resource-links">
            {resources.map((resource) => (
              <button
                key={resource.id}
                type="button"
                onClick={() => setActiveResource(resource)}
                className="project-gallery__resource-link"
              >
                <span>
                  <Icon
                    name={resource.kind === "TOUR" ? "eye" : "document"}
                    className="h-4 w-4"
                  />
                </span>
                <span>
                  <strong>{resource.label}</strong>
                  <small>{resource.description}</small>
                </span>
                <Icon name="arrow" className="ml-auto h-4 w-4" />
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {fullscreenStartIndex !== null ? (
        <ProjectImageViewer
          images={images}
          initialIndex={fullscreenStartIndex}
          projectName={project.name}
          onClose={() => setFullscreenStartIndex(null)}
        />
      ) : null}

      {activeResource ? (
        <ProjectResourceViewer
          projectName={project.name}
          resource={activeResource}
          onClose={() => setActiveResource(null)}
        />
      ) : null}
    </section>
  );
}

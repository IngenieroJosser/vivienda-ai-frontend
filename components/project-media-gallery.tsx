"use client";

import Image from "next/image";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Icon } from "./icon";
import {
  createProjectGalleryImages,
  createProjectResources,
} from "./project-media-gallery-model";
import { ProjectResourceViewer } from "./project-resource-viewer";
import { ProjectImageViewer } from "./project-image-viewer";
import type { ProjectResource } from "./project-media-gallery-model";
import type { HousingProject } from "@/lib/housing-catalog";

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
  const mobileTrackRef = useRef<HTMLDivElement>(null);
  const image = images[activeIndex] ?? images[0];
  const showPrevious = useCallback(() => {
    setActiveIndex((current) => (current - 1 + images.length) % images.length);
  }, [images.length]);
  const showNext = useCallback(() => {
    setActiveIndex((current) => (current + 1) % images.length);
  }, [images.length]);

  useEffect(() => {
    const track = mobileTrackRef.current;
    const slide = track?.children.item(activeIndex) as HTMLElement | null;
    if (!track || !slide) return;
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    track.scrollTo({
      left: slide.offsetLeft - (track.clientWidth - slide.clientWidth) / 2,
      behavior: reducedMotion ? "auto" : "smooth",
    });
  }, [activeIndex]);

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
          <span>vistas verificadas</span>
        </div>
      </div>

      <div className="project-gallery__desktop">
        {images.map((galleryImage, index) => (
          <button
            key={galleryImage.id}
            type="button"
            onClick={() => setActiveIndex(index)}
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
                  index === activeIndex
                    ? "(max-width: 1200px) 75vw, 850px"
                    : "120px"
                }
                priority={index === 0}
                quality={95}
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

      <div
        ref={mobileTrackRef}
        className="project-gallery__mobile-track"
        onScroll={(event) => {
          const track = event.currentTarget;
          const center = track.scrollLeft + track.clientWidth / 2;
          const slides = Array.from(track.children) as HTMLElement[];
          const closestIndex = slides.reduce(
            (closest, slide, index) => {
              const slideCenter = slide.offsetLeft + slide.clientWidth / 2;
              const closestSlide = slides[closest];
              const closestCenter =
                closestSlide.offsetLeft + closestSlide.clientWidth / 2;
              return Math.abs(slideCenter - center) <
                Math.abs(closestCenter - center)
                ? index
                : closest;
            },
            0,
          );
          setActiveIndex(closestIndex);
        }}
      >
        {images.map((galleryImage, index) => (
          <button
            key={galleryImage.id}
            type="button"
            onClick={() => setActiveIndex(index)}
            className="project-gallery__mobile-slide"
            data-media-kind={galleryImage.kind}
            aria-pressed={index === activeIndex}
            aria-label={`Seleccionar ${galleryImage.label}`}
          >
            <span className="project-gallery__media-frame">
              <Image
                src={galleryImage.image}
                alt=""
                fill
                sizes="88vw"
                quality={93}
                className="project-gallery__image"
              />
            </span>
            <span className="project-gallery__panel-shade" />
            <span className="project-gallery__mobile-label">
              <small>
                {galleryImage.sourcePage
                  ? `Folleto · Pág. ${galleryImage.sourcePage}`
                  : "Imagen oficial"}
              </small>
              <strong>{galleryImage.label}</strong>
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

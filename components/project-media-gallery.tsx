"use client";

import Image from "next/image";
import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { Icon } from "./icon";
import {
  createProjectGalleryImages,
  createProjectResources,
} from "./project-media-gallery-model";
import { ProjectResourceViewer } from "./project-resource-viewer";
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
  const [fullscreenOpen, setFullscreenOpen] = useState(false);
  const [activeResource, setActiveResource] =
    useState<ProjectResource | null>(null);
  const fullscreenTriggerRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const mobileTrackRef = useRef<HTMLDivElement>(null);
  const modalTitleId = useId();
  const modalDescriptionId = useId();
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

  useEffect(() => {
    if (!fullscreenOpen) return;
    const fullscreenTrigger = fullscreenTriggerRef.current;
    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") setFullscreenOpen(false);
      if (event.key === "ArrowLeft") showPrevious();
      if (event.key === "ArrowRight") showNext();
      if (event.key === "Tab") {
        const focusable = Array.from(
          modalRef.current?.querySelectorAll<HTMLElement>(
            "button:not([disabled]), a[href]",
          ) ?? [],
        );
        const first = focusable[0];
        const last = focusable.at(-1);
        if (!first || !last) return;
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };
    const previousBodyOverflow = document.body.style.overflow;
    const previousDocumentOverflow =
      document.documentElement.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    closeButtonRef.current?.focus();
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousDocumentOverflow;
      window.removeEventListener("keydown", onKeyDown);
      fullscreenTrigger?.focus();
    };
  }, [fullscreenOpen, showNext, showPrevious]);

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
            ref={fullscreenTriggerRef}
            type="button"
            onClick={() => setFullscreenOpen(true)}
            className="project-gallery__action project-gallery__action--primary"
          >
            <Icon name="eye" className="h-4 w-4" />
            Ver imagen completa
          </button>
          <span className="project-gallery__position">
            {activeIndex + 1} de {images.length}
          </span>
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

      {fullscreenOpen
        ? createPortal(
            <div
              ref={modalRef}
              className="project-gallery-modal"
              role="dialog"
              aria-modal="true"
              aria-labelledby={modalTitleId}
              aria-describedby={modalDescriptionId}
              onMouseDown={(event) => {
                if (event.target === event.currentTarget) {
                  setFullscreenOpen(false);
                }
              }}
            >
              <div
                className="project-gallery-modal__content glass-elevated"
                data-media-kind={image.kind}
              >
                <button
                  ref={closeButtonRef}
                  type="button"
                  onClick={() => setFullscreenOpen(false)}
                  className="project-gallery-modal__close"
                  aria-label="Cerrar imagen ampliada"
                >
                  <Icon name="close" className="h-5 w-5" />
                  Cerrar
                </button>
                <div className="project-gallery-modal__image">
                  <span className="project-gallery-modal__media-frame">
                    <Image
                      src={image.image}
                      alt={`${image.label} de ${project.name}`}
                      fill
                      sizes="100vw"
                      quality={100}
                      className="object-contain"
                    />
                  </span>
                </div>
                <div className="project-gallery-modal__caption">
                  <span>
                    <strong id={modalTitleId}>{project.name}</strong>
                    <span id={modalDescriptionId}>{image.label}</span>
                  </span>
                  <span className="project-gallery-modal__navigation">
                    <button
                      type="button"
                      onClick={showPrevious}
                      aria-label="Ver imagen anterior"
                    >
                      <Icon name="arrow" className="h-4 w-4 rotate-180" />
                    </button>
                    <span>{activeIndex + 1} de {images.length}</span>
                    <button
                      type="button"
                      onClick={showNext}
                      aria-label="Ver imagen siguiente"
                    >
                      <Icon name="arrow" className="h-4 w-4" />
                    </button>
                  </span>
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}

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

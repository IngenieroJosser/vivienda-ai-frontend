"use client";

import Image from "next/image";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type UIEvent,
} from "react";
import { Icon } from "./icon";
import {
  createProjectMedia,
  moveProjectMediaIndex,
  type ProjectMediaItem,
} from "./project-media-gallery-model";
import type { HousingProject } from "@/lib/housing-catalog";

export function ProjectMediaGallery({
  project,
}: {
  project: HousingProject;
}) {
  const media = useMemo(() => createProjectMedia(project), [project]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [fullscreenOpen, setFullscreenOpen] = useState(false);
  const mobileTrackRef = useRef<HTMLDivElement>(null);
  const fullscreenTriggerRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const reducedMotionRef = useRef(false);
  const activeItem = media[activeIndex];

  useEffect(() => {
    reducedMotionRef.current = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
  }, []);

  useEffect(() => {
    if (!fullscreenOpen) return;
    const fullscreenTrigger = fullscreenTriggerRef.current;
    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") setFullscreenOpen(false);
      if (event.key === "Tab") {
        event.preventDefault();
        closeButtonRef.current?.focus();
      }
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
      fullscreenTrigger?.focus();
    };
  }, [fullscreenOpen]);

  function selectMedia(index: number, alignMobile = false) {
    setActiveIndex(index);
    if (
      alignMobile &&
      window.matchMedia("(max-width: 767px)").matches &&
      mobileTrackRef.current
    ) {
      mobileTrackRef.current.scrollTo({
        left: mobileTrackRef.current.clientWidth * index,
        behavior: reducedMotionRef.current ? "auto" : "smooth",
      });
    }
  }

  function move(direction: -1 | 1) {
    const nextIndex = moveProjectMediaIndex(
      activeIndex,
      media.length,
      direction,
    );
    selectMedia(nextIndex, true);
  }

  function handleKeyboard(event: KeyboardEvent<HTMLElement>) {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    move(event.key === "ArrowLeft" ? -1 : 1);
  }

  function handleMobileScroll(event: UIEvent<HTMLDivElement>) {
    const track = event.currentTarget;
    if (!track.clientWidth) return;
    const nextIndex = Math.round(track.scrollLeft / track.clientWidth);
    if (nextIndex !== activeIndex && media[nextIndex]) {
      setActiveIndex(nextIndex);
    }
  }

  return (
    <section
      className="project-gallery"
      aria-labelledby="project-gallery-title"
      onKeyDown={handleKeyboard}
    >
      <div className="project-gallery__heading">
        <div>
          <div className="project-gallery__eyebrow">
            <Icon name="camera" className="h-4 w-4" />
            Explora el proyecto
          </div>
          <h2 id="project-gallery-title">
            Conoce los espacios y materiales disponibles.
          </h2>
        </div>
        <div className="project-gallery__counter" aria-live="polite">
          <strong>{String(activeIndex + 1).padStart(2, "0")}</strong>
          <span>/ {String(media.length).padStart(2, "0")}</span>
        </div>
      </div>

      <div className="project-gallery__desktop" role="group">
        {media.map((item, index) => {
          const active = index === activeIndex;
          return (
            <button
              key={item.id}
              type="button"
              aria-current={active ? "true" : undefined}
              aria-label={`Ver elemento ${index + 1} de ${media.length}: ${item.label}`}
              onClick={() => selectMedia(index)}
              className={`project-gallery__panel ${
                active ? "project-gallery__panel--active" : ""
              }`}
            >
              <MediaVisual
                item={item}
                projectName={project.name}
                priority={index === 0}
              />
              <span className="project-gallery__panel-shade" />
              <span className="project-gallery__panel-label">
                <small>{mediaKindLabel(item.kind)}</small>
                <strong>{item.label}</strong>
                {active ? <span>{item.description}</span> : null}
              </span>
            </button>
          );
        })}
      </div>

      <div
        ref={mobileTrackRef}
        className="project-gallery__mobile-track"
        onScroll={handleMobileScroll}
        aria-label={`Galería multimedia de ${project.name}`}
      >
        {media.map((item, index) => (
          <article
            key={item.id}
            className="project-gallery__mobile-slide"
            aria-label={`${index + 1} de ${media.length}: ${item.label}`}
          >
            <MediaVisual
              item={item}
              projectName={project.name}
              priority={index === 0}
            />
            <span className="project-gallery__panel-shade" />
            <div className="project-gallery__mobile-label">
              <small>{mediaKindLabel(item.kind)}</small>
              <strong>{item.label}</strong>
            </div>
          </article>
        ))}
      </div>

      <div className="project-gallery__details">
        <div className="project-gallery__active-copy">
          <small>{mediaKindLabel(activeItem.kind)}</small>
          <strong>{activeItem.label}</strong>
          <p>{activeItem.description}</p>
        </div>
        <div className="project-gallery__actions">
          {activeItem.kind === "PHOTO" ? (
            <button
              ref={fullscreenTriggerRef}
              type="button"
              onClick={() => setFullscreenOpen(true)}
              className="project-gallery__action project-gallery__action--secondary"
            >
              <Icon name="eye" className="h-4 w-4" />
              Ver en pantalla completa
            </button>
          ) : null}
          {"url" in activeItem && activeItem.url ? (
            <a
              href={activeItem.url}
              target="_blank"
              rel="noreferrer"
              className="project-gallery__action project-gallery__action--primary"
            >
              <Icon
                name={activeItem.kind === "TOUR" ? "eye" : "document"}
                className="h-4 w-4"
              />
              {activeItem.kind === "TOUR"
                ? "Abrir recorrido 360"
                : "Ver folleto del proyecto"}
            </a>
          ) : null}
          <div className="project-gallery__arrows">
            <button
              type="button"
              onClick={() => move(-1)}
              aria-label="Ver elemento anterior"
            >
              <Icon name="arrow" className="h-4 w-4 rotate-180" />
            </button>
            <button
              type="button"
              onClick={() => move(1)}
              aria-label="Ver elemento siguiente"
            >
              <Icon name="arrow" className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="project-gallery__thumbnails" aria-label="Elegir contenido">
        {media.map((item, index) => (
          <button
            key={item.id}
            type="button"
            aria-current={index === activeIndex ? "true" : undefined}
            aria-label={`Ver elemento ${index + 1} de ${media.length}: ${item.label}`}
            onClick={() => selectMedia(index, true)}
            className="project-gallery__thumbnail"
          >
            <ThumbnailVisual item={item} projectName={project.name} />
            <span>{item.label}</span>
          </button>
        ))}
      </div>

      {fullscreenOpen && activeItem.kind === "PHOTO" ? (
        <div
          className="project-gallery-modal"
          role="dialog"
          aria-modal="true"
          aria-label={`Vista ampliada de ${project.name}`}
        >
          <button
            ref={closeButtonRef}
            type="button"
            onClick={() => setFullscreenOpen(false)}
            className="project-gallery-modal__close"
            aria-label="Cerrar pantalla completa"
          >
            <Icon name="close" className="h-5 w-5" />
            Cerrar
          </button>
          <div className="project-gallery-modal__image">
            <Image
              src={activeItem.image}
              alt={`Vista principal del proyecto ${project.name}`}
              fill
              sizes="100vw"
              quality={90}
              className="object-contain"
            />
          </div>
          <div className="project-gallery-modal__caption">
            <strong>{project.name}</strong>
            <span>{activeItem.label}</span>
          </div>
        </div>
      ) : null}
    </section>
  );
}

function MediaVisual({
  item,
  projectName,
  priority,
}: {
  item: ProjectMediaItem;
  projectName: string;
  priority: boolean;
}) {
  if (item.kind === "PHOTO") {
    return (
      <Image
        src={item.image}
        alt={`Vista principal del proyecto ${projectName}`}
        fill
        sizes="(max-width: 768px) 100vw, 80vw"
        priority={priority}
        quality={86}
        className="project-gallery__image object-cover"
      />
    );
  }

  if (item.kind === "TYPOLOGY") {
    return (
      <span className="project-gallery__typology" aria-hidden="true">
        <span className="project-gallery__plan">
          <i />
          <i />
          <i />
          <i />
        </span>
        <b>{item.area}</b>
        <small>Área construida</small>
      </span>
    );
  }

  return (
    <span
      className={`project-gallery__resource project-gallery__resource--${item.kind.toLowerCase()}`}
      aria-hidden="true"
    >
      <span>
        <Icon
          name={item.kind === "TOUR" ? "eye" : "document"}
          className="h-8 w-8"
        />
      </span>
      <b>{item.kind === "TOUR" ? "360°" : "PDF"}</b>
      <small>{projectName}</small>
    </span>
  );
}

function ThumbnailVisual({
  item,
  projectName,
}: {
  item: ProjectMediaItem;
  projectName: string;
}) {
  if (item.kind === "PHOTO") {
    return (
      <span className="project-gallery__thumbnail-image">
        <Image
          src={item.image}
          alt=""
          fill
          sizes="80px"
          className="object-cover"
        />
      </span>
    );
  }

  return (
    <span className="project-gallery__thumbnail-icon">
      <Icon
        name={
          item.kind === "TOUR"
            ? "eye"
            : item.kind === "BROCHURE"
              ? "document"
              : "home"
        }
        className="h-4 w-4"
      />
      <span className="sr-only">{projectName}</span>
    </span>
  );
}

function mediaKindLabel(kind: ProjectMediaItem["kind"]): string {
  if (kind === "PHOTO") return "Fotografía";
  if (kind === "TYPOLOGY") return "Tipología";
  if (kind === "TOUR") return "Recorrido virtual";
  return "Material oficial";
}

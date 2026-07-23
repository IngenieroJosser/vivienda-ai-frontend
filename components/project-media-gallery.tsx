"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { Icon } from "./icon";
import {
  createProjectGalleryImages,
  createProjectResources,
} from "./project-media-gallery-model";
import type { HousingProject } from "@/lib/housing-catalog";

export function ProjectMediaGallery({
  project,
}: {
  project: HousingProject;
}) {
  const images = useMemo(() => createProjectGalleryImages(project), [project]);
  const resources = useMemo(() => createProjectResources(project), [project]);
  const [fullscreenOpen, setFullscreenOpen] = useState(false);
  const fullscreenTriggerRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const image = images[0];

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

  return (
    <section className="project-gallery" aria-labelledby="project-gallery-title">
      <div className="project-gallery__heading">
        <div>
          <div className="project-gallery__eyebrow">
            <Icon name="camera" className="h-4 w-4" />
            Imagen del proyecto
          </div>
          <h2 id="project-gallery-title">
            Una vista real para conocer su propuesta.
          </h2>
        </div>
      </div>

      <div className="project-gallery__real-image">
        <Image
          src={image.image}
          alt={`Vista principal del proyecto ${project.name}`}
          fill
          sizes="(max-width: 768px) 100vw, 90vw"
          priority
          quality={88}
          className="object-cover"
        />
        <span className="project-gallery__panel-shade" />
        <div className="project-gallery__real-image-label">
          <small>Fotografía del proyecto</small>
          <strong>{image.label}</strong>
          <span>{project.location.development}</span>
        </div>
        <button
          ref={fullscreenTriggerRef}
          type="button"
          onClick={() => setFullscreenOpen(true)}
          className="project-gallery__fullscreen"
        >
          <Icon name="eye" className="h-4 w-4" />
          Ver imagen completa
        </button>
      </div>

      {resources.length ? (
        <div className="project-gallery__resource-list">
          <div className="project-gallery__resource-intro">
            <small>Recursos adicionales</small>
            <strong>Información para explorar por separado</strong>
            <p>
              Estos enlaces no son fotografías ni planos. Se abren como
              material externo del proyecto.
            </p>
          </div>
          <div className="project-gallery__resource-links">
            {resources.map((resource) => (
              <a
                key={resource.id}
                href={resource.url}
                target="_blank"
                rel="noreferrer"
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
              </a>
            ))}
          </div>
        </div>
      ) : null}

      {fullscreenOpen ? (
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
              src={image.image}
              alt={`Vista principal del proyecto ${project.name}`}
              fill
              sizes="100vw"
              quality={92}
              className="object-contain"
            />
          </div>
          <div className="project-gallery-modal__caption">
            <strong>{project.name}</strong>
            <span>{image.label}</span>
          </div>
        </div>
      ) : null}
    </section>
  );
}

"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { isAllowedProjectEmbed } from "@/lib/housing-catalog/embed";
import { Icon } from "./icon";
import type { ProjectResource } from "./project-media-gallery-model";

type ProjectResourceViewerProps = {
  projectName: string;
  resource: ProjectResource;
  onClose: () => void;
};

export function ProjectResourceViewer({
  projectName,
  resource,
  onClose,
}: ProjectResourceViewerProps) {
  const [loading, setLoading] = useState(true);
  const [slowLoading, setSlowLoading] = useState(false);
  const [failed, setFailed] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();
  const descriptionId = useId();
  const canEmbed = isAllowedProjectEmbed(resource.url);

  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    const previousBodyOverflow = document.body.style.overflow;
    const previousDocumentOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
        return;
      }
      if (event.key !== "Tab") return;

      const focusable = Array.from(
        dialogRef.current?.querySelectorAll<HTMLElement>(
          "button:not([disabled]), a[href], iframe",
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
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousDocumentOverflow;
      window.removeEventListener("keydown", onKeyDown);
      opener?.focus();
    };
  }, [onClose]);

  useEffect(() => {
    if (!loading) return;
    const timer = window.setTimeout(() => setSlowLoading(true), 12_000);
    return () => window.clearTimeout(timer);
  }, [loading]);

  return createPortal(
    <div
      className="project-resource-viewer"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        className={`project-resource-viewer__dialog ${
          expanded ? "project-resource-viewer__dialog--expanded" : ""
        }`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
      >
        <header className="project-resource-viewer__header">
          <span className="project-resource-viewer__identity">
            <span className="project-resource-viewer__icon">
              <Icon
                name={resource.kind === "TOUR" ? "eye" : "document"}
                className="h-5 w-5"
              />
            </span>
            <span>
              <small>{projectName}</small>
              <strong id={titleId}>{resource.label}</strong>
            </span>
          </span>
          <span className="project-resource-viewer__controls">
            <button
              type="button"
              onClick={() => setExpanded((current) => !current)}
              className="project-resource-viewer__control project-resource-viewer__expand"
              aria-pressed={expanded}
            >
              <Icon name="grid" className="h-4 w-4" />
              {expanded ? "Reducir" : "Pantalla completa"}
            </button>
            <button
              ref={closeButtonRef}
              type="button"
              onClick={onClose}
              className="project-resource-viewer__control"
              aria-label={`Cerrar ${resource.label}`}
            >
              <Icon name="close" className="h-5 w-5" />
              <span className="project-resource-viewer__close-label">Cerrar</span>
            </button>
          </span>
        </header>

        <div className="project-resource-viewer__stage">
          {canEmbed && !failed ? (
            <iframe
              src={resource.url}
              title={`${resource.label} de ${projectName}`}
              className="project-resource-viewer__frame"
              allow="fullscreen; accelerometer; gyroscope"
              allowFullScreen
              loading="eager"
              referrerPolicy="strict-origin-when-cross-origin"
              onLoad={() => {
                setLoading(false);
                setSlowLoading(false);
              }}
              onError={() => {
                setLoading(false);
                setFailed(true);
              }}
            />
          ) : null}

          {loading && canEmbed && !failed ? (
            <div
              className="project-resource-viewer__status"
              role="status"
              aria-live="polite"
            >
              <span className="project-resource-viewer__loader" />
              <strong>
                {resource.kind === "TOUR"
                  ? "Preparando el recorrido…"
                  : "Preparando el folleto…"}
              </strong>
              <span>El contenido se carga directamente desde el proveedor.</span>
              {slowLoading ? (
                <a href={resource.url} target="_blank" rel="noreferrer">
                  Está tardando. Abrir en otra pestaña
                  <Icon name="arrow" className="h-4 w-4" />
                </a>
              ) : null}
            </div>
          ) : null}

          {!canEmbed || failed ? (
            <div
              className="project-resource-viewer__status project-resource-viewer__status--error"
              role="alert"
            >
              <span className="project-resource-viewer__icon">
                <Icon name="alert" className="h-5 w-5" />
              </span>
              <strong>No pudimos mostrar este recurso aquí.</strong>
              <span id={descriptionId}>
                Puedes abrirlo directamente en el sitio del proveedor.
              </span>
              <a href={resource.url} target="_blank" rel="noreferrer">
                Abrir recurso
                <Icon name="arrow" className="h-4 w-4" />
              </a>
            </div>
          ) : (
            <span id={descriptionId} className="sr-only">
              {resource.description}
            </span>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}

"use client";

import Image from "next/image";
import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { Icon } from "./icon";
import {
  getHorizontalSwipeDirection,
  type ProjectGalleryImage,
} from "./project-media-gallery-model";

type ProjectImageViewerProps = {
  images: readonly ProjectGalleryImage[];
  initialIndex: number;
  projectName: string;
  onClose: () => void;
};

export function ProjectImageViewer({
  images,
  initialIndex,
  projectName,
  onClose,
}: ProjectImageViewerProps) {
  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const swipeStartRef = useRef<{
    pointerId: number;
    x: number;
    y: number;
  } | null>(null);
  const titleId = useId();
  const descriptionId = useId();
  const image = images[activeIndex] ?? images[0];
  const showPrevious = useCallback(() => {
    setActiveIndex((current) => (current - 1 + images.length) % images.length);
  }, [images.length]);
  const showNext = useCallback(() => {
    setActiveIndex((current) => (current + 1) % images.length);
  }, [images.length]);

  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowLeft") showPrevious();
      if (event.key === "ArrowRight") showNext();
      if (event.key !== "Tab") return;

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
    };
    const previousBodyOverflow = document.body.style.overflow;
    const previousDocumentOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    closeButtonRef.current?.focus();
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousDocumentOverflow;
      window.removeEventListener("keydown", onKeyDown);
      opener?.focus();
    };
  }, [onClose, showNext, showPrevious]);

  return createPortal(
    <div
      ref={modalRef}
      className="project-gallery-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        className="project-gallery-modal__content glass-elevated"
        data-media-kind={image.kind}
      >
        <button
          ref={closeButtonRef}
          type="button"
          onClick={onClose}
          className="project-gallery-modal__close"
          aria-label="Cerrar imagen ampliada"
        >
          <Icon name="close" className="h-5 w-5" />
          Cerrar
        </button>
        <div
          className="project-gallery-modal__image"
          onPointerDown={(event) => {
            if (
              images.length < 2 ||
              event.pointerType !== "touch" ||
              !event.isPrimary
            ) {
              return;
            }
            swipeStartRef.current = {
              pointerId: event.pointerId,
              x: event.clientX,
              y: event.clientY,
            };
            event.currentTarget.setPointerCapture(event.pointerId);
          }}
          onPointerUp={(event) => {
            const start = swipeStartRef.current;
            if (!start || start.pointerId !== event.pointerId) return;
            swipeStartRef.current = null;
            if (event.currentTarget.hasPointerCapture(event.pointerId)) {
              event.currentTarget.releasePointerCapture(event.pointerId);
            }

            const direction = getHorizontalSwipeDirection({
              startX: start.x,
              startY: start.y,
              endX: event.clientX,
              endY: event.clientY,
            });
            if (direction === "NEXT") showNext();
            if (direction === "PREVIOUS") showPrevious();
          }}
          onPointerCancel={(event) => {
            swipeStartRef.current = null;
            if (event.currentTarget.hasPointerCapture(event.pointerId)) {
              event.currentTarget.releasePointerCapture(event.pointerId);
            }
          }}
        >
          <span className="project-gallery-modal__media-frame">
            <Image
              src={image.image}
              alt={`${image.label} de ${projectName}`}
              fill
              sizes="(max-width: 1200px) 92vw, 1120px"
              quality={90}
              draggable={false}
              className="object-contain"
            />
          </span>
        </div>
        <div className="project-gallery-modal__caption">
          <span>
            <strong id={titleId}>{projectName}</strong>
            <span id={descriptionId}>{image.label}</span>
          </span>
          {images.length > 1 ? (
            <span
              className="project-gallery-modal__navigation"
              aria-live="polite"
            >
              <button
                type="button"
                onClick={showPrevious}
                aria-label="Ver imagen anterior dentro del visor"
              >
                <Icon name="arrow" className="h-4 w-4 rotate-180" />
              </button>
              <span>{activeIndex + 1} de {images.length}</span>
              <button
                type="button"
                onClick={showNext}
                aria-label="Ver imagen siguiente dentro del visor"
              >
                <Icon name="arrow" className="h-4 w-4" />
              </button>
            </span>
          ) : null}
          {images.length > 1 ? (
            <span className="project-gallery-modal__swipe-hint">
              Desliza la imagen para cambiar
            </span>
          ) : null}
        </div>
      </div>
    </div>,
    document.body,
  );
}

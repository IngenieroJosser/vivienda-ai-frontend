"use client";

import { useState } from "react";
import Link from "next/link";
import { Icon } from "./icon";

const mobileLinks = [
  ["Explorar todos los proyectos", "/vivienda/proyectos"],
] as const;

export function PublicMobileNavigation() {
  const [open, setOpen] = useState(false);

  function closeMenu() {
    setOpen(false);
  }

  return (
    <div className="xl:hidden">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="grid h-11 w-11 place-items-center rounded-full border border-[color:var(--vm-color-brand-blue)]/15 bg-white text-[color:var(--vm-color-brand-blue)] shadow-[var(--vm-shadow-low)] focus-visible:outline-none focus-visible:shadow-[var(--vm-shadow-focus)]"
        aria-label={open ? "Cerrar menú" : "Abrir menú"}
        aria-expanded={open}
        aria-controls="public-mobile-nav"
      >
        <Icon name={open ? "close" : "menu"} />
      </button>

      {open ? (
        <nav
          id="public-mobile-nav"
          aria-label="Navegación pública móvil"
          className="absolute inset-x-0 top-full border-t border-[color:var(--vm-color-brand-blue)]/10 bg-white px-5 py-5 shadow-[var(--vm-shadow-medium)] sm:px-8"
        >
          <div className="mx-auto flex max-w-[1460px] flex-col gap-1">
            {mobileLinks.map(([label, href]) => (
              <Link
                key={href}
                href={href}
                prefetch
                onClick={closeMenu}
                className="flex min-h-12 items-center rounded-[var(--vm-radius-control)] px-4 text-base font-bold tracking-[.01em] text-[color:var(--vm-color-brand-blue-deep)] transition hover:bg-[color:var(--vm-color-brand-blue)]/[.055] focus-visible:outline-none focus-visible:shadow-[var(--vm-shadow-focus)]"
              >
                {label}
              </Link>
            ))}

            <Link
              href="/orientacion"
              prefetch
              onClick={closeMenu}
              className="mt-3 inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[color:var(--vm-color-brand-blue)] px-5 text-base font-bold tracking-[.01em] text-white shadow-[var(--vm-shadow-low)] focus-visible:outline-none focus-visible:shadow-[var(--vm-shadow-focus)]"
            >
              Iniciar conversación <Icon name="arrow" className="h-4 w-4" />
            </Link>
          </div>
        </nav>
      ) : null}
    </div>
  );
}

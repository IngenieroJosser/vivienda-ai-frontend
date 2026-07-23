"use client";

import { useState } from "react";
import Link from "next/link";
import { Brand } from "./brand";
import { Icon } from "./icon";

const links = [
  ["Cómo funciona", "/#como-funciona"],
  ["Proyectos", "/vivienda/proyectos"],
] as const;

export function PublicHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="public-header glass-subtle sticky top-0 z-50">
      <div className="mx-auto flex h-[76px] max-w-[1460px] items-center justify-between px-5 sm:px-8 lg:px-12">
        <Brand compact />
        <nav aria-label="Navegación principal" className="hidden items-center gap-8 lg:flex">
          {links.map(([label, href]) => <Link key={href} href={href} prefetch className="text-sm font-semibold tracking-[.01em] text-[color:var(--vm-color-ink-muted)] transition hover:text-[color:var(--vm-color-brand-blue)]">{label}</Link>)}
        </nav>
        <div className="hidden items-center gap-3 sm:flex">
          <Link href="/login" prefetch className="rounded-full px-4 py-2.5 text-sm font-semibold text-[color:var(--vm-color-ink-muted)] transition hover:bg-[color:var(--vm-color-brand-blue)]/[.06] hover:text-[color:var(--vm-color-brand-blue)]">Acceso para asesores</Link>
          <Link href="/orientacion" prefetch className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[color:var(--vm-color-brand-blue)] px-5 text-sm font-bold text-white transition hover:bg-[color:var(--vm-color-brand-blue-deep)]">Comenzar <Icon name="arrow" className="h-4 w-4" /></Link>
        </div>
        <button type="button" onClick={() => setOpen((value) => !value)} className="grid h-11 w-11 place-items-center rounded-full border border-[color:var(--vm-color-brand-blue)]/15 bg-white text-[color:var(--vm-color-brand-blue)] sm:hidden" aria-label={open ? "Cerrar menú" : "Abrir menú"} aria-expanded={open} aria-controls="public-mobile-nav">
          <Icon name={open ? "close" : "menu"} />
        </button>
      </div>
      {open ? (
        <nav id="public-mobile-nav" aria-label="Navegación móvil" className="border-t border-[color:var(--vm-color-brand-blue)]/10 bg-white px-5 py-5 sm:hidden">
          <div className="flex flex-col gap-1">
            {links.map(([label, href]) => <Link key={href} href={href} prefetch onClick={() => setOpen(false)} className="rounded-xl px-4 py-3 text-base font-semibold hover:bg-[color:var(--vm-color-brand-blue)]/[.05]">{label}</Link>)}
            <Link href="/login" prefetch onClick={() => setOpen(false)} className="rounded-xl px-4 py-3 text-sm font-semibold">Acceso para asesores</Link>
            <Link href="/orientacion" prefetch onClick={() => setOpen(false)} className="mt-2 rounded-xl bg-[color:var(--vm-color-brand-blue)] px-4 py-3 text-center text-sm font-bold text-white">Comenzar</Link>
          </div>
        </nav>
      ) : null}
    </header>
  );
}

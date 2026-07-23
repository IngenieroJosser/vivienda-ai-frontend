"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Brand, ProductBrand } from "./brand";
import { Icon } from "./icon";

const links = [
  ["Inicio", "/"],
  ["Cómo funciona", "/#como-funciona"],
  ["Proyectos", "/vivienda/proyectos"],
  ["Ayuda", "/#ayuda"],
];

export function PublicHeader() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const isHome = pathname === "/";

  if (isHome) {
    return (
      <header className="sticky top-0 z-50 border-b border-black/[.06] bg-[#fafafa]/90 backdrop-blur-xl">
        <div className="mx-auto flex h-[72px] max-w-[1500px] items-center justify-between px-5 sm:px-8 lg:px-12">
          <Brand compact />
          <nav className="hidden items-center gap-7 lg:flex">
            {links.map(([label, href]) => (
              <Link key={href} href={href} prefetch className="text-xs font-medium text-black/55 transition hover:text-[#0067b1]">{label}</Link>
            ))}
          </nav>
          <div className="hidden items-center gap-3 sm:flex">
            <Link href="/login" prefetch className="rounded-full px-4 py-2 text-xs font-semibold text-black/60 hover:bg-black/[.04]">Portal comercial</Link>
            <Link href="/vivienda/proyectos" prefetch className="inline-flex items-center gap-2 rounded-full bg-[#111] px-5 py-3 text-xs font-semibold text-white transition hover:bg-[#0067b1]">Explorar proyectos <Icon name="arrow" className="h-4 w-4" /></Link>
          </div>
          <button onClick={() => setOpen((v) => !v)} className="grid h-10 w-10 place-items-center rounded-full border border-black/10 sm:hidden" aria-label="Abrir menú">
            <Icon name={open ? "close" : "menu"} />
          </button>
        </div>
        {open ? (
          <div className="border-t border-black/[.06] bg-white px-5 py-5 sm:hidden">
            <nav className="flex flex-col gap-2">
              {links.map(([label, href]) => <Link key={href} href={href} prefetch onClick={() => setOpen(false)} className="rounded-2xl px-4 py-3 text-sm font-medium hover:bg-black/[.04]">{label}</Link>)}
              <Link href="/vivienda/proyectos" prefetch className="mt-2 rounded-2xl bg-[#0067b1] px-4 py-3 text-center text-sm font-semibold text-white">Explorar proyectos</Link>
            </nav>
          </div>
        ) : null}
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-50 border-b border-black/[.065] bg-white/92 shadow-[0_6px_24px_rgba(17,24,32,.035)] backdrop-blur-xl">
      <div className="mx-auto flex h-[76px] max-w-[1500px] items-center justify-between px-5 sm:px-8 lg:px-12">
        <ProductBrand compact />
        <nav className="hidden items-center gap-1 rounded-full border border-black/[.06] bg-[#f6f7f7] p-1 lg:flex">
          {links.slice(0, 4).map(([label, href]) => {
            const active = href !== "/" && pathname.startsWith(href.split("#")[0]);
            return (
              <Link
                key={href}
                href={href}
                className={`rounded-full px-4 py-2 text-xs font-semibold transition ${active ? "bg-white text-[#0067b1] shadow-sm" : "text-black/48 hover:text-black"}`}
              >
                {label}
              </Link>
            );
          })}
        </nav>
        <div className="hidden items-center gap-2 sm:flex">
          <Link href="/login" prefetch className="inline-flex h-10 items-center gap-2 rounded-full border border-black/[.08] bg-white px-4 text-xs font-semibold text-black/65 transition hover:border-[#0067b1]/25 hover:text-[#0067b1]">
            <Icon name="briefcase" className="h-4 w-4" /> Portal comercial
          </Link>
          <Link href="/vivienda/proyectos" prefetch className="inline-flex h-10 items-center gap-2 rounded-full bg-[#0067b1] px-5 text-xs font-semibold text-white shadow-[0_10px_26px_rgba(0,103,177,.18)] transition hover:-translate-y-0.5 hover:bg-[#005995]">
            Explorar proyectos <Icon name="arrow" className="h-4 w-4" />
          </Link>
        </div>
        <button onClick={() => setOpen((v) => !v)} className="grid h-10 w-10 place-items-center rounded-full border border-black/10 bg-white sm:hidden" aria-label="Abrir menú">
          <Icon name={open ? "close" : "menu"} />
        </button>
      </div>
      {open ? (
        <div className="border-t border-black/[.06] bg-white px-5 py-4 sm:hidden">
          <nav className="flex flex-col gap-1">
            {links.map(([label, href]) => <Link key={href} href={href} prefetch onClick={() => setOpen(false)} className="rounded-xl px-4 py-3 text-sm font-medium hover:bg-black/[.035]">{label}</Link>)}
            <Link href="/login" prefetch className="mt-2 rounded-xl border border-black/10 px-4 py-3 text-center text-sm font-semibold">Portal comercial</Link>
          </nav>
        </div>
      ) : null}
    </header>
  );
}

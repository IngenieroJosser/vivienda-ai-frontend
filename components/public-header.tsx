import Link from "next/link";
import { Brand } from "./brand";
import { Icon } from "./icon";
import { PublicMobileNavigation } from "./public-mobile-navigation";

const links = [
  ["Proyecto Versalles", "/vivienda/proyectos/versalles"],
] as const;

export function PublicHeader() {
  return (
    <header className="public-header glass-subtle sticky top-0 z-50" aria-label="Encabezado principal">
      <div className="mx-auto flex min-h-20 max-w-[1460px] items-center justify-between gap-6 px-5 sm:px-8 lg:px-12">
        <Brand compact />

        <nav aria-label="Navegación pública" className="hidden items-center gap-1 xl:flex">
          {links.map(([label, href]) => (
            <Link
              key={href}
              href={href}
              prefetch
              className="inline-flex min-h-11 items-center rounded-full px-4 text-[15px] font-bold tracking-[.01em] text-[color:var(--vm-color-ink-muted)] transition duration-150 hover:bg-[color:var(--vm-color-brand-blue)]/[.06] hover:text-[color:var(--vm-color-brand-blue)] focus-visible:outline-none focus-visible:shadow-[var(--vm-shadow-focus)]"
            >
              {label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center xl:flex">
          <Link
            href="/orientacion"
            prefetch
            className="inline-flex min-h-12 items-center gap-2 rounded-full bg-[color:var(--vm-color-brand-blue)] px-5 text-[15px] font-bold tracking-[.01em] text-white shadow-[var(--vm-shadow-low)] transition duration-150 hover:bg-[color:var(--vm-color-brand-blue-deep)] focus-visible:outline-none focus-visible:shadow-[var(--vm-shadow-focus)]"
          >
            Iniciar conversación <Icon name="arrow" className="h-4 w-4" />
          </Link>
        </div>

        <PublicMobileNavigation />
      </div>
    </header>
  );
}

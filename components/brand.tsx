import Link from "next/link";

export function Brand({ compact = false, dark = false }: { compact?: boolean; dark?: boolean }) {
  return (
    <Link href="/" prefetch className="inline-flex items-center gap-2.5" aria-label="Inicio Colsubsidio Vivienda Match AI">
      <svg className={compact ? "h-7 w-7" : "h-9 w-9"} viewBox="0 0 40 40" fill="none" aria-hidden="true">
        <path d="M4 20 18 5v9h16L20 35v-9H4Z" fill="#ffd000" />
        <path d="M18 14 8 20l10 6Z" fill="#0067b1" />
      </svg>
      <span className="flex items-center gap-1.5 sm:gap-2">
        <span className={`font-extrabold tracking-[-0.04em] ${compact ? "text-sm sm:text-lg" : "text-xl"} ${dark ? "text-white" : "text-[#0067b1]"}`}>Colsubsidio</span>
        <span className={dark ? "text-white/40" : "text-black/25"}>×</span>
        <span className={`font-black tracking-[-0.045em] ${compact ? "text-xs sm:text-base" : "text-lg"} ${dark ? "text-white" : "text-[#111]"}`}>Vivienda Match AI</span>
      </span>
    </Link>
  );
}

export function ProductBrand({ compact = false, iconOnly = false, className = "" }: { compact?: boolean; iconOnly?: boolean; className?: string }) {
  return (
    <Link href="/" prefetch className={`inline-flex min-w-0 items-center gap-2.5 ${className}`} aria-label="Inicio Vivienda Match AI">
      <svg
        className={`${compact ? "h-9 w-9" : "h-11 w-11"} shrink-0`}
        viewBox="0 0 52 52"
        fill="none"
        aria-hidden="true"
      >
        <path d="M8 24.5 25.8 9 44 24.5v16.2H31.6L25 46l-6.4-5.3H8V24.5Z" fill="#fff" stroke="#0067b1" strokeWidth="4" strokeLinejoin="round" />
        <path d="M8 24.5 25.8 9 44 24.5" stroke="#ffd000" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M35 9.5v8" stroke="#ffd000" strokeWidth="4" strokeLinecap="round" />
        <path d="M18 27h5v5h-5zM27 27h5v5h-5z" fill="#0067b1" rx="1" />
        <path d="m37.5 5 1.2 3.3L42 9.5l-3.3 1.2-1.2 3.3-1.2-3.3L33 9.5l3.3-1.2L37.5 5Z" fill="#ffd000" />
        <circle cx="45" cy="7" r="2" fill="#0067b1" />
      </svg>
      {iconOnly ? null : (
        <span className="min-w-0 leading-none">
          <span className={`block truncate font-extrabold tracking-[-.055em] text-[#111820] ${compact ? "text-[17px]" : "text-xl"}`}>Vivienda Match</span>
          <span className={`mt-1 block font-extrabold tracking-[.08em] text-[#0067b1] ${compact ? "text-[9px]" : "text-[10px]"}`}>INTELIGENCIA ARTIFICIAL</span>
        </span>
      )}
    </Link>
  );
}

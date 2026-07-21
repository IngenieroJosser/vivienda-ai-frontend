import Image from "next/image";
import Link from "next/link";

export function Brand({ compact = false, dark = false }: { compact?: boolean; dark?: boolean }) {
  return (
    <Link href="/" className="inline-flex items-center gap-2.5" aria-label="Inicio Colsubsidio Vivienda Match AI">
      <svg className={compact ? "h-7 w-7" : "h-9 w-9"} viewBox="0 0 40 40" fill="none" aria-hidden="true">
        <path d="M4 20 18 5v9h16L20 35v-9H4Z" fill="#ffd000" />
        <path d="M18 14 8 20l10 6Z" fill="#0067b1" />
      </svg>
      <span className="flex items-center gap-2">
        <span className={`font-extrabold tracking-[-0.04em] ${compact ? "text-lg" : "text-xl"} ${dark ? "text-white" : "text-[#0067b1]"}`}>Colsubsidio</span>
        <span className={dark ? "text-white/40" : "text-black/25"}>×</span>
        <span className={`font-black tracking-[-0.06em] ${compact ? "text-base" : "text-lg"} ${dark ? "text-white" : "text-[#111]"}`}>VIVIENDA AI</span>
      </span>
    </Link>
  );
}

export function ProductBrand({ compact = false, iconOnly = false, className = "" }: { compact?: boolean; iconOnly?: boolean; className?: string }) {
  const height = compact ? 38 : 48;
  return (
    <Link
      href="/"
      className={`inline-flex min-w-0 items-center ${className}`}
      aria-label="Inicio Vivienda Match AI"
    >
      {iconOnly ? (
        <Image
          src="/brand/vivienda-match-ai-icon.png"
          alt="Vivienda Match AI"
          width={height}
          height={height}
          className="rounded-[12px] object-contain"
          priority
        />
      ) : (
        <Image
          src="/brand/vivienda-match-ai-logo.png"
          alt="Vivienda Match AI"
          width={compact ? 210 : 255}
          height={compact ? 78 : 94}
          className={`${compact ? "h-9 w-auto" : "h-11 w-auto"} object-contain object-left`}
          priority
        />
      )}
    </Link>
  );
}

import Image from "next/image";
import Link from "next/link";

type BrandLockupProps = {
  compact?: boolean;
  dark?: boolean;
  showProductLabel?: boolean;
};

function BrandLockup({
  compact = false,
  dark = false,
  showProductLabel = true,
}: BrandLockupProps) {
  return (
    <>
      <Image
        src="/brand/colsubsidio-logo.svg"
        alt="Colsubsidio"
        width={181}
        height={36}
        preload
        className={`w-auto ${compact ? "h-7 sm:h-8" : "h-8 sm:h-9"} ${dark ? "brightness-0 invert" : ""}`}
      />
      {showProductLabel ? (
        <>
          <span className={`hidden h-6 w-px sm:block ${dark ? "bg-white/30" : "bg-[color:var(--vm-color-brand-blue)]/20"}`} aria-hidden="true" />
          <span className={`hidden font-bold tracking-[-.035em] sm:block ${compact ? "text-base lg:text-lg" : "text-lg"} ${dark ? "text-white" : "text-[color:var(--vm-color-brand-blue-deep)]"}`}>
            Vivienda
          </span>
        </>
      ) : null}
    </>
  );
}

export function Brand({ compact = false, dark = false }: { compact?: boolean; dark?: boolean }) {
  return (
    <Link href="/" prefetch className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-lg focus-visible:outline-none focus-visible:shadow-[var(--vm-shadow-focus)] sm:gap-3" aria-label="Inicio Vivienda Colsubsidio">
      <BrandLockup compact={compact} dark={dark} />
    </Link>
  );
}

export function ProductBrand({
  compact = false,
  iconOnly = false,
  className = "",
}: {
  compact?: boolean;
  iconOnly?: boolean;
  className?: string;
}) {
  return (
    <Link
      href="/"
      prefetch
      className={`inline-flex min-h-11 min-w-0 items-center gap-2 rounded-lg focus-visible:outline-none focus-visible:shadow-[var(--vm-shadow-focus)] sm:gap-3 ${className}`}
      aria-label="Inicio Vivienda Colsubsidio"
    >
      <BrandLockup compact={compact} showProductLabel={!iconOnly} />
    </Link>
  );
}

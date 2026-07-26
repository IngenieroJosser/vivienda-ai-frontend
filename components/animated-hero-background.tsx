import type { CSSProperties } from "react";

type AnimatedBackgroundVariant =
  | "hero"
  | "vivienda"
  | "projects"
  | "asesor"
  | "dark";

type AnimatedHeroBackgroundProps = {
  variant?: AnimatedBackgroundVariant;
  className?: string;
  interactive?: boolean;
  compact?: boolean;
};

const shapePositions = [
  ["12%", "20%", "-1s"],
  ["31%", "72%", "-4s"],
  ["61%", "24%", "-7s"],
  ["84%", "66%", "-10s"],
] as const;

/**
 * Fondo visual sin JavaScript en tiempo de ejecución.
 *
 * Las animaciones usan únicamente transform y opacity para mantener el diseño
 * fluido sin bloquear el hilo principal ni registrar listeners globales.
 */
export function AnimatedHeroBackground({
  variant = "hero",
  className = "",
  compact = false,
}: AnimatedHeroBackgroundProps) {
  const rich = variant === "hero" || variant === "dark" || variant === "projects";

  return (
    <div
      aria-hidden="true"
      className={`animated-hero-background animated-hero-background--${variant} ${compact ? "animated-hero-background--compact" : ""} ${className}`}
    >
      <div className="animated-hero-background__base" />
      <div className="animated-hero-background__blob animated-hero-background__blob--one" />
      <div className="animated-hero-background__blob animated-hero-background__blob--two" />
      {rich ? <div className="animated-hero-background__blob animated-hero-background__blob--three" /> : null}
      {rich ? <div className="animated-hero-background__ribbon" /> : null}
      <div className="animated-hero-background__shimmer" />
      {rich ? (
        <div className="animated-hero-background__shapes">
          {shapePositions.map(([left, top, delay], index) => (
            <span
              key={`${left}-${top}`}
              className={index % 2 === 0 ? "is-blue" : "is-light"}
              style={{ left, top, animationDelay: delay } as CSSProperties}
            />
          ))}
        </div>
      ) : null}
      <div className="animated-hero-background__grain" />
    </div>
  );
}

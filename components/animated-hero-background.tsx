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
  ["10%", "18%", "-1s", "12s"],
  ["27%", "76%", "-4s", "15s"],
  ["57%", "21%", "-7s", "13s"],
  ["83%", "68%", "-10s", "17s"],
  ["72%", "42%", "-5s", "14s"],
  ["42%", "54%", "-9s", "16s"],
] as const;

/**
 * Fondo líquido decorativo sin JavaScript en tiempo de ejecución.
 *
 * Conserva la misma API del componente anterior. Las animaciones se ejecutan
 * únicamente con CSS, transform y opacity para no bloquear el hilo principal.
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
      <div className="animated-hero-background__aurora" />
      <div className="animated-hero-background__fold animated-hero-background__fold--one" />
      <div className="animated-hero-background__fold animated-hero-background__fold--two" />
      <div className="animated-hero-background__blob animated-hero-background__blob--one" />
      <div className="animated-hero-background__blob animated-hero-background__blob--two" />
      {rich ? <div className="animated-hero-background__blob animated-hero-background__blob--three" /> : null}
      {rich ? <div className="animated-hero-background__blob animated-hero-background__blob--four" /> : null}
      {rich ? <div className="animated-hero-background__ribbon" /> : null}
      {rich ? (
        <div className="animated-hero-background__contours">
          <span />
          <span />
          <span />
        </div>
      ) : null}
      <div className="animated-hero-background__shimmer" />
      {rich ? (
        <div className="animated-hero-background__shapes">
          {shapePositions.map(([left, top, delay, duration], index) => (
            <span
              key={`${left}-${top}`}
              className={index % 3 === 0 ? "is-blue" : index % 3 === 1 ? "is-light" : "is-yellow"}
              style={{ left, top, animationDelay: delay, animationDuration: duration } as CSSProperties}
            />
          ))}
        </div>
      ) : null}
      <div className="animated-hero-background__grain" />
    </div>
  );
}

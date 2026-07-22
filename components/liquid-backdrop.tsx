import type { CSSProperties } from "react";

type LiquidVariant = "hero" | "soft" | "portal" | "dark" | "accent";

export function LiquidBackdrop({
  variant = "soft",
  className = "",
}: {
  variant?: LiquidVariant;
  className?: string;
}) {
  const style = {
    "--liquid-delay": `${variant === "hero" ? -4 : -9}s`,
  } as CSSProperties;

  return (
    <div
      aria-hidden="true"
      className={`liquid-backdrop liquid-backdrop--${variant} ${className}`}
      style={style}
    >
      <div className="liquid-backdrop__wash" />
      <div className="liquid-backdrop__shape liquid-backdrop__shape--one" />
      <div className="liquid-backdrop__shape liquid-backdrop__shape--two" />
      <div className="liquid-backdrop__shape liquid-backdrop__shape--three" />
      <div className="liquid-backdrop__shape liquid-backdrop__shape--four" />
      <div className="liquid-backdrop__highlight liquid-backdrop__highlight--one" />
      <div className="liquid-backdrop__highlight liquid-backdrop__highlight--two" />
      <div className="liquid-backdrop__glow" />
      <div className="liquid-backdrop__grain" />
    </div>
  );
}

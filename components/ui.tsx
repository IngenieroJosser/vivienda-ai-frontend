import type { ReactNode } from "react";

export function Pill({ children, tone = "blue" }: { children: ReactNode; tone?: "blue" | "yellow" | "green" | "gray" | "red" | "image-overlay" }) {
  const classes = {
    blue: "bg-[color:var(--vm-color-orientation-sky-soft)] text-[color:var(--vm-color-brand-blue)]",
    yellow: "bg-[color:var(--vm-color-brand-yellow-soft)] text-[color:var(--vm-color-warning)]",
    green: "bg-[color:var(--vm-color-success-soft)] text-[color:var(--vm-color-success)]",
    gray: "bg-[color:var(--vm-color-orientation-wash)] text-[color:var(--vm-color-ink-muted)]",
    red: "bg-[color:var(--vm-color-error-soft)] text-[color:var(--vm-color-error)]",
    "image-overlay": "border border-[color:var(--vm-color-brand-blue)]/15 bg-[color:var(--vm-surface-solid)] text-[color:var(--vm-color-brand-blue-deep)] shadow-[var(--vm-shadow-medium)]",
  }[tone];

  return <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${classes}`}>{children}</span>;
}

export function ProgressBar({ value, label }: { value: number; label?: string }) {
  const safeValue = Math.max(0, Math.min(100, value));

  return (
    <div>
      {label ? <div className="mb-2.5 flex items-center justify-between text-[11px] text-[color:var(--vm-color-ink-muted)]"><span>{label}</span><span className="font-bold text-[color:var(--vm-color-brand-blue)]">{safeValue}%</span></div> : null}
      <div className="h-2 overflow-hidden rounded-full bg-[color:var(--vm-color-orientation-wash)]">
        <div className="h-full rounded-full bg-gradient-to-r from-[color:var(--vm-color-brand-yellow)] via-[color:var(--vm-color-brand-blue-light)] to-[color:var(--vm-color-brand-blue)] transition-all duration-500" style={{ width: `${safeValue}%` }} />
      </div>
    </div>
  );
}

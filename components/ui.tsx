import type { ReactNode } from "react";

export function Pill({ children, tone = "blue" }: { children: ReactNode; tone?: "blue" | "yellow" | "green" | "gray" | "red" | "image-overlay" }) {
  const classes = {
    blue: "bg-[#0067b1]/10 text-[#0067b1]",
    yellow: "bg-[#ffd000]/22 text-[#7a6100]",
    green: "bg-emerald-50 text-emerald-700",
    gray: "bg-black/[.05] text-black/60",
    red: "bg-rose-50 text-rose-700",
    "image-overlay": "border border-[color:var(--vm-color-brand-blue)]/15 bg-[color:var(--vm-surface-solid)] text-[color:var(--vm-color-brand-blue-deep)] shadow-[var(--vm-shadow-medium)]",
  }[tone];

  return <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${classes}`}>{children}</span>;
}

export function ProgressBar({ value, label }: { value: number; label?: string }) {
  const safeValue = Math.max(0, Math.min(100, value));

  return (
    <div>
      {label ? <div className="mb-2.5 flex items-center justify-between text-[11px] text-black/48"><span>{label}</span><span className="font-bold text-[#0067b1]">{safeValue}%</span></div> : null}
      <div className="h-2 overflow-hidden rounded-full bg-black/[.06]">
        <div className="h-full rounded-full bg-gradient-to-r from-[#ffd000] via-[#49a4df] to-[#0067b1] transition-all duration-500" style={{ width: `${safeValue}%` }} />
      </div>
    </div>
  );
}

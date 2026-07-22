import Link from "next/link";
import type { ReactNode } from "react";
import { Icon } from "./icon";

export function PrimaryLink({ href, children, className = "" }: { href: string; children: ReactNode; className?: string }) {
  return (
    <Link href={href} prefetch className={`liquid-button inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[#111820] px-6 text-sm font-semibold text-white shadow-[0_14px_32px_rgba(17,24,32,.16)] transition hover:-translate-y-1 hover:bg-[#0067b1] ${className}`}>
      {children}
      <Icon name="arrow" className="h-4 w-4" />
    </Link>
  );
}

export function SecondaryLink({ href, children, className = "" }: { href: string; children: ReactNode; className?: string }) {
  return (
    <Link href={href} prefetch className={`inline-flex h-11 items-center justify-center gap-2 rounded-full border border-black/10 bg-white/82 px-5 text-sm font-semibold text-[#111] shadow-sm backdrop-blur transition hover:-translate-y-0.5 hover:border-[#0067b1]/30 hover:bg-white ${className}`}>
      {children}
    </Link>
  );
}

export function Pill({ children, tone = "blue" }: { children: ReactNode; tone?: "blue" | "yellow" | "green" | "gray" | "red" }) {
  const classes = {
    blue: "bg-[#0067b1]/10 text-[#0067b1]",
    yellow: "bg-[#ffd000]/22 text-[#7a6100]",
    green: "bg-emerald-50 text-emerald-700",
    gray: "bg-black/[.05] text-black/60",
    red: "bg-rose-50 text-rose-700",
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

export function StatCard({ label, value, detail, icon }: { label: string; value: string; detail?: string; icon?: Parameters<typeof Icon>[0]["name"] }) {
  return (
    <div className="metric-card p-5">
      <div className="relative z-10 mb-5 flex items-center justify-between">
        <span className="text-xs font-semibold text-black/48">{label}</span>
        {icon ? <span className="grid h-9 w-9 place-items-center rounded-[12px] bg-[#0067b1]/7 text-[#0067b1]"><Icon name={icon} className="h-4 w-4" /></span> : null}
      </div>
      <div className="relative z-10 text-3xl font-bold tracking-[-0.055em]">{value}</div>
      {detail ? <p className="relative z-10 mt-2 text-[11px] text-black/42">{detail}</p> : null}
    </div>
  );
}

export function EmptyState({ title, description, icon = "info" }: { title: string; description: string; icon?: Parameters<typeof Icon>[0]["name"] }) {
  return (
    <div className="rounded-[24px] border border-dashed border-[#0067b1]/18 bg-gradient-to-br from-white to-[#f5faff] p-10 text-center">
      <span className="mx-auto grid h-12 w-12 place-items-center rounded-[16px] bg-[#ffd000]/25 text-[#0067b1]"><Icon name={icon} /></span>
      <h3 className="mt-4 text-lg font-bold">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-black/48">{description}</p>
    </div>
  );
}

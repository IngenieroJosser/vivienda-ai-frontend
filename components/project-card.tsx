import Image from "next/image";
import Link from "next/link";
import { Icon } from "./icon";
import { Pill, ProgressBar } from "./ui";
import type { projects } from "@/lib/data";

type Project = (typeof projects)[number];

export function ProjectCard({ project, compact = false }: { project: Project; compact?: boolean }) {
  return (
    <article className="project-card surface-card surface-card--interactive group overflow-hidden">
      <span aria-hidden="true" className="project-card__ambient" />
      <div className={`relative overflow-hidden ${compact ? "h-44" : "h-56"}`}>
        <Image src={project.image} alt={project.name} fill sizes="(max-width: 1024px) 100vw, 33vw" loading="lazy" quality={68} unoptimized={project.image.endsWith(".svg")} className="object-cover transition duration-500 ease-out group-hover:scale-[1.04]" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#111820]/52 via-transparent to-white/5" />
        <div className="absolute left-4 top-4"><Pill tone={project.status.includes("Últimas") ? "yellow" : "green"}>{project.status}</Pill></div>
        <button aria-label={`Guardar ${project.name}`} className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full border border-white/55 bg-white/88 text-black/55 shadow-sm backdrop-blur transition hover:text-[#0067b1]"><Icon name="heart" className="h-4 w-4" /></button>
        <div className="project-card__match absolute bottom-4 left-4 rounded-full border border-white/55 bg-white/90 px-3 py-1.5 text-[10px] font-extrabold text-[#0067b1] shadow-sm backdrop-blur">{project.compatibility}% compatible</div>
      </div>
      <div className="p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0"><div className="text-[10px] font-bold uppercase tracking-[.11em] text-[#0067b1]">{project.city} · {project.zone}</div><h3 className="mt-1.5 text-xl font-bold tracking-[-.038em]">{project.name}</h3></div>
          <div className="shrink-0 text-right"><div className="text-[9px] uppercase tracking-[.1em] text-black/35">Desde</div><div className="mt-1 text-lg font-extrabold tracking-[-.03em]">{project.priceLabel}</div></div>
        </div>
        <div className="mt-5 grid grid-cols-3 divide-x divide-black/[.07] rounded-[16px] border border-black/[.055] bg-[#f7f8f8] py-3 text-center">
          <div><div className="text-xs font-bold">{project.area}</div><div className="mt-1 text-[9px] text-black/38">Área</div></div>
          <div><div className="text-xs font-bold">{project.rooms}</div><div className="mt-1 text-[9px] text-black/38">Habitaciones</div></div>
          <div><div className="text-xs font-bold">{project.units}</div><div className="mt-1 text-[9px] text-black/38">Unidades</div></div>
        </div>
        <p className="mt-5 min-h-12 text-xs leading-5 text-black/48">{project.reason}</p>
        <div className="mt-5"><ProgressBar value={project.compatibility} label="Afinidad con tu perfil" /></div>
        <Link href={`/vivienda/proyectos/${project.id}`} prefetch className="liquid-button mt-5 inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-[#0067b1] text-xs font-bold text-white shadow-[0_12px_30px_rgba(0,103,177,.18)] transition hover:-translate-y-1 hover:bg-[#005995]">Ver proyecto <Icon name="arrow" className="h-4 w-4" /></Link>
      </div>
    </article>
  );
}

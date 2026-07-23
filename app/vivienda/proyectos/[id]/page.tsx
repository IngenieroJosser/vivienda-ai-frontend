import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Icon } from "@/components/icon";
import { Pill } from "@/components/ui";
import { projects } from "@/lib/data";

export const dynamicParams = false;

export function generateStaticParams() {
  return projects.map((project) => ({ id: project.id }));
}

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const project = projects.find((item) => item.id === id);
  if (!project) notFound();

  return (
    <main className="mx-auto max-w-[1200px] px-5 py-8 sm:px-8 lg:px-12 lg:py-10">
      <Link href="/vivienda/proyectos" className="inline-flex items-center gap-2 rounded-full border border-[color:var(--vm-color-line)] bg-white px-3.5 py-2 text-[10px] font-bold text-[color:var(--vm-color-brand-blue)] shadow-sm"><Icon name="arrow" className="h-3.5 w-3.5 rotate-180" />Volver a proyectos</Link>
      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <section className="space-y-5">
          <div className="flow-panel overflow-hidden">
            <div className="relative h-[360px] sm:h-[500px]"><Image src={project.image} alt={project.name} fill sizes="(max-width: 1280px) 100vw, 70vw" preload unoptimized={project.image.endsWith(".svg")} className="object-cover" /><div className="absolute inset-0 bg-gradient-to-t from-[color:var(--vm-color-brand-blue-deep)]/72 via-transparent to-transparent" /><div className="absolute bottom-0 p-7 text-white"><div className="text-xs font-semibold text-[color:var(--vm-color-brand-yellow)]">{project.city} · {project.zone}</div><h1 className="mt-2 text-4xl font-bold">{project.name}</h1></div></div>
          </div>
          <section className="surface-solid p-6 sm:p-8"><div className="flex items-center gap-3"><Pill tone="yellow">{project.status}</Pill><span className="text-xs text-[color:var(--vm-color-ink-muted)]">Información preliminar</span></div><p className="mt-5 text-sm leading-7 text-[color:var(--vm-color-ink-muted)]">{project.reason}</p><div className="mt-6 grid gap-3 sm:grid-cols-2">{project.features.map((feature) => <div key={feature} className="flex items-center gap-3 rounded-[15px] border border-[color:var(--vm-color-line)] p-3.5 text-xs font-semibold"><Icon name="check" className="h-4 w-4 text-[color:var(--vm-color-success)]" />{feature}</div>)}</div></section>
        </section>
        <aside className="space-y-5">
          <section className="surface-card p-6"><div className="text-[10px] uppercase tracking-[.12em] text-[color:var(--vm-color-ink-muted)]">Información del proyecto</div><div className="mt-5 space-y-3 text-xs">{[["Precio publicado", project.priceLabel], ["Área", project.area], ["Habitaciones", project.rooms], ["Entrega", project.delivery]].map(([label, value]) => <div key={label} className="flex justify-between"><span className="text-[color:var(--vm-color-ink-muted)]">{label}</span><b>{value}</b></div>)}</div></section>
          <Link href="/orientacion?utm_source=portal&utm_campaign=versalles_proyecto&utm_content=ficha" className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#0067b1] text-sm font-bold text-white"><Icon name="arrow" className="h-4 w-4" />Iniciar orientación</Link>
          <section className="surface-solid p-5 text-xs leading-5 text-[color:var(--vm-color-ink-muted)]">La información es orientativa. Precio, unidades, financiación y beneficios deben validarse antes de tomar una decisión.</section>
        </aside>
      </div>
    </main>
  );
}

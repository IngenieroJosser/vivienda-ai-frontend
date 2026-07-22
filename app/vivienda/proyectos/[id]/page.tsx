import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Icon } from "@/components/icon";
import { Pill, ProgressBar } from "@/components/ui";
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
    <main className="mx-auto max-w-[1460px] px-5 py-8 sm:px-8 lg:px-12 lg:py-10">
        <div className="flex items-center justify-between gap-4">
          <Link href="/vivienda/proyectos" className="inline-flex items-center gap-2 rounded-full border border-black/[.07] bg-white px-3.5 py-2 text-[10px] font-bold text-black/45 shadow-sm transition hover:border-[#0067b1]/20 hover:text-[#0067b1]"><Icon name="arrow" className="h-3.5 w-3.5 rotate-180" />Volver a resultados</Link>
          <button className="inline-flex items-center gap-2 rounded-full border border-black/[.07] bg-white px-3.5 py-2 text-[10px] font-bold text-black/45 shadow-sm"><Icon name="heart" className="h-3.5 w-3.5" />Guardar proyecto</button>
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.28fr)_390px]">
          <section className="space-y-6">
            <div className="project-detail-hero flow-panel overflow-hidden">
              <div className="relative h-[360px] sm:h-[520px]">
                <Image src={project.image} alt={project.name} fill sizes="(max-width: 1280px) 100vw, 70vw" preload unoptimized={project.image.endsWith(".svg")} className="object-cover transition duration-700 ease-out hover:scale-[1.02]" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#111820]/68 via-transparent to-black/5" />
                <div className="absolute left-5 top-5 flex items-center gap-2"><Pill tone="green">{project.status}</Pill><span className="rounded-full border border-white/50 bg-white/88 px-3 py-1 text-[10px] font-extrabold text-[#0067b1] backdrop-blur">{project.compatibility}% compatible</span></div>
                <button className="absolute right-5 top-5 grid h-10 w-10 place-items-center rounded-full border border-white/50 bg-white/88 text-[#0067b1] shadow-sm backdrop-blur"><Icon name="camera" className="h-5 w-5" /></button>
                <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8"><div className="text-[10px] font-bold uppercase tracking-[.12em] text-[#ffd000]">{project.city} · {project.zone}</div><h1 className="mt-2 text-4xl font-bold tracking-[-.055em] text-white sm:text-5xl">{project.name}</h1><div className="mt-4 flex flex-wrap gap-3 text-[10px] font-semibold text-white/72"><span className="inline-flex items-center gap-1.5"><Icon name="building" className="h-3.5 w-3.5" />Apartamentos</span><span className="inline-flex items-center gap-1.5"><Icon name="home" className="h-3.5 w-3.5" />{project.rooms} habitaciones</span><span className="inline-flex items-center gap-1.5"><Icon name="calendar" className="h-3.5 w-3.5" />{project.delivery}</span></div></div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-4">
              {[["Precio desde", project.priceLabel, "money"], ["Área", project.area, "compare"], ["Habitaciones", project.rooms, "home"], ["Unidades", String(project.units), "building"]].map(([label, value, icon]) => <div key={label} className="surface-card p-5"><span className="grid h-9 w-9 place-items-center rounded-[12px] bg-[#0067b1]/7 text-[#0067b1]"><Icon name={icon as Parameters<typeof Icon>[0]["name"]} className="h-4 w-4" /></span><div className="mt-4 text-[9px] font-semibold uppercase tracking-[.1em] text-black/35">{label}</div><div className="mt-1 text-sm font-bold">{value}</div></div>)}
            </div>

            <section className="flow-panel p-6 sm:p-8">
              <div className="flex flex-wrap items-center gap-6 border-b border-black/[.065] pb-4 text-xs font-bold"><button className="border-b-2 border-[#0067b1] pb-4 text-[#0067b1]">Descripción</button><button className="pb-4 text-black/40">Amenidades</button><button className="pb-4 text-black/40">Planos</button><button className="pb-4 text-black/40">Disponibilidad</button></div>
              <div className="mt-7 grid gap-7 lg:grid-cols-[1fr_.8fr]">
                <div><h2 className="text-2xl font-bold tracking-[-.04em]">Un proyecto que encaja con tu momento</h2><p className="mt-4 text-sm leading-7 text-black/48">{project.reason} La estimación considera recursos para cuota inicial, capacidad mensual y preferencias registradas.</p><div className="mt-6 grid gap-3 sm:grid-cols-2">{project.features.map((feature) => <div key={feature} className="flex items-center gap-3 rounded-[15px] border border-black/[.06] bg-[#f7f8f8] p-3.5 text-xs font-bold"><span className="grid h-7 w-7 place-items-center rounded-[9px] bg-[#ffd000]/24 text-[#0067b1]"><Icon name="check" className="h-3.5 w-3.5" /></span>{feature}</div>)}</div></div>
                <div className="rounded-[20px] border border-[#0067b1]/12 bg-[#f4f9fd] p-5"><div className="flex items-center justify-between"><h3 className="text-sm font-bold">Ubicación estratégica</h3><Icon name="location" className="h-5 w-5 text-[#0067b1]" /></div><div className="mt-4 grid h-36 place-items-center rounded-[16px] bg-[linear-gradient(135deg,#e8eef2,#f9fbfc)]"><div className="text-center"><span className="mx-auto grid h-11 w-11 place-items-center rounded-full bg-[#0067b1] text-white shadow-lg"><Icon name="location" className="h-5 w-5" /></span><div className="mt-3 text-[10px] font-bold">{project.zone}, {project.city}</div></div></div><button className="mt-4 inline-flex items-center gap-2 text-[10px] font-bold text-[#0067b1]">Ver en el mapa <Icon name="arrow" className="h-3.5 w-3.5" /></button></div>
              </div>
            </section>
          </section>

          <aside className="space-y-5 xl:sticky xl:top-28 xl:self-start">
            <section className="surface-card p-6">
              <div className="flex items-center justify-between"><div><div className="text-[9px] font-bold uppercase tracking-[.12em] text-black/35">Compatibilidad</div><div className="mt-2 text-4xl font-extrabold tracking-[-.06em] text-[#0067b1]">{project.compatibility}%</div></div><span className="grid h-14 w-14 place-items-center rounded-[18px] bg-[#ffd000]/22 text-[#0067b1]"><Icon name="target" className="h-7 w-7" /></span></div>
              <div className="mt-5"><ProgressBar value={project.compatibility} /></div>
              <div className="mt-6 space-y-3">{["Dentro de tu rango estimado", "Ubicación compatible", "Cuota mensual viable", "Tamaño adecuado para tu hogar"].map((item) => <div key={item} className="flex items-center gap-3 text-[11px] text-black/52"><span className="grid h-6 w-6 place-items-center rounded-full bg-emerald-50 text-emerald-700"><Icon name="check" className="h-3 w-3" /></span>{item}</div>)}</div>
            </section>

            <section className="rounded-[24px] bg-[#111820] p-6 text-white shadow-[0_18px_48px_rgba(17,24,32,.16)]">
              <div className="flex items-center justify-between"><div className="text-[9px] font-bold uppercase tracking-[.14em] text-[#ffd000]">Simulación preliminar</div><Icon name="money" className="h-5 w-5 text-[#ffd000]" /></div>
              <div className="mt-6 space-y-4">{[["Precio desde", project.priceLabel], ["Cuota inicial", "$29,8 M"], ["Cuota estimada", "$1,31 M"], ["Esfuerzo financiero", "Saludable"]].map(([label, value], index) => <div key={label} className="flex items-center justify-between border-b border-white/[.08] pb-3 text-xs last:border-0"><span className="text-white/42">{label}</span><b className={index === 3 ? "text-emerald-400" : "text-white"}>{value}</b></div>)}</div>
              <Link href="/vivienda/agendar" className="mt-6 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#ffd000] text-sm font-extrabold text-[#111820] transition hover:-translate-y-0.5">Agendar asesoría <Icon name="calendar" className="h-4 w-4" /></Link>
              <Link href="/vivienda/simulador" className="mt-3 inline-flex h-11 w-full items-center justify-center gap-2 rounded-full border border-white/12 text-xs font-bold text-white transition hover:bg-white/[.06]"><Icon name="settings" className="h-4 w-4" />Ajustar simulación</Link>
            </section>

            <section className="flow-aside-card p-5"><div className="flex gap-3"><Icon name="info" className="mt-0.5 h-5 w-5 shrink-0 text-[#0067b1]" /><div><h3 className="text-xs font-bold">Información orientativa</h3><p className="mt-1 text-[10px] leading-5 text-black/46">Precios y disponibilidad deben validarse con el equipo comercial antes de una separación.</p></div></div></section>
          </aside>
        </div>
      </main>
  );
}

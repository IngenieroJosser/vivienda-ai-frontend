import { PublicHeader } from "@/components/public-header";
import { ProjectCard } from "@/components/project-card";
import { projects } from "@/lib/data";
import { Icon } from "@/components/icon";

export default function ProyectosPage() {
  return (
    <div className="internal-shell">
      <PublicHeader />
      <main className="mx-auto max-w-[1460px] px-5 py-10 sm:px-8 lg:px-12 lg:py-14">
        <section className="relative overflow-hidden rounded-[30px] border border-black/[.06] bg-white/82 px-6 py-9 shadow-[0_20px_60px_rgba(17,24,32,.055)] backdrop-blur sm:px-9 lg:px-11">
          <div className="absolute -right-32 -top-36 h-96 w-96 rounded-full bg-[#ffd000]/24 blur-3xl" />
          <div className="relative grid items-end gap-7 lg:grid-cols-[1fr_.72fr]">
            <div><div className="inline-flex items-center gap-2 rounded-full bg-[#0067b1]/6 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[.14em] text-[#0067b1]"><Icon name="sparkles" className="h-4 w-4 text-[#ffd000]" />Recomendación personalizada</div><h1 className="mt-5 max-w-3xl text-4xl font-bold leading-[.96] tracking-[-.06em] sm:text-6xl">Proyectos que se ajustan a ti.</h1><p className="mt-4 max-w-2xl text-sm leading-7 text-black/48">Ordenamos la oferta por compatibilidad financiera, ubicación, tamaño del hogar y horizonte de compra.</p></div>
            <div className="grid grid-cols-3 gap-3 lg:justify-self-end"><div className="rounded-[17px] border border-black/[.06] bg-white p-4 text-center shadow-sm"><div className="text-2xl font-extrabold text-[#0067b1]">3</div><div className="mt-1 text-[9px] text-black/38">Compatibles</div></div><div className="rounded-[17px] border border-black/[.06] bg-white p-4 text-center shadow-sm"><div className="text-2xl font-extrabold">94%</div><div className="mt-1 text-[9px] text-black/38">Mejor match</div></div><div className="rounded-[17px] border border-black/[.06] bg-white p-4 text-center shadow-sm"><div className="text-2xl font-extrabold">$186M</div><div className="mt-1 text-[9px] text-black/38">Desde</div></div></div>
          </div>
        </section>

        <section className="surface-card mt-6 flex flex-col gap-3 p-3 sm:flex-row sm:items-center">
          <button className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-[#0067b1] px-4 text-xs font-bold text-white shadow-sm"><Icon name="filter" className="h-4 w-4" />Todos los filtros</button>
          {["Bogotá y Sabana", "$140–220 M", "2–3 habitaciones", "Entrega 2027–2028"].map((filter) => <button key={filter} className="h-10 rounded-full border border-black/[.08] bg-white px-4 text-xs font-semibold text-black/50 transition hover:border-[#0067b1]/24 hover:text-[#0067b1]">{filter}</button>)}
          <div className="ml-auto flex items-center gap-2 border-t border-black/[.06] pt-3 sm:border-l sm:border-t-0 sm:pl-3 sm:pt-0"><span className="hidden text-[10px] text-black/38 lg:block">Ordenar por</span><select className="h-10 rounded-full border border-black/[.08] bg-white px-4 text-xs font-bold outline-none"><option>Mayor compatibilidad</option><option>Menor precio</option><option>Entrega más cercana</option></select></div>
        </section>

        <div className="mt-7 grid gap-6 lg:grid-cols-3">{projects.map((project) => <ProjectCard key={project.id} project={project} />)}</div>
        <div className="mt-8 flex justify-center"><button className="inline-flex h-11 items-center gap-2 rounded-full border border-black/[.08] bg-white px-5 text-xs font-bold shadow-sm transition hover:border-[#0067b1]/22 hover:text-[#0067b1]">Ver más opciones <Icon name="arrow" className="h-4 w-4" /></button></div>
      </main>
    </div>
  );
}

"use client";

import { useState } from "react";
import { PortalShell } from "@/components/portal-shell";
import { Icon } from "@/components/icon";
import { Pill, ProgressBar } from "@/components/ui";
import { projects } from "@/lib/data";

export default function ComparadorPage() {
  const [selected, setSelected] = useState(projects.map((project) => project.id));
  const visible = projects.filter((project) => selected.includes(project.id));

  return (
    <PortalShell role="asesor" title="Comparador de proyectos" subtitle="Solo contiene proyectos asociados a los escenarios aprobados.">
      <section className="surface-solid p-6">
        <div className="flex flex-wrap gap-3">
          {projects.map((project) => (
            <label key={project.id} className="flex cursor-pointer items-center gap-2 rounded-full border border-black/10 bg-white px-4 py-2 text-xs font-semibold">
              <input type="checkbox" checked={selected.includes(project.id)} onChange={() => setSelected((items) => items.includes(project.id) ? items.filter((id) => id !== project.id) : [...items, project.id])} className="accent-[#0067b1]" />
              {project.name}
            </label>
          ))}
        </div>
      </section>
      {visible.length ? <div className="mt-5 grid gap-5 lg:grid-cols-3">{visible.map((project) => <article key={project.id} className="surface-card p-6"><div className="flex items-start justify-between gap-4"><div><div className="text-xs font-semibold text-[#0067b1]">{project.city} · {project.zone}</div><h2 className="mt-1 text-xl font-semibold">{project.name}</h2></div><Pill tone="yellow">{project.status}</Pill></div><div className="mt-6"><ProgressBar value={project.compatibility} label="Compatibilidad preliminar" /></div><div className="mt-5 space-y-3 text-xs">{[["Precio", project.priceLabel], ["Área", project.area], ["Habitaciones", project.rooms], ["Entrega", project.delivery]].map(([label, value]) => <div key={label} className="flex justify-between gap-4"><span className="text-black/45">{label}</span><b>{value}</b></div>)}</div><ul className="mt-5 space-y-2 text-xs leading-5 text-black/55">{project.features.map((feature) => <li key={feature} className="flex gap-2"><Icon name="check" className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" />{feature}</li>)}</ul></article>)}</div> : <div className="surface-solid mt-5 p-10 text-center text-sm text-black/45">Selecciona un proyecto para compararlo.</div>}
    </PortalShell>
  );
}

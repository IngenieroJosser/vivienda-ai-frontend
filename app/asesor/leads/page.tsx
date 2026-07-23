"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { PortalShell } from "@/components/portal-shell";
import { Icon } from "@/components/icon";
import { Pill } from "@/components/ui";
import { leads } from "@/lib/data";

export default function LeadsPage() {
  const [query, setQuery] = useState("");
  const [route, setRoute] = useState("Todas");
  const routes = ["Todas", ...new Set(leads.map((lead) => lead.route))];
  const filtered = useMemo(
    () => leads.filter((lead) => {
      const matchesQuery = `${lead.name} ${lead.project} ${lead.source}`.toLowerCase().includes(query.toLowerCase());
      return matchesQuery && (route === "Todas" || lead.route === route);
    }),
    [query, route],
  );

  return (
    <PortalShell role="asesor" title="Bandeja de leads" subtitle="Escenarios sintéticos aprobados para validar las rutas de cierre, no afiliado y nutrición.">
      <div className="surface-solid overflow-hidden">
        <div className="flex flex-col gap-4 border-b border-black/[.07] p-5 lg:flex-row">
          <label className="relative flex-1">
            <span className="sr-only">Buscar leads</span>
            <Icon name="search" className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-black/35" />
            <input value={query} onChange={(event) => setQuery(event.target.value)} className="form-field pl-11" placeholder="Buscar por nombre, proyecto o canal" />
          </label>
          <label>
            <span className="sr-only">Filtrar por ruta</span>
            <select value={route} onChange={(event) => setRoute(event.target.value)} className="h-11 rounded-full border border-black/10 bg-white px-4 text-xs font-semibold">
              {routes.map((item) => <option key={item}>{item}</option>)}
            </select>
          </label>
        </div>
        <div className="overflow-x-auto">
          <table className="data-table min-w-[980px]">
            <thead><tr><th>Lead</th><th>Preparación</th><th>Ruta</th><th>Afiliación</th><th>Horizonte</th><th>Proyecto</th><th>Próxima acción</th></tr></thead>
            <tbody>{filtered.map((lead) => (
              <tr key={lead.id}>
                <td><Link href={`/asesor/leads/${lead.id}`} className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-full bg-[#0067b1]/10 text-xs font-bold text-[#0067b1]">{lead.initials}</span><div><div className="font-semibold">{lead.name}</div><div className="mt-0.5 text-[10px] text-black/40">{lead.source}</div></div></Link></td>
                <td><div className="flex items-center gap-2"><b>{lead.score}/100</b><Pill tone={lead.priority === "Alta" ? "green" : "yellow"}>{lead.priority}</Pill></div></td>
                <td><Pill tone={lead.route.includes("Nutrición") ? "yellow" : "blue"}>{lead.route}</Pill></td>
                <td>{lead.affiliate}</td>
                <td>{lead.horizon}</td>
                <td>{lead.project}</td>
                <td><Link href={`/asesor/leads/${lead.id}`} className="font-semibold text-[#0067b1]">{lead.nextAction}</Link></td>
              </tr>
            ))}</tbody>
          </table>
        </div>
        <div className="border-t border-black/[.07] p-5 text-xs text-black/45">Mostrando {filtered.length} de {leads.length} escenarios</div>
      </div>
    </PortalShell>
  );
}

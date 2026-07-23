import { PortalShell } from "@/components/portal-shell";
import { Icon } from "@/components/icon";

export default function AgendaPage() {
  return (
    <PortalShell role="asesor" title="Agenda comercial" subtitle="Las citas reales aparecerán cuando el servicio de agendamiento esté conectado.">
      <section className="surface-solid grid min-h-80 place-items-center p-8 text-center">
        <div className="max-w-md">
          <span className="mx-auto grid h-12 w-12 place-items-center rounded-[16px] bg-[#0067b1]/10 text-[#0067b1]"><Icon name="calendar" /></span>
          <h2 className="mt-5 text-xl font-semibold">No hay citas cargadas</h2>
          <p className="mt-3 text-sm leading-6 text-black/48">Esta vista no simula reuniones ni acciones comerciales. Se habilitará al integrar el contrato real de agendamiento.</p>
        </div>
      </section>
    </PortalShell>
  );
}

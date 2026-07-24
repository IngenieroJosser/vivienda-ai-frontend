"use client";

import { useState } from "react";
import { Icon } from "@/components/icon";
import { runSimulation, type SimulationResult } from "@/lib/backend-api";

const initialProfile = {
  affiliation: "AFFILIATE",
  location: "SOACHA",
  horizon: "6_12",
  incomeRange: "LOW",
  obligations: "MEDIUM",
  savings: "PARTIAL",
  householdSize: "3",
};

export function SimulationWorkspace() {
  const [profile, setProfile] = useState(initialProfile);
  const [changes, setChanges] = useState({ savings: "READY", obligations: "LOW", horizon: "3_6" });
  const [result, setResult] = useState<SimulationResult>();
  const [status, setStatus] = useState<"IDLE" | "LOADING" | "ERROR">("IDLE");

  async function simulate() {
    setStatus("LOADING");
    try {
      setResult(await runSimulation({ profile, changes }));
      setStatus("IDLE");
    } catch {
      setStatus("ERROR");
    }
  }

  return (
    <div className="grid gap-4 xl:grid-cols-[.82fr_1.18fr]">
      <section className="surface-solid p-6 sm:p-7">
        <div className="text-[10px] font-bold uppercase tracking-[.12em] text-[color:var(--vm-color-brand-blue)]">Escenario actual</div>
        <h2 className="mt-2 text-xl font-semibold">Cambia una condición y observa la ruta</h2>
        <p className="mt-2 text-sm leading-6 text-[color:var(--vm-color-ink-muted)]">La simulación ayuda al asesor a explicar qué tendría que cambiar para avanzar. No es una aprobación financiera.</p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <Select label="Afiliación" value={profile.affiliation} onChange={(value) => setProfile({ ...profile, affiliation: value })} options={[['AFFILIATE','Afiliado'],['NON_AFFILIATE','No afiliado'],['UNKNOWN','Por validar']]} />
          <Select label="Ubicación" value={profile.location} onChange={(value) => setProfile({ ...profile, location: value })} options={[['SOACHA','Soacha'],['BOGOTA','Bogotá'],['SABANA','Sabana']]} />
          <Select label="Ingresos" value={profile.incomeRange} onChange={(value) => setProfile({ ...profile, incomeRange: value })} options={[['LOW','Hasta 2 SMLV'],['MID','2 a 4 SMLV'],['HIGH','Más de 4 SMLV']]} />
          <Select label="Ahorro actual" value={profile.savings} onChange={(value) => setProfile({ ...profile, savings: value })} options={[['NONE','Sin ahorro'],['PARTIAL','En construcción'],['READY','Base disponible']]} />
          <Select label="Obligaciones actuales" value={profile.obligations} onChange={(value) => setProfile({ ...profile, obligations: value })} options={[['LOW','Menos de 15%'],['MEDIUM','15% a 30%'],['HIGH','Más de 30%']]} />
          <Select label="Horizonte" value={profile.horizon} onChange={(value) => setProfile({ ...profile, horizon: value })} options={[['0_3','0 a 3 meses'],['3_6','3 a 6 meses'],['6_12','6 a 12 meses'],['12_PLUS','Más de 12 meses']]} />
        </div>
      </section>

      <section className="surface-solid p-6 sm:p-7">
        <div className="flex items-start justify-between gap-4"><div><div className="text-[10px] font-bold uppercase tracking-[.12em] text-[color:var(--vm-color-brand-blue)]">Simulación de mejora</div><h2 className="mt-2 text-xl font-semibold">Condiciones que el lead podría trabajar</h2></div><span className="grid h-11 w-11 place-items-center rounded-[14px] bg-[color:var(--vm-color-brand-yellow)]/25 text-[color:var(--vm-color-brand-blue)]"><Icon name="target" /></span></div>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <Select label="Ahorro simulado" value={changes.savings} onChange={(value) => setChanges({ ...changes, savings: value })} options={[['NONE','Sin ahorro'],['PARTIAL','En construcción'],['READY','Base disponible']]} />
          <Select label="Obligaciones simuladas" value={changes.obligations} onChange={(value) => setChanges({ ...changes, obligations: value })} options={[['LOW','Menos de 15%'],['MEDIUM','15% a 30%'],['HIGH','Más de 30%']]} />
          <Select label="Horizonte simulado" value={changes.horizon} onChange={(value) => setChanges({ ...changes, horizon: value })} options={[['0_3','0 a 3 meses'],['3_6','3 a 6 meses'],['6_12','6 a 12 meses'],['12_PLUS','Más de 12 meses']]} />
        </div>
        <button type="button" onClick={simulate} disabled={status === "LOADING"} className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[color:var(--vm-color-brand-blue)] px-6 text-xs font-bold text-white disabled:opacity-50"><Icon name="sparkles" className="h-4 w-4" />{status === "LOADING" ? "Calculando…" : "Ejecutar simulación"}</button>
        {status === "ERROR" ? <p className="mt-4 rounded-[16px] bg-red-50 p-3 text-xs text-red-700">Inicia el backend FastAPI para ejecutar la simulación.</p> : null}
        {result ? <SimulationResultView result={result} /> : <div className="mt-6 rounded-[22px] border border-dashed border-[color:var(--vm-color-line)] p-8 text-center text-sm text-[color:var(--vm-color-ink-muted)]">El resultado comparará ruta, puntaje y proyectos sin modificar el lead real.</div>}
      </section>
    </div>
  );
}

function Select({ label, value, onChange, options }: { label: string; value: string; onChange: (value: string) => void; options: Array<[string,string]> }) { return <label className="grid gap-2 text-xs font-semibold"><span>{label}</span><select className="form-field" value={value} onChange={(event) => onChange(event.target.value)}>{options.map(([optionValue, text]) => <option key={optionValue} value={optionValue}>{text}</option>)}</select></label>; }

function SimulationResultView({ result }: { result: SimulationResult }) { return <div className="mt-6 space-y-4"><div className="grid gap-3 sm:grid-cols-3"><ResultMetric label="Ruta inicial" value={result.original_route} /><ResultMetric label="Ruta simulada" value={result.simulated_route} /><ResultMetric label="Cambio" value={`${result.score_delta >= 0 ? '+' : ''}${result.score_delta} puntos`} /></div><p className="rounded-[18px] bg-[color:var(--vm-color-brand-blue)]/[.045] p-4 text-sm leading-6">{result.interpretation}</p><div><div className="text-xs font-bold uppercase tracking-[.08em] text-[color:var(--vm-color-brand-blue)]">Proyectos después del cambio</div><div className="mt-3 grid gap-3 sm:grid-cols-3">{result.recommendations.map((item) => <div key={item.project_id} className="rounded-[18px] border border-[color:var(--vm-color-line)] p-4"><div className="text-sm font-semibold">{item.project_name}</div><div className="mt-1 text-xs text-[color:var(--vm-color-ink-muted)]">Afinidad {Math.round(item.score)}%</div></div>)}</div></div></div>; }
function ResultMetric({ label, value }: { label: string; value: string }) { return <div className="rounded-[18px] bg-black/[.025] p-4"><div className="text-[10px] font-bold uppercase tracking-[.1em] text-[color:var(--vm-color-ink-muted)]">{label}</div><div className="mt-2 text-sm font-semibold">{value}</div></div>; }

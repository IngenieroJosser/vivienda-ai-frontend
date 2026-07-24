"use client";

import { useEffect, useMemo, useState } from "react";
import { Icon } from "@/components/icon";
import {
  enrichPublicProfile,
  getBackendAnalytics,
  getBackendHealth,
  getDataQuality,
  getModelInfo,
  getSearchConsoleOverview,
  type BackendAnalytics,
  type BackendHealth,
  type ModelInfo,
  type SearchConsoleOverview,
} from "@/lib/backend-api";

export function IntelligenceCenter() {
  const [health, setHealth] = useState<BackendHealth>();
  const [analytics, setAnalytics] = useState<BackendAnalytics>();
  const [model, setModel] = useState<ModelInfo>();
  const [searchConsole, setSearchConsole] = useState<SearchConsoleOverview>();
  const [quality, setQuality] = useState<Record<string, unknown>>();
  const [status, setStatus] = useState<"LOADING" | "READY" | "OFFLINE">("LOADING");
  const [leadId, setLeadId] = useState("");
  const [profileUrl, setProfileUrl] = useState("");
  const [consent, setConsent] = useState(false);
  const [enrichmentMessage, setEnrichmentMessage] = useState("");

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      getBackendHealth(),
      getBackendAnalytics(),
      getModelInfo(),
      getSearchConsoleOverview(),
      getDataQuality(),
    ])
      .then(([nextHealth, nextAnalytics, nextModel, nextSearchConsole, nextQuality]) => {
        if (cancelled) return;
        setHealth(nextHealth);
        setAnalytics(nextAnalytics);
        setModel(nextModel);
        setSearchConsole(nextSearchConsole);
        setQuality(nextQuality);
        setStatus("READY");
      })
      .catch(() => {
        if (!cancelled) setStatus("OFFLINE");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const routeEntries = useMemo(
    () => Object.entries(analytics?.route_distribution ?? {}).sort((left, right) => right[1] - left[1]),
    [analytics],
  );

  async function requestEnrichment() {
    setEnrichmentMessage("");
    if (!leadId || !profileUrl || !consent) {
      setEnrichmentMessage("Completa el lead, la URL pública y el consentimiento explícito.");
      return;
    }
    try {
      const result = await enrichPublicProfile({ lead_id: leadId, profile_url: profileUrl, consent });
      setEnrichmentMessage(
        result.status === "COMPLETED"
          ? `Enriquecimiento completado: ${result.collected_fields.join(", ") || "sin señales nuevas"}.`
          : result.warnings.join(" "),
      );
    } catch {
      setEnrichmentMessage("No fue posible ejecutar el proveedor. La orientación principal no se ve afectada.");
    }
  }

  if (status === "LOADING") return <IntelligenceLoading />;
  if (status === "OFFLINE") {
    return (
      <section className="surface-solid p-8 text-center">
        <Icon name="brain" className="mx-auto h-8 w-8 text-[color:var(--vm-color-brand-blue)]" />
        <h2 className="mt-4 text-xl font-semibold">El backend todavía no está disponible</h2>
        <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-[color:var(--vm-color-ink-muted)]">
          El frontend conserva todas sus funciones locales. Inicia FastAPI en el puerto 8000 para activar datos, modelo, auditoría, simulaciones y enriquecimiento opcional.
        </p>
      </section>
    );
  }

  return (
    <div className="space-y-4">
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Metric icon="shield" label="API" value={health?.status === "ok" ? "Operativa" : "Degradada"} detail={`v${health?.version ?? "—"}`} />
        <Metric icon="users" label="Leads sincronizados" value={String(analytics?.totals.leads ?? 0)} detail={`${analytics?.totals.evaluated ?? 0} evaluados`} />
        <Metric icon="clock" label="Latencia de decisión" value={`${analytics?.latency_ms.average ?? 0} ms`} detail={`máx. ${analytics?.latency_ms.maximum ?? 0} ms`} />
        <Metric icon="brain" label="Recomendador" value={model?.model_version ?? "Afinidad"} detail={health?.model_available ? "Modelo cargado" : "Fallback explicable"} />
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.08fr_.92fr]">
        <article className="surface-solid p-6 sm:p-7">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-[.12em] text-[color:var(--vm-color-brand-blue)]">Calidad y priorización</div>
              <h2 className="mt-2 text-xl font-semibold">Qué recibe el asesor y por qué</h2>
            </div>
            <span className="grid h-11 w-11 place-items-center rounded-[14px] bg-[color:var(--vm-color-brand-yellow)]/25 text-[color:var(--vm-color-brand-blue)]"><Icon name="target" /></span>
          </div>
          <div className="mt-6 space-y-3">
            {routeEntries.length ? routeEntries.map(([route, count]) => (
              <div key={route} className="flex items-center gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-3 text-xs font-semibold"><span>{routeLabel(route)}</span><span>{count}</span></div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-black/[.055]"><span className="block h-full rounded-full bg-[color:var(--vm-color-brand-blue)]" style={{ width: `${Math.min(100, count / Math.max(1, analytics?.totals.evaluated ?? 1) * 100)}%` }} /></div>
                </div>
              </div>
            )) : <p className="text-sm text-[color:var(--vm-color-ink-muted)]">Los leads aparecerán cuando el flujo público sincronice sesiones.</p>}
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <Compact label="Afiliación identificada" value={analytics?.totals.affiliation_identified ?? 0} />
            <Compact label="Perfil completo" value={analytics?.totals.profile_complete ?? 0} />
            <Compact label="Proyectos utilizables" value={analytics?.totals.projects ?? 0} />
          </div>
        </article>

        <article className="surface-solid p-6 sm:p-7">
          <div className="text-[10px] font-bold uppercase tracking-[.12em] text-[color:var(--vm-color-brand-blue)]">Modelo de afinidad</div>
          <h2 className="mt-2 text-xl font-semibold">Datos históricos convertidos en ranking</h2>
          <dl className="mt-6 grid gap-3 sm:grid-cols-2">
            <ModelStat label="Objetivo" value={model?.target ?? "project_id"} />
            <ModelStat label="Partición" value={model?.split_type ?? "Temporal"} />
            <ModelStat label="Recall@3" value={formatPercent(model?.recall_at_3)} />
            <ModelStat label="MRR@3" value={formatPercent(model?.mrr_at_3)} />
            <ModelStat label="Entrenamiento" value={String(model?.train_rows ?? 0)} />
            <ModelStat label="Prueba" value={String(model?.test_rows ?? 0)} />
          </dl>
          <p className="mt-5 rounded-[18px] bg-[color:var(--vm-color-brand-blue)]/[.045] p-4 text-xs leading-5 text-[color:var(--vm-color-ink-muted)]">
            {model?.claim ?? "El puntaje expresa afinidad histórica y no una aprobación o probabilidad de compra."}
          </p>
        </article>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <article className="surface-solid p-6 sm:p-7">
          <div className="flex items-center gap-3"><Icon name="search" className="h-5 w-5 text-[color:var(--vm-color-brand-blue)]" /><h2 className="text-lg font-semibold">Google Search Console</h2></div>
          <p className="mt-3 text-sm leading-6 text-[color:var(--vm-color-ink-muted)]">{searchConsole?.note}</p>
          <div className={`mt-5 inline-flex rounded-full px-3 py-2 text-xs font-bold ${searchConsole?.configured ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>
            {searchConsole?.configured ? "Propiedad conectada" : "Pendiente de credenciales OAuth"}
          </div>
          <p className="mt-4 text-xs leading-5 text-[color:var(--vm-color-ink-muted)]">
            Esta integración permite entender consultas, páginas y dispositivos del tráfico orgánico. No reemplaza la atribución de campañas ni el CRM.
          </p>
        </article>

        <article className="surface-solid p-6 sm:p-7">
          <div className="flex items-center gap-3"><Icon name="sparkles" className="h-5 w-5 text-[color:var(--vm-color-brand-blue)]" /><h2 className="text-lg font-semibold">Enriquecimiento público y consentido</h2></div>
          <p className="mt-3 text-sm leading-6 text-[color:var(--vm-color-ink-muted)]">
            La plataforma no busca personas automáticamente por nombre, documento o correo. Solo puede procesar una URL pública entregada voluntariamente y nunca usa esa información para aprobar crédito o excluir.
          </p>
          <div className="mt-5 grid gap-3">
            <input className="form-field" value={leadId} onChange={(event) => setLeadId(event.target.value)} placeholder="ID del lead sincronizado" />
            <input className="form-field" value={profileUrl} onChange={(event) => setProfileUrl(event.target.value)} placeholder="URL pública de LinkedIn o perfil autorizado" />
            <label className="flex items-start gap-3 rounded-[18px] border border-[color:var(--vm-color-line)] p-4 text-xs leading-5">
              <input type="checkbox" checked={consent} onChange={(event) => setConsent(event.target.checked)} className="mt-0.5" />
              <span>Confirmo que la persona entregó esta URL y autorizó su uso para personalizar la orientación.</span>
            </label>
            <button type="button" onClick={requestEnrichment} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[color:var(--vm-color-brand-blue)] px-5 text-xs font-bold text-white"><Icon name="search" className="h-4 w-4" />Consultar proveedor configurado</button>
            {enrichmentMessage ? <p className="rounded-[16px] bg-black/[.035] p-3 text-xs leading-5">{enrichmentMessage}</p> : null}
          </div>
        </article>
      </section>

      <section className="surface-solid p-6 sm:p-7">
        <div className="grid gap-6 lg:grid-cols-[.8fr_1.2fr]">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-[.12em] text-[color:var(--vm-color-brand-blue)]">Datos entregados</div>
            <h2 className="mt-2 text-xl font-semibold">Qué usa realmente la plataforma</h2>
            <p className="mt-3 text-sm leading-6 text-[color:var(--vm-color-ink-muted)]">Base histórica, buyer personas y recursos comerciales. Los datos de campaña, inversión y CRM no se inventan.</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <SourceCard label="Compradores históricos" value={readQualityNumber(quality, "pipeline", "source_rows") || 4_142} />
            <SourceCard label="Registros mapeados" value={readQualityNumber(quality, "pipeline", "mapped_rows") || 3_692} />
            <SourceCard label="Buyer personas" value={readQualityNumber(quality, "pipeline", "persona_slide_count") || 22} />
          </div>
        </div>
      </section>
    </div>
  );
}

function Metric({ icon, label, value, detail }: { icon: Parameters<typeof Icon>[0]["name"]; label: string; value: string; detail: string }) {
  return <article className="surface-solid p-5"><div className="flex items-start justify-between gap-3"><div><div className="text-[10px] font-bold uppercase tracking-[.1em] text-[color:var(--vm-color-ink-muted)]">{label}</div><div className="mt-2 text-xl font-semibold tracking-[-.035em]">{value}</div><div className="mt-1 text-xs text-[color:var(--vm-color-ink-muted)]">{detail}</div></div><span className="grid h-10 w-10 place-items-center rounded-[13px] bg-[color:var(--vm-color-brand-blue)]/[.07] text-[color:var(--vm-color-brand-blue)]"><Icon name={icon} className="h-5 w-5" /></span></div></article>;
}

function Compact({ label, value }: { label: string; value: number }) { return <div className="rounded-[18px] bg-black/[.025] p-4"><div className="text-2xl font-semibold">{value}</div><div className="mt-1 text-[11px] text-[color:var(--vm-color-ink-muted)]">{label}</div></div>; }
function ModelStat({ label, value }: { label: string; value: string }) { return <div className="rounded-[18px] border border-[color:var(--vm-color-line)] p-4"><dt className="text-[10px] font-bold uppercase tracking-[.1em] text-[color:var(--vm-color-ink-muted)]">{label}</dt><dd className="mt-2 text-sm font-semibold">{value}</dd></div>; }
function SourceCard({ label, value }: { label: string; value: number }) { return <div className="rounded-[20px] bg-[color:var(--vm-color-brand-yellow)]/18 p-5"><div className="text-3xl font-semibold tracking-[-.045em]">{value.toLocaleString("es-CO")}</div><div className="mt-2 text-xs font-semibold">{label}</div></div>; }
function formatPercent(value?: number) { return typeof value === "number" ? `${Math.round(value * 100)} %` : "Por medir"; }
function routeLabel(route: string) { return ({ READY_TO_CLOSE: "Listos para cierre", NEEDS_VALIDATION: "Validación breve", NON_AFFILIATE_REVIEW: "Revisión 90/10", NURTURE: "Acompañamiento", FINANCIAL_PREPARATION: "Preparación financiera", OPTED_OUT: "No continuó" } as Record<string, string>)[route] ?? route; }
function readQualityNumber(value: Record<string, unknown> | undefined, section: string, key: string): number { const nested = value?.[section]; return nested && typeof nested === "object" && typeof (nested as Record<string, unknown>)[key] === "number" ? (nested as Record<string, number>)[key] : 0; }
function IntelligenceLoading() { return <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{Array.from({ length: 8 }).map((_, index) => <div key={index} className="surface-solid h-32 animate-pulse bg-black/[.025]" />)}</div>; }

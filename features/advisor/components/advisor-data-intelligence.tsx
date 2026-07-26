"use client";

import { useCallback, useEffect, useState } from "react";
import { FeedbackState } from "@/components/feedback-state";
import { Icon } from "@/components/icon";
import { Pill } from "@/components/ui";
import {
  getAdvisorDashboard,
  type AdvisorDashboardData,
  type DataAsset,
  type DistributionItem,
} from "@/lib/api/analytics";

export function AdvisorDataIntelligence({
  detailed = false,
}: {
  readonly detailed?: boolean;
}) {
  const [data, setData] = useState<AdvisorDashboardData>();
  const [status, setStatus] = useState<"LOADING" | "READY" | "ERROR">(
    "LOADING",
  );
  const [requestVersion, setRequestVersion] = useState(0);
  const retry = useCallback(() => {
    setStatus("LOADING");
    setRequestVersion((current) => current + 1);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    getAdvisorDashboard(controller.signal)
      .then((response) => {
        setData(response);
        setStatus("READY");
      })
      .catch((error: unknown) => {
        if (
          !(error instanceof DOMException && error.name === "AbortError")
        ) {
          setStatus("ERROR");
        }
      });
    return () => controller.abort();
  }, [requestVersion]);

  if (status === "LOADING") return <IntelligenceLoading detailed={detailed} />;
  if (status === "ERROR" || !data) {
    return (
      <FeedbackState
        icon="alert"
        tone="error"
        title="No pudimos cargar la inteligencia del asesor"
        description="La bandeja comercial sigue disponible. Verifica el backend para consultar los datos procesados y las métricas del modelo."
        action={{ label: "Reintentar", onClick: retry }}
      />
    );
  }

  const insights = data.insights ?? [];
  return (
    <div className="space-y-4">
      <section
        className="surface-solid grid divide-y divide-[color:var(--vm-color-line)] overflow-hidden sm:grid-cols-2 sm:divide-x sm:divide-y-0 xl:grid-cols-4"
        aria-label="Panorama vivo del embudo"
      >
        <LiveMetric
          label="Leads perfilados"
          value={data.live.total_leads}
          icon="users"
        />
        <LiveMetric
          label="Listos para asesor"
          value={data.live.ready_for_advisor}
          icon="briefcase"
          tone="success"
        />
        <LiveMetric
          label="En acompañamiento"
          value={data.live.accompaniment}
          icon="heart"
          tone={data.live.accompaniment ? "attention" : "default"}
        />
        <LiveMetric
          label="Entregas pendientes"
          value={data.live.pending_handoffs}
          icon="clock"
        />
      </section>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1.1fr)_minmax(320px,.9fr)]">
        <div className="surface-solid overflow-hidden">
          <SectionHeader
            eyebrow="Lectura operativa"
            title="Señales para decidir y acompañar"
            icon="brain"
          />
          <div className="divide-y divide-[color:var(--vm-color-line)]">
            {insights.slice(0, detailed ? undefined : 4).map((insight) => (
              <article
                key={insight.title}
                className="grid gap-3 px-5 py-4 sm:grid-cols-[auto_1fr] sm:items-start"
              >
                <span
                  className={`grid h-9 w-9 place-items-center rounded-[var(--vm-radius-control)] ${insightToneClasses[insight.tone]}`}
                >
                  <Icon
                    name={
                      insight.tone === "ATTENTION"
                        ? "alert"
                        : insight.tone === "SUCCESS"
                          ? "check"
                          : "info"
                    }
                    className="h-4 w-4"
                  />
                </span>
                <div>
                  <h3 className="text-sm font-semibold">{insight.title}</h3>
                  <p className="mt-1 text-xs leading-5 text-[color:var(--vm-color-ink-muted)]">
                    {insight.detail}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className="surface-solid overflow-hidden">
          <SectionHeader
            eyebrow="Base analítica"
            title="Datos procesados y modelo"
            icon="chart"
          />
          <div className="grid grid-cols-2 divide-x divide-y divide-[color:var(--vm-color-line)]">
            <DataPoint
              label="Registros históricos"
              value={formatNumber(data.historical.historical_records)}
            />
            <DataPoint
              label="Proyectos mapeados"
              value={formatNumber(data.historical.mapped_projects)}
            />
            <DataPoint
              label="Afiliados históricos"
              value={formatPercent(data.historical.affiliate_share)}
            />
            <DataPoint
              label="Recall en top 3"
              value={formatPercent(data.model.recall_at_3)}
            />
          </div>
          <div className="border-t border-[color:var(--vm-color-line)] px-5 py-4">
            <div className="flex flex-wrap items-center gap-2">
              <Pill tone={data.model.available ? "green" : "yellow"}>
                {data.model.available
                  ? "Modelo disponible"
                  : "Fallback activo"}
              </Pill>
              <span className="text-xs font-semibold">
                {data.model.version}
              </span>
            </div>
            <p className="mt-2 text-xs leading-5 text-[color:var(--vm-color-ink-muted)]">
              {data.model.claim}
            </p>
          </div>
        </div>
      </section>

      {detailed ? <DetailedIntelligence data={data} /> : null}
    </div>
  );
}

function DetailedIntelligence({
  data,
}: {
  readonly data: AdvisorDashboardData;
}) {
  return (
    <>
      <section className="grid gap-4 xl:grid-cols-2">
        <DistributionPanel
          title="Afinidad histórica por proyecto"
          description="Proyectos con más registros mapeados en la base histórica."
          items={data.historical.top_projects ?? []}
        />
        <DistributionPanel
          title="Canales históricos principales"
          description="Distribución descriptiva; no separa de forma confiable pauta y tráfico orgánico."
          items={data.historical.top_channels ?? []}
        />
      </section>

      <section className="surface-solid overflow-hidden">
        <SectionHeader
          eyebrow="Trazabilidad técnica"
          title="Fuentes disponibles para el perfilador"
          icon="document"
        />
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] border-collapse text-left">
            <thead className="bg-[color:var(--vm-color-orientation-wash)] text-[11px] uppercase text-[color:var(--vm-color-ink-muted)]">
              <tr>
                <th className="px-5 py-3 font-bold">Fuente</th>
                <th className="px-5 py-3 font-bold">Área</th>
                <th className="px-5 py-3 font-bold">Filas</th>
                <th className="px-5 py-3 font-bold">Estado</th>
                <th className="px-5 py-3 font-bold">Uso</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[color:var(--vm-color-line)]">
              {(data.assets ?? []).map((asset) => (
                <AssetRow key={asset.path} asset={asset} />
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="surface-solid overflow-hidden">
        <SectionHeader
          eyebrow="Uso responsable"
          title="Límites de interpretación"
          icon="shield"
        />
        <ul className="divide-y divide-[color:var(--vm-color-line)]">
          {(data.warnings ?? []).map((warning) => (
            <li
              key={warning}
              className="flex gap-3 px-5 py-4 text-sm leading-6"
            >
              <Icon
                name="info"
                className="mt-1 h-4 w-4 shrink-0 text-[color:var(--vm-color-brand-blue)]"
              />
              <span>{warning}</span>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}

function DistributionPanel({
  title,
  description,
  items,
}: {
  readonly title: string;
  readonly description: string;
  readonly items: DistributionItem[];
}) {
  const maximum = Math.max(...items.map(({ count }) => count), 1);
  return (
    <section className="surface-solid p-5">
      <h2 className="text-base font-semibold">{title}</h2>
      <p className="mt-1 text-xs leading-5 text-[color:var(--vm-color-ink-muted)]">
        {description}
      </p>
      <div className="mt-5 space-y-4">
        {items.map((item) => (
          <div key={item.key}>
            <div className="mb-1.5 flex items-center justify-between gap-3 text-xs">
              <span className="truncate font-semibold">{item.label}</span>
              <span className="shrink-0 text-[color:var(--vm-color-ink-muted)]">
                {formatNumber(item.count)} · {formatPercent(item.share)}
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-[color:var(--vm-color-orientation-wash)]">
              <div
                className="h-full rounded-full bg-[color:var(--vm-color-brand-blue)]"
                style={{ width: `${(item.count / maximum) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function AssetRow({ asset }: { readonly asset: DataAsset }) {
  return (
    <tr>
      <td className="px-5 py-4">
        <div className="text-sm font-semibold">{asset.name}</div>
        <div className="mt-1 font-mono text-[10px] text-[color:var(--vm-color-ink-muted)]">
          {asset.path}
        </div>
      </td>
      <td className="px-5 py-4 text-xs capitalize">{asset.area}</td>
      <td className="px-5 py-4 text-xs">
        {asset.rows === null || asset.rows === undefined
          ? "No aplica"
          : formatNumber(asset.rows)}
      </td>
      <td className="px-5 py-4">
        <Pill tone={asset.status === "AVAILABLE" ? "green" : "red"}>
          {asset.status === "AVAILABLE" ? "Disponible" : "Faltante"}
        </Pill>
      </td>
      <td className="max-w-[340px] px-5 py-4 text-xs leading-5 text-[color:var(--vm-color-ink-muted)]">
        {asset.description}
      </td>
    </tr>
  );
}

function LiveMetric({
  label,
  value,
  icon,
  tone = "default",
}: {
  readonly label: string;
  readonly value: number;
  readonly icon: Parameters<typeof Icon>[0]["name"];
  readonly tone?: "default" | "success" | "attention";
}) {
  const toneClass = {
    default: "text-[color:var(--vm-color-brand-blue)]",
    success: "text-[color:var(--vm-color-success)]",
    attention: "text-[color:var(--vm-color-warning)]",
  }[tone];
  return (
    <div className="flex min-h-[108px] items-center gap-4 px-5 py-4">
      <span
        className={`grid h-10 w-10 shrink-0 place-items-center rounded-[var(--vm-radius-control)] bg-[color:var(--vm-color-orientation-wash)] ${toneClass}`}
      >
        <Icon name={icon} className="h-4 w-4" />
      </span>
      <div>
        <div className={`text-2xl font-semibold ${toneClass}`}>
          {formatNumber(value)}
        </div>
        <div className="mt-1 text-xs text-[color:var(--vm-color-ink-muted)]">
          {label}
        </div>
      </div>
    </div>
  );
}

function DataPoint({
  label,
  value,
}: {
  readonly label: string;
  readonly value: string;
}) {
  return (
    <div className="min-h-[96px] px-5 py-4">
      <div className="text-lg font-semibold">{value}</div>
      <div className="mt-1 text-xs leading-5 text-[color:var(--vm-color-ink-muted)]">
        {label}
      </div>
    </div>
  );
}

function SectionHeader({
  eyebrow,
  title,
  icon,
}: {
  readonly eyebrow: string;
  readonly title: string;
  readonly icon: Parameters<typeof Icon>[0]["name"];
}) {
  return (
    <header className="flex items-center justify-between gap-4 border-b border-[color:var(--vm-color-line)] px-5 py-4">
      <div>
        <div className="text-[11px] font-bold uppercase text-[color:var(--vm-color-brand-blue)]">
          {eyebrow}
        </div>
        <h2 className="mt-1 text-base font-semibold">{title}</h2>
      </div>
      <Icon
        name={icon}
        className="h-5 w-5 shrink-0 text-[color:var(--vm-color-brand-blue)]"
      />
    </header>
  );
}

function IntelligenceLoading({ detailed }: { readonly detailed: boolean }) {
  return (
    <div
      className="space-y-4"
      aria-label="Cargando inteligencia del asesor"
      aria-busy="true"
    >
      <div className="surface-solid grid h-[108px] animate-pulse grid-cols-2 gap-px overflow-hidden bg-[color:var(--vm-color-line)] xl:grid-cols-4">
        {[0, 1, 2, 3].map((item) => (
          <div
            key={item}
            className="bg-white p-5"
          />
        ))}
      </div>
      <div
        className={`grid gap-4 ${detailed ? "xl:grid-cols-2" : ""}`}
      >
        <div className="surface-solid h-64 animate-pulse" />
        {detailed ? <div className="surface-solid h-64 animate-pulse" /> : null}
      </div>
    </div>
  );
}

const insightToneClasses = {
  INFO: "bg-[color:var(--vm-color-orientation-sky-soft)] text-[color:var(--vm-color-brand-blue)]",
  SUCCESS:
    "bg-[color:var(--vm-color-success-soft)] text-[color:var(--vm-color-success)]",
  ATTENTION:
    "bg-[color:var(--vm-color-brand-yellow-soft)] text-[color:var(--vm-color-warning)]",
} as const;

function formatNumber(value: number): string {
  return new Intl.NumberFormat("es-CO").format(value);
}

function formatPercent(value: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "percent",
    maximumFractionDigits: 1,
  }).format(value);
}

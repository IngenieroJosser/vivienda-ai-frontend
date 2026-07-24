"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Icon } from "@/components/icon";
import { ApiError } from "../../../lib/api/client";
import { getLead, type LeadDetailResponse } from "../../../lib/api/leads";
import { AdvisorIntelligence } from "../../conversation/components/advisor-intelligence";
import { getQualifiedScenarioLead } from "../../conversation/qualified-leads";
import { findSessionByLeadId } from "../../conversation/storage";
import { findProspectSessionByLeadId } from "../../prospect/storage";
import { BackendLeadDetail } from "./backend-lead-detail";

const DETAIL_TIMEOUT_MS = 5_000;

type LeadDetailState = "LOADING" | "BACKEND" | "LOCAL" | "ERROR";

export function LeadDetailClient({
  leadId,
  embedded = false,
}: {
  readonly leadId: string;
  readonly embedded?: boolean;
}) {
  const [detail, setDetail] = useState<LeadDetailResponse>();
  const [state, setState] = useState<LeadDetailState>("LOADING");
  const [errorMessage, setErrorMessage] = useState("");
  const [retryKey, setRetryKey] = useState(0);
  const [finishedRequest, setFinishedRequest] = useState("");

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), DETAIL_TIMEOUT_MS);
    const requestKey = `${leadId}:${retryKey}`;

    getLead(leadId, controller.signal)
      .then((response) => {
        if (cancelled) return;
        setDetail(response);
        setState("BACKEND");
        setErrorMessage("");
        setFinishedRequest(requestKey);
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        if (hasLocalFallback(leadId)) {
          setState("LOCAL");
          setErrorMessage(
            error instanceof ApiError && error.status !== 404
              ? "El backend no respondió. Mostramos la información local disponible."
              : "",
          );
          setFinishedRequest(requestKey);
          return;
        }

        setState("ERROR");
        setErrorMessage(
          error instanceof ApiError && error.status === 404
            ? "No encontramos este lead en el backend ni en la información local."
            : "No pudimos cargar el detalle del lead. Intenta nuevamente.",
        );
        setFinishedRequest(requestKey);
      })
      .finally(() => window.clearTimeout(timeoutId));

    return () => {
      cancelled = true;
      controller.abort();
      window.clearTimeout(timeoutId);
    };
  }, [leadId, retryKey]);

  const requestKey = `${leadId}:${retryKey}`;
  if (state === "LOADING" || finishedRequest !== requestKey) {
    return <LeadDetailLoading embedded={embedded} />;
  }

  if (state === "BACKEND" && detail) {
    return <BackendLeadDetail detail={detail} embedded={embedded} />;
  }

  if (state === "LOCAL") {
    return (
      <div className="space-y-4">
        {errorMessage ? (
          <div className="rounded-[var(--vm-radius-control)] border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
            {errorMessage}
          </div>
        ) : null}
        <AdvisorIntelligence leadId={leadId} embedded={embedded} />
      </div>
    );
  }

  return (
    <section className="surface-solid p-9 text-center" role="alert">
      <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-rose-50 text-rose-700">
        <Icon name="alert" />
      </span>
      <h2 className="mt-4 text-xl font-semibold">No pudimos cargar el detalle</h2>
      <p className="mt-2 text-sm text-[color:var(--vm-color-ink-muted)]">{errorMessage}</p>
      <button
        type="button"
        onClick={() => setRetryKey((current) => current + 1)}
        className="mt-5 min-h-11 rounded-full bg-[color:var(--vm-color-brand-blue)] px-5 text-sm font-bold text-white"
      >
        Intentar nuevamente
      </button>
      <Link
        href="/asesor/leads"
        className="mt-4 inline-flex min-h-10 items-center gap-2 text-xs font-bold text-[color:var(--vm-color-brand-blue)]"
      >
        <Icon name="arrow" className="h-4 w-4 rotate-180" />
        Volver a la bandeja
      </Link>
    </section>
  );
}

function hasLocalFallback(leadId: string): boolean {
  const canonical = getQualifiedScenarioLead(leadId);
  const scenarioSession = findSessionByLeadId(leadId);
  const prospectSession = findProspectSessionByLeadId(leadId);
  return Boolean(canonical || scenarioSession?.evaluation || prospectSession?.evaluation);
}

function LeadDetailLoading({ embedded }: { readonly embedded: boolean }) {
  return (
    <div aria-live="polite" aria-busy="true" className="space-y-4">
      <div className="h-32 animate-pulse rounded-[var(--vm-radius-card)] border border-[color:var(--vm-color-line)] bg-white" />
      <div className="h-72 animate-pulse rounded-[var(--vm-radius-card)] border border-[color:var(--vm-color-line)] bg-white" />
      <span className="sr-only">Cargando detalle del lead</span>
      {embedded ? null : <span className="sr-only">Consulta del backend en progreso</span>}
    </div>
  );
}

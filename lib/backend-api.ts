import type { EvaluationResult, ProjectMatch } from "@/features/conversation/domain";
import type { ProspectSession } from "@/features/prospect/domain";

const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1").replace(/\/$/, "");

export type BackendLeadListItem = {
  id: string;
  session_id: string;
  first_name: string | null;
  source: string;
  campaign: string;
  is_paid: boolean | null;
  status: string;
  affiliation_status: string;
  route: string | null;
  priority: "HIGH" | "MEDIUM" | "LOW" | null;
  readiness_score: number | null;
  top_project_id: string | null;
  updated_at: string;
};

export type BackendLeadDetail = {
  id: string;
  session_id: string;
  first_name: string | null;
  source: string;
  campaign: string;
  content: string;
  is_paid: boolean | null;
  status: string;
  consent_accepted_at: string | null;
  profile: Record<string, string>;
  discovery: Record<string, string>;
  turns: Array<{
    id: string;
    user_text: string;
    assistant_text: string;
    extracted_fields: string[];
    created_at: string;
  }>;
  evaluation: BackendEvaluation | null;
  enrichments: unknown[];
  audit_events: unknown[];
  created_at: string;
  updated_at: string;
};

type BackendEvaluation = {
  readiness_score: number;
  confidence_score: number;
  route: string;
  priority: "HIGH" | "MEDIUM" | "LOW";
  reason_codes?: string[];
  blockers: string[];
  next_action?: string;
  capacity: {
    monthly_income_estimate: number;
    commitment_ratio: number;
    maximum_housing_ratio: number;
    estimated_housing_payment: number;
    status: "STRONG" | "MODERATE" | "LIMITED" | "UNKNOWN";
  };
  recommendations: Array<{
    project_id: string;
    project_name: string;
    rank: number;
    score: number;
    reasons: string[];
    brochure_url?: string | null;
    tour_urls?: string[];
    model_source: string;
  }>;
  latency_ms: number;
  rule_version?: string;
  model_version?: string;
  prompt_version?: string;
};

export type SessionSyncResponse = {
  lead_id: string;
  session_id: string;
  persisted: boolean;
  evaluation: BackendEvaluation;
};

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
    cache: "no-store",
  });
  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(`Backend ${response.status}: ${detail || response.statusText}`);
  }
  return response.json() as Promise<T>;
}

export async function syncProspectSession(session: ProspectSession): Promise<SessionSyncResponse> {
  const profile = { ...session.knownProfile, ...session.answers };
  return request<SessionSyncResponse>("/leads/sync", {
    method: "POST",
    body: JSON.stringify({
      session_id: session.id,
      lead_id: session.evaluation?.leadId,
      first_name: session.firstName,
      acquisition: {
        source: session.acquisition.source,
        campaign: session.acquisition.campaign,
        content: session.acquisition.content,
        lead_reference: session.leadReference,
        is_paid: ["meta", "google", "paid", "ads"].some((value) =>
          session.acquisition.source.toLowerCase().includes(value),
        ),
      },
      status: session.status,
      consent_accepted_at: session.consentAcceptedAt,
      customer_relationship: session.customerRelationship,
      profile,
      discovery: session.discovery,
      turns: session.turns.map((turn) => ({
        id: turn.id,
        user_text: turn.userText,
        assistant_text: turn.assistantText,
        extracted_fields: turn.extractedFields,
        created_at: turn.createdAt,
      })),
      frontend_evaluation: session.evaluation ?? null,
      created_at: session.createdAt,
      updated_at: session.updatedAt,
    }),
  });
}

export async function getBackendLeads(limit = 100): Promise<BackendLeadListItem[]> {
  return request<BackendLeadListItem[]>(`/leads?limit=${limit}`);
}

export async function getBackendLead(id: string): Promise<BackendLeadDetail> {
  return request<BackendLeadDetail>(`/leads/${encodeURIComponent(id)}`);
}

export function mapBackendEvaluation(
  backend: BackendEvaluation,
  previous: EvaluationResult,
): EvaluationResult {
  const projectMatches: ProjectMatch[] = backend.recommendations.map((item) => ({
    projectId: item.project_id,
    score: item.score,
    signals: [],
    reasons: item.reasons,
    evidenceSourceIds: [],
  }));
  return {
    ...previous,
    readinessScore: backend.readiness_score,
    confidenceScore: backend.confidence_score,
    priority: backend.priority,
    route: mapRoute(backend.route),
    projectIds: projectMatches.map((item) => item.projectId),
    projectMatches,
    capacity: {
      monthlyIncomeEstimate: backend.capacity.monthly_income_estimate,
      currentCommitmentRatio: backend.capacity.commitment_ratio,
      maximumHousingRatio: backend.capacity.maximum_housing_ratio,
      estimatedHousingPayment: backend.capacity.estimated_housing_payment,
      status: backend.capacity.status,
    },
    factors: backend.reason_codes?.length ? backend.reason_codes : previous.factors,
    blockers: backend.blockers,
    nextAction: backend.next_action ?? previous.nextAction,
    commercialSummary: buildCommercialSummary(backend),
  };
}

function mapRoute(route: string): EvaluationResult["route"] {
  return ({
    READY_TO_CLOSE: "ADVISOR_NOW",
    NON_AFFILIATE_REVIEW: "NON_AFFILIATE_PRIORITY",
    FINANCIAL_PREPARATION: "NURTURE_FINANCIAL",
    NURTURE: "NURTURE_LONG_TERM",
    NEEDS_VALIDATION: "NEEDS_DATA",
    OPTED_OUT: "OPTED_OUT",
  } as Record<string, EvaluationResult["route"]>)[route] ?? "NEEDS_DATA";
}
function buildCommercialSummary(evaluation: BackendEvaluation): string {
  const route = {
    READY_TO_CLOSE: "Perfil listo para entrega comercial",
    NON_AFFILIATE_REVIEW: "Perfil sujeto a validación del cupo regulatorio 90/10",
    FINANCIAL_PREPARATION: "Perfil recomendado para preparación financiera",
    NURTURE: "Perfil recomendado para acompañamiento y reevaluación",
    NEEDS_VALIDATION: "Perfil que requiere una validación comercial breve",
    OPTED_OUT: "La persona no autorizó continuar",
  }[evaluation.route] ?? "Perfil evaluado por el backend";
  return `${route}. Preparación ${evaluation.readiness_score}/100 y confianza ${evaluation.confidence_score}/100.`;
}

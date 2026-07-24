import { apiRequest } from "./client";
import type { ProspectSession } from "../../features/prospect/domain";

export type SessionSyncRequest = {
  session_id: string;
  lead_id: string | null;
  first_name: string | null;
  acquisition: {
    source: string;
    campaign: string;
    content: string;
    lead_reference: string | null;
    is_paid: boolean | null;
  };
  status: ProspectSession["status"];
  consent_accepted_at: string | null;
  customer_relationship: ProspectSession["customerRelationship"];
  profile: Record<string, string>;
  discovery: ProspectSession["discovery"];
  turns: Array<{
    id: string;
    user_text: string;
    assistant_text: string;
    extracted_fields: string[];
    created_at: string;
  }>;
  frontend_evaluation: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
};

export type LeadRoute =
  | "READY_TO_CLOSE"
  | "NEEDS_VALIDATION"
  | "NON_AFFILIATE_REVIEW"
  | "NURTURE"
  | "FINANCIAL_PREPARATION"
  | "OPTED_OUT";

export type LeadPriority = "HIGH" | "MEDIUM" | "LOW";

export type CapacityAssessment = {
  monthly_income_estimate: number;
  commitment_ratio: number;
  maximum_housing_ratio: number;
  estimated_housing_payment: number;
  status: "STRONG" | "MODERATE" | "LIMITED" | "UNKNOWN";
};

export type ProjectRecommendation = {
  project_id: string;
  project_name: string;
  rank: number;
  score: number;
  reasons: string[];
  brochure_url: string | null;
  tour_urls: string[];
  model_source: string;
};

export type LeadEvaluationResponse = {
  lead_id: string;
  readiness_score: number;
  confidence_score: number;
  route: LeadRoute;
  priority: LeadPriority;
  reason_codes: string[];
  blockers: string[];
  next_action: string;
  capacity: CapacityAssessment;
  recommendations: ProjectRecommendation[];
  latency_ms: number;
  audit: {
    rule_version: string;
    model_version: string;
    prompt_version: string;
    evaluated_at: string;
  };
};

export type SessionSyncResponse = {
  lead_id: string;
  session_id: string;
  persisted: boolean;
  evaluation: LeadEvaluationResponse;
};

export type LeadListItem = {
  id: string;
  session_id: string;
  first_name: string | null;
  source: string;
  campaign: string;
  is_paid: boolean | null;
  status: string;
  affiliation_status: string;
  route: LeadRoute | null;
  priority: LeadPriority | null;
  readiness_score: number | null;
  top_project_id: string | null;
  updated_at: string;
};

export type LeadDetailTurn = {
  id: string;
  user_text: string;
  assistant_text: string;
  extracted_fields: string[];
  created_at: string;
};

export type LeadAuditEvent = {
  event_type: string;
  actor: string;
  payload: Record<string, unknown>;
  created_at: string;
};

export type LeadEnrichment = {
  provider: string;
  source_url: string | null;
  purpose: string;
  status: string;
  data: Record<string, unknown>;
  warnings: string[];
  created_at: string;
};

export type LeadDetailEvaluation = {
  lead_id?: string;
  readiness_score: number;
  confidence_score: number;
  route: LeadRoute;
  priority: LeadPriority;
  reason_codes: string[];
  blockers: string[];
  capacity: CapacityAssessment;
  recommendations: ProjectRecommendation[];
  next_action: string;
  latency_ms: number;
  rule_version: string;
  model_version: string;
  prompt_version: string;
  evaluated_at: string;
  input_snapshot?: Record<string, unknown>;
};

export type LeadDetailResponse = {
  id: string;
  session_id: string;
  first_name: string | null;
  source: string;
  campaign: string;
  content: string;
  is_paid: boolean | null;
  status: string;
  consent_accepted_at: string | null;
  profile: Record<string, unknown>;
  discovery: Record<string, unknown>;
  turns: LeadDetailTurn[];
  evaluation: LeadDetailEvaluation | null;
  enrichments: LeadEnrichment[];
  audit_events: LeadAuditEvent[];
  created_at: string;
  updated_at: string;
};

export function listLeads(options: {
  limit?: number;
  signal?: AbortSignal;
} = {}): Promise<LeadListItem[]> {
  const limit = options.limit ?? 100;
  return apiRequest<LeadListItem[]>(`/leads?limit=${limit}`, {
    signal: options.signal,
  });
}

export function getLead(
  id: string,
  signal?: AbortSignal,
): Promise<LeadDetailResponse> {
  return apiRequest<LeadDetailResponse>(
    `/leads/${encodeURIComponent(id)}`,
    { signal },
  );
}

export function toSessionSyncRequest(
  session: ProspectSession,
): SessionSyncRequest {
  return {
    session_id: session.id,
    lead_id: session.leadId ?? null,
    first_name: session.firstName ?? null,
    acquisition: {
      source: session.acquisition.source,
      campaign: session.acquisition.campaign,
      content: session.acquisition.content,
      lead_reference:
        session.acquisition.leadReference ?? session.leadReference ?? null,
      is_paid: session.acquisition.source === "meta",
    },
    status: session.status,
    consent_accepted_at: session.consentAcceptedAt ?? null,
    customer_relationship: session.customerRelationship,
    profile: { ...session.knownProfile, ...session.answers },
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
  };
}

export function syncProspectSession(
  session: ProspectSession,
  signal?: AbortSignal,
): Promise<SessionSyncResponse> {
  return apiRequest<SessionSyncResponse>("/leads/sync", {
    method: "POST",
    body: toSessionSyncRequest(session),
    signal,
  });
}

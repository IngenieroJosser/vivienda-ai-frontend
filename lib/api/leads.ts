import { apiRequest } from "./client";
import type { components } from "./generated";
import type { ProspectSession } from "../../features/prospect/domain";
import type {
  AgentJourney,
  AgentLeadRoute,
  AgentProjectRecommendation,
} from "./conversations";

type DeepRequired<Value> = Value extends readonly (infer Item)[]
  ? DeepRequired<Item>[]
  : Value extends object
    ? { [Key in keyof Value]-?: DeepRequired<Value[Key]> }
    : Value;

export type SessionSyncRequest = {
  session_id: string;
  session_version: number;
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
  discovery: Record<string, string>;
  turns: Array<{
    id: string;
    user_text: string;
    assistant_text: string;
    extracted_fields: string[];
    created_at: string;
  }>;
  created_at: string;
  updated_at: string;
};

export type LeadRoute = AgentLeadRoute;
export type LeadPriority = "HIGH" | "MEDIUM" | "LOW";
export type ProjectRecommendation = AgentProjectRecommendation;
export type ReadinessLevel = "HIGH" | "DEVELOPING" | "INITIAL";
export type CanonicalJourneyResponse = AgentJourney;
export type SessionSyncResponse = CanonicalJourneyResponse;

export type LeadListItem = {
  id: string;
  session_id: string;
  first_name: string | null;
  source: string;
  campaign: string;
  is_paid: boolean | null;
  status: string;
  affiliation_status: string;
  profile?: Record<string, unknown>;
  route: LeadRoute | null;
  priority: LeadPriority | null;
  readiness_level: ReadinessLevel | null;
  readiness_score?: number | null;
  confidence_score?: number | null;
  readiness_factors?: string[];
  readiness_blockers?: string[];
  estimated_amount?: number | null;
  estimated_monthly_payment?: number | null;
  top_project_id: string | null;
  conversation_state?: string | null;
  agent_mode?: string | null;
  regulatory_status?: string | null;
  nurture_primary_gap?: string | null;
  nurture_status?: string | null;
  nurture_target_amount?: number | null;
  nurture_intervention_required?: boolean;
  nurture_milestones?: Array<{
    id: string;
    label: string;
    completed: boolean;
    completed_at?: string | null;
  }>;
  handoff_requested: boolean;
  handoff_status: string | null;
  assigned_advisor_id?: string | null;
  commercial_state?: string | null;
  workflow_version?: number | null;
  next_follow_up_at?: string | null;
  sla_due_at?: string | null;
  sla_overdue?: boolean;
  next_action: string | null;
  review_date: string | null;
  qualified_at: string;
  updated_at: string;
};

export type CommercialWorkflow =
  components["schemas"]["CommercialWorkflowResponse"];
export type CommercialActivity =
  components["schemas"]["ActivityResponse"];
export type CommercialActivityOperation =
  components["schemas"]["ActivityOperationResponse"];
export type CommercialActivityInput =
  components["schemas"]["ActivityCreateRequest"];
export type CommercialWorkflowInput =
  components["schemas"]["WorkflowUpdateRequest"];

type GeneratedLeadDetailEvaluation = DeepRequired<
  components["schemas"]["InternalEvaluationDetail"]
>;

export type LeadDetailEvaluation = Omit<
  GeneratedLeadDetailEvaluation,
  "route" | "priority" | "recommendations"
> & {
  route: LeadRoute;
  priority: LeadPriority;
  readiness_score: number;
  confidence_score: number;
  recommendations: Array<{
    project_id: string;
    project_name: string;
    rank: number;
    score: number;
    reasons: string[];
    brochure_url: string | null;
    tour_urls: string[];
    model_source: string;
  }>;
};

export type ChatLeadRecord = {
  id: string;
  external_turn_id: string;
  user_message: string;
  assistant_message: string;
  conversation_state: string;
  next_action: string;
  route: string;
  agent_mode: string;
  model_name: string;
  prompt_version: string;
  input_tokens: number;
  output_tokens: number;
  latency_ms: number;
  training_eligible: boolean;
  feedback_rating: string | null;
  corrected_next_action: string | null;
  corrected_route: string | null;
  observed_outcome: string | null;
  reviewer_note: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
};

type GeneratedLeadDetailResponse = DeepRequired<
  components["schemas"]["LeadDetailResponse"]
>;

export type LeadDetailResponse = Omit<
  GeneratedLeadDetailResponse,
  "evaluation" | "journey"
> & {
  evaluation: LeadDetailEvaluation | null;
  journey: AgentJourney | null;
  chat_records: ChatLeadRecord[];
};

export function listLeads(options: {
  limit?: number;
  signal?: AbortSignal;
  assignedToMe?: boolean;
  pendingAssignment?: boolean;
  commercialState?: string;
  slaOverdue?: boolean;
  overdueFollowUp?: boolean;
  nextAction?: string;
  reevaluationDate?: string;
} = {}): Promise<LeadListItem[]> {
  const query = new URLSearchParams({
    limit: String(options.limit ?? 100),
  });
  if (options.assignedToMe) query.set("assigned_to_me", "true");
  if (options.pendingAssignment) query.set("pending_assignment", "true");
  if (options.commercialState) {
    query.set("commercial_state", options.commercialState);
  }
  if (options.slaOverdue) query.set("sla_overdue", "true");
  if (options.overdueFollowUp) query.set("overdue_follow_up", "true");
  if (options.nextAction) query.set("next_action", options.nextAction);
  if (options.reevaluationDate) {
    query.set("reevaluation_date", options.reevaluationDate);
  }
  return apiRequest<LeadListItem[]>(`/leads?${query.toString()}`, {
    signal: options.signal,
    advisorAuth: true,
  });
}

export function getLead(
  id: string,
  signal?: AbortSignal,
): Promise<LeadDetailResponse> {
  return apiRequest<LeadDetailResponse>(
    `/leads/${encodeURIComponent(id)}`,
    { signal, advisorAuth: true },
  );
}

export function toSessionSyncRequest(
  session: ProspectSession,
): SessionSyncRequest {
  return {
    session_id: session.id,
    session_version: session.syncVersion ?? 1,
    lead_id: session.leadId ?? null,
    first_name: session.firstName ?? null,
    acquisition: {
      source: session.acquisition.source,
      campaign: session.acquisition.campaign,
      content: session.acquisition.content,
      lead_reference:
        session.acquisition.leadReference ?? session.leadReference ?? null,
      is_paid: session.acquisition.source.toLowerCase() === "meta",
    },
    status: session.status,
    consent_accepted_at: session.consentAcceptedAt ?? null,
    customer_relationship: session.customerRelationship,
    profile: compactStringRecord({ ...session.knownProfile, ...session.answers }),
    discovery: compactStringRecord(session.discovery),
    turns: session.turns.map((turn) => ({
      id: turn.id,
      user_text: turn.userText,
      assistant_text: turn.assistantText,
      extracted_fields: turn.extractedFields,
      created_at: turn.createdAt,
    })),
    created_at: session.createdAt,
    updated_at: session.updatedAt,
  };
}

export function updateLeadHandoff(
  leadId: string,
  input: DeepRequired<components["schemas"]["ProspectHandoffRequest"]>,
  signal?: AbortSignal,
): Promise<CanonicalJourneyResponse> {
  return apiRequest<CanonicalJourneyResponse>(
    `/leads/${encodeURIComponent(leadId)}/handoff`,
    { method: "POST", body: input, signal },
  );
}

export function updateLeadNurture(
  leadId: string,
  input: DeepRequired<components["schemas"]["NurtureProgressRequest"]>,
  signal?: AbortSignal,
): Promise<CanonicalJourneyResponse> {
  return apiRequest<CanonicalJourneyResponse>(
    `/leads/${encodeURIComponent(leadId)}/nurture`,
    { method: "PUT", body: input, signal, advisorAuth: true },
  );
}

export function claimLead(
  leadId: string,
  signal?: AbortSignal,
): Promise<CommercialWorkflow> {
  return apiRequest<CommercialWorkflow>(
    `/leads/${encodeURIComponent(leadId)}/claim`,
    { method: "POST", signal, advisorAuth: true },
  );
}

export function updateCommercialWorkflow(
  leadId: string,
  input: CommercialWorkflowInput,
  signal?: AbortSignal,
): Promise<CommercialWorkflow> {
  return apiRequest<CommercialWorkflow>(
    `/leads/${encodeURIComponent(leadId)}/workflow`,
    { method: "PATCH", body: input, signal, advisorAuth: true },
  );
}

export function createLeadActivity(
  leadId: string,
  input: CommercialActivityInput,
  idempotencyKey: string,
  signal?: AbortSignal,
): Promise<CommercialActivityOperation> {
  return apiRequest<CommercialActivityOperation>(
    `/leads/${encodeURIComponent(leadId)}/activities`,
    {
      method: "POST",
      body: input,
      signal,
      advisorAuth: true,
      headers: { "Idempotency-Key": idempotencyKey },
    },
  );
}

export function listLeadActivities(
  leadId: string,
  signal?: AbortSignal,
): Promise<CommercialActivity[]> {
  return apiRequest<CommercialActivity[]>(
    `/leads/${encodeURIComponent(leadId)}/activities`,
    { signal, advisorAuth: true },
  );
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

function compactStringRecord(
  input: Record<string, string | undefined>,
): Record<string, string> {
  return Object.fromEntries(
    Object.entries(input).filter(
      (entry): entry is [string, string] =>
        typeof entry[1] === "string" && entry[1].trim().length > 0,
    ),
  );
}

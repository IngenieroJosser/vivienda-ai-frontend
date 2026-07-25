import { apiRequest } from "./client";
import type { components } from "./generated";
import type { ProspectSession } from "../../features/prospect/domain";

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
  discovery: ProspectSession["discovery"];
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

export type LeadRoute = components["schemas"]["LeadRoute"];

export type LeadPriority = "HIGH" | "MEDIUM" | "LOW";

export type ProjectRecommendation = DeepRequired<
  components["schemas"]["ProjectRecommendation"]
>;

export type ReadinessLevel = components["schemas"]["ReadinessLevel"];

export type CanonicalJourneyResponse = DeepRequired<
  components["schemas"]["SessionSyncResponse"]
>;

export type SessionSyncResponse = CanonicalJourneyResponse;

type GeneratedLeadListItem = DeepRequired<
  components["schemas"]["LeadListItem"]
>;

export type LeadListItem = Omit<
  GeneratedLeadListItem,
  "route" | "priority" | "handoff_status"
> & {
  route: LeadRoute | null;
  priority: LeadPriority | null;
  handoff_status: CanonicalJourneyResponse["handoff"]["status"] | null;
};

export type LeadDetailEvaluation = DeepRequired<
  components["schemas"]["InternalEvaluationDetail"]
>;

export type LeadDetailResponse = DeepRequired<
  components["schemas"]["LeadDetailResponse"]
>;

export type CommercialWorkflow =
  components["schemas"]["CommercialWorkflowResponse"];
export type WorkflowUpdate =
  components["schemas"]["WorkflowUpdateRequest"];
export type ActivityCreate =
  components["schemas"]["ActivityCreateRequest"];
export type ActivityOperation =
  components["schemas"]["ActivityOperationResponse"];
export type CommercialActivity =
  components["schemas"]["ActivityResponse"];
export type CommercialState = components["schemas"]["CommercialState"];

export type LeadListOptions = {
  limit?: number;
  assignedToMe?: boolean;
  pendingAssignment?: boolean;
  commercialState?: CommercialState;
  slaOverdue?: boolean;
  overdueFollowUp?: boolean;
  nextAction?: string;
  reevaluationDate?: string;
  signal?: AbortSignal;
};

export function listLeads(options: LeadListOptions = {}): Promise<LeadListItem[]> {
  const query = new URLSearchParams({ limit: String(options.limit ?? 100) });
  appendBoolean(query, "assigned_to_me", options.assignedToMe);
  appendBoolean(query, "pending_assignment", options.pendingAssignment);
  appendValue(query, "commercial_state", options.commercialState);
  appendBoolean(query, "sla_overdue", options.slaOverdue);
  appendBoolean(query, "overdue_follow_up", options.overdueFollowUp);
  appendValue(query, "next_action", options.nextAction);
  appendValue(query, "reevaluation_date", options.reevaluationDate);

  return apiRequest<LeadListItem[]>(`/leads?${query.toString()}`, {
    signal: options.signal,
    advisorAuth: true,
  });
}

function appendBoolean(
  query: URLSearchParams,
  key: string,
  value: boolean | undefined,
): void {
  if (value !== undefined) query.set(key, String(value));
}

function appendValue(
  query: URLSearchParams,
  key: string,
  value: string | undefined,
): void {
  if (value) query.set(key, value);
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
    created_at: session.createdAt,
    updated_at: session.updatedAt,
  };
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

export function updateWorkflow(
  leadId: string,
  input: WorkflowUpdate,
  signal?: AbortSignal,
): Promise<CommercialWorkflow> {
  return apiRequest<CommercialWorkflow>(
    `/leads/${encodeURIComponent(leadId)}/workflow`,
    { method: "PATCH", body: input, signal, advisorAuth: true },
  );
}

export function createActivity(
  leadId: string,
  input: ActivityCreate,
  idempotencyKey: string,
  signal?: AbortSignal,
): Promise<ActivityOperation> {
  return apiRequest<ActivityOperation>(
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

export function listActivities(
  leadId: string,
  signal?: AbortSignal,
): Promise<CommercialActivity[]> {
  return apiRequest<CommercialActivity[]>(
    `/leads/${encodeURIComponent(leadId)}/activities`,
    { signal, advisorAuth: true },
  );
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

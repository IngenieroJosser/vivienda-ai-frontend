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

export function listLeads(options: {
  limit?: number;
  signal?: AbortSignal;
} = {}): Promise<LeadListItem[]> {
  const limit = options.limit ?? 100;
  return apiRequest<LeadListItem[]>(`/leads?limit=${limit}`, {
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

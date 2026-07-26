import { apiRequest } from "./client";

export type AgentMode = "OPENAI_AGENTS" | "DETERMINISTIC_FALLBACK";
export type AgentLeadRoute =
  | "READY_TO_CLOSE"
  | "NEEDS_VALIDATION"
  | "NON_AFFILIATE_REVIEW"
  | "REGULATORY_WAITLIST"
  | "NURTURE"
  | "FINANCIAL_PREPARATION"
  | "OPTED_OUT";

export type AgentProjectRecommendation = {
  project_id: string;
  project_name: string;
  rank: number;
  reasons: string[];
  brochure_url: string | null;
  tour_urls: string[];
  purpose: "MATCH" | "REFERENCE";
  price_from_cop?: number | null;
  price_reference_cop?: number | null;
  price_to_cop?: number | null;
  price_reference_source?: string | null;
  budget_status?: "WITHIN_RANGE" | "REFERENCE_ONLY" | "UNKNOWN";
};

export type AgentJourney = {
  lead_id: string;
  session_id: string;
  session_version: number;
  persisted: boolean;
  readiness: {
    level: "HIGH" | "DEVELOPING" | "INITIAL";
    factors: string[];
    blockers: string[];
    missing_fields: string[];
  };
  route: AgentLeadRoute;
  capacity: {
    estimated_amount: number | null;
    estimated_monthly_payment: number | null;
    disclaimer: string;
  };
  nurture_plan: null | {
    primary_gap: string | null;
    target_amount: number | null;
    review_date: string | null;
    status: string;
    intervention_required: boolean;
    milestones: Array<{
      id: string;
      label: string;
      completed: boolean;
      completed_at: string | null;
    }>;
  };
  recommendations: AgentProjectRecommendation[];
  regulatory?: null | {
    mode: string;
    status: "AVAILABLE" | "NEAR_LIMIT" | "LIMIT_REACHED" | string;
    affiliate_sales: number;
    non_affiliate_sales: number;
    total_sales: number;
    non_affiliate_share: number;
    non_affiliate_limit: number;
    available_non_affiliate_slots: number;
    can_continue: boolean;
    period: string;
  };
  handoff: {
    requested: boolean;
    status: string;
    channel: string | null;
    time_preference: string | null;
    requested_at: string | null;
    project_ids: string[];
    next_action: string;
  };
  evaluated_at: string;
};

export type AgentConversationResponse = {
  lead_id: string;
  session_id: string;
  external_turn_id: string | null;
  assistant_message: string;
  conversation_state: string;
  next_action: string;
  quick_replies: string[];
  extracted_fields: string[];
  profile: Record<string, string>;
  discovery: Record<string, string>;
  journey: AgentJourney;
  readiness_score: number;
  confidence_score: number;
  priority: "HIGH" | "MEDIUM" | "LOW";
  agent_mode: AgentMode;
  agent_usage: {
    requests: number;
    input_tokens: number;
    output_tokens: number;
    total_tokens: number;
    latency_ms: number;
  };
  regulatory: NonNullable<AgentJourney["regulatory"]>;
  continue_conversation: boolean;
  completed: boolean;
  training_record_id: string | null;
  prompt_version: string;
  model_name: string;
  generated_at: string;
  prospect_access_token: string | null;
};

export type StartAgentConversationInput = {
  session_id: string;
  external_lead_id?: string;
  first_name?: string;
  acquisition: {
    source: string;
    campaign: string;
    content: string;
    lead_reference?: string;
    is_paid?: boolean;
  };
  customer_relationship: string;
  consent_accepted_at: string;
  known_profile: Record<string, string>;
  known_discovery: Record<string, string>;
  created_at: string;
};

export function startAgentConversation(
  input: StartAgentConversationInput,
  signal?: AbortSignal,
): Promise<AgentConversationResponse> {
  return apiRequest<AgentConversationResponse>("/conversations", {
    method: "POST",
    body: input,
    signal,
  });
}

export function sendAgentConversationMessage(
  sessionId: string,
  input: { external_turn_id: string; message: string; created_at: string },
  accessToken: string,
  signal?: AbortSignal,
): Promise<AgentConversationResponse> {
  return apiRequest<AgentConversationResponse>(
    `/conversations/${encodeURIComponent(sessionId)}/messages`,
    {
      method: "POST",
      body: input,
      signal,
      headers: { Authorization: `Bearer ${accessToken}` },
    },
  );
}

export function getAgentConversation(
  sessionId: string,
  accessToken: string,
  signal?: AbortSignal,
): Promise<AgentConversationResponse> {
  return apiRequest<AgentConversationResponse>(
    `/conversations/${encodeURIComponent(sessionId)}`,
    {
      signal,
      headers: { Authorization: `Bearer ${accessToken}` },
    },
  );
}

export function declineAgentConversation(
  sessionId: string,
  createdAt: string,
  accessToken: string,
  signal?: AbortSignal,
): Promise<AgentConversationResponse> {
  return apiRequest<AgentConversationResponse>(
    `/conversations/${encodeURIComponent(sessionId)}/decline`,
    {
      method: "POST",
      body: { created_at: createdAt },
      signal,
      headers: { Authorization: `Bearer ${accessToken}` },
    },
  );
}

export function reviewChatRecord(
  recordId: string,
  input: {
    rating: "POSITIVE" | "NEGATIVE" | "NEUTRAL";
    corrected_next_action?: string;
    corrected_route?: string;
    outcome?: string;
    note?: string;
    training_eligible: boolean;
    reviewed_at: string;
  },
): Promise<{ id: string; reviewed: boolean; training_eligible: boolean }> {
  return apiRequest(`/conversations/chat-records/${encodeURIComponent(recordId)}/feedback`, {
    method: "POST",
    body: input,
    advisorAuth: true,
  });
}

export function getChatTrainingSummary(): Promise<{
  total_records: number;
  eligible_records: number;
  positive_records: number;
  negative_records: number;
  labeled_outcomes: number;
  exported_path: string | null;
  generated_at: string;
}> {
  return apiRequest("/conversations/chat-training/summary", {
    advisorAuth: true,
  });
}

export function exportChatTraining(): Promise<{
  total_records: number;
  eligible_records: number;
  positive_records: number;
  negative_records: number;
  labeled_outcomes: number;
  exported_path: string | null;
  generated_at: string;
}> {
  return apiRequest("/conversations/chat-training/export", {
    method: "POST",
    advisorAuth: true,
  });
}

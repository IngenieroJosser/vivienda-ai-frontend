import type { EvaluationResult, ProfileAnswers, ProfileField } from "../conversation/domain";

export type AcquisitionContext = {
  source: string;
  campaign: string;
  content: string;
  leadReference?: string;
};

export type CampaignExperience = {
  id: "versalles" | "cuota" | "general";
  eyebrow: string;
  title: string;
  description: string;
  promise: string;
  assistantIntro: string;
  projectId?: string;
  knownSignals: ProfileAnswers;
};

export type ProspectStatus = "CONSENT" | "ACTIVE" | "COMPLETED" | "DECLINED";

export type ConversationAction =
  | "OPEN_DISCOVERY"
  | "DISCOVER_MOTIVATION"
  | "DISCOVER_OBSTACLE"
  | "DISCOVER_ADVANCE_NEED"
  | ProfileField
  | "COMPLETE";

export type DiscoveryContext = {
  housingVision?: string;
  intendedFor?: string;
  motivation?: string;
  obstacle?: string;
  advanceNeed?: string;
};

export type ConversationTurn = {
  id: string;
  userText: string;
  assistantText: string;
  extractedFields: ProfileField[];
  createdAt: string;
};

export type ProspectSession = {
  version: 4;
  id: string;
  firstName?: string;
  acquisition: AcquisitionContext;
  campaignId: CampaignExperience["id"];
  leadReference: string;
  knownProfile: ProfileAnswers;
  knownBenefits: string[];
  knownEngagementSignals: string[];
  status: ProspectStatus;
  nextAction: ConversationAction;
  turns: ConversationTurn[];
  answers: ProfileAnswers;
  discovery: DiscoveryContext;
  consentAcceptedAt?: string;
  evaluation?: EvaluationResult;
  createdAt: string;
  updatedAt: string;
};

export type FunnelEventName =
  | "PAID_ARRIVAL"
  | "CONVERSATION_STARTED"
  | "CONSENT_ACCEPTED"
  | "CONSENT_DECLINED"
  | "QUESTION_ABANDONED"
  | "PROFILING_COMPLETED"
  | "RESULT_VIEWED"
  | "NEXT_ACTION_CLICKED";

export type FunnelEvent = {
  name: FunnelEventName;
  sessionId?: string;
  campaign: string;
  source: string;
  content: string;
  questionId?: string;
  occurredAt: string;
};

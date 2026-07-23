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

export type ProspectSession = {
  version: 1;
  id: string;
  firstName: string;
  acquisition: AcquisitionContext;
  campaignId: CampaignExperience["id"];
  leadReference: string;
  status: ProspectStatus;
  questionIds: ProfileField[];
  currentQuestionIndex: number;
  answers: ProfileAnswers;
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

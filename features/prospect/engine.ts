import type { ProfileAnswers, Scenario } from "../conversation/domain";
import { evaluateProfile } from "../conversation/engine";
import type { CampaignExperience, ProspectSession } from "./domain";

const PUBLIC_QUESTION_IDS = [
  "affiliation",
  "horizon",
  "incomeRange",
  "obligations",
  "savings",
] as const;

export function createProspectSession(input: {
  id: string;
  firstName: string;
  acquisition: ProspectSession["acquisition"];
  campaign: CampaignExperience;
  timestamp: string;
}): ProspectSession {
  return {
    version: 1,
    id: input.id,
    firstName: input.firstName,
    acquisition: input.acquisition,
    campaignId: input.campaign.id,
    leadReference: input.acquisition.leadReference ?? `vm_local_${input.id}`,
    status: "CONSENT",
    questionIds: [...PUBLIC_QUESTION_IDS],
    currentQuestionIndex: 0,
    answers: {},
    createdAt: input.timestamp,
    updatedAt: input.timestamp,
  };
}

export function acceptProspectConsent(
  session: ProspectSession,
  timestamp: string,
): ProspectSession {
  return { ...session, status: "ACTIVE", updatedAt: timestamp };
}

export function declineProspectConsent(
  session: ProspectSession,
  campaign: CampaignExperience,
  timestamp: string,
): ProspectSession {
  return {
    ...session,
    status: "DECLINED",
    evaluation: evaluateProfile(buildPublicScenario(session, campaign), "DECLINED", {}),
    updatedAt: timestamp,
  };
}

export function answerProspectQuestion(
  session: ProspectSession,
  campaign: CampaignExperience,
  value: string,
  timestamp: string,
): ProspectSession {
  if (session.status !== "ACTIVE") return session;
  const field = session.questionIds[session.currentQuestionIndex];
  if (!field) return session;

  const answers: ProfileAnswers = { ...session.answers, [field]: value };
  const completed = session.currentQuestionIndex === session.questionIds.length - 1;

  return {
    ...session,
    answers,
    currentQuestionIndex: completed ? session.currentQuestionIndex : session.currentQuestionIndex + 1,
    status: completed ? "COMPLETED" : "ACTIVE",
    ...(completed
      ? { evaluation: evaluateProfile(buildPublicScenario(session, campaign), "USE_KNOWN_DATA", answers) }
      : {}),
    updatedAt: timestamp,
  };
}

export function buildPublicScenario(
  session: ProspectSession,
  campaign: CampaignExperience,
): Scenario {
  return {
    id: `public-${session.id}`,
    leadId: `lead-${session.leadReference}`,
    displayName: session.firstName,
    leadSource: "META",
    capturedAt: session.createdAt,
    routeLabel: "Orientación pública",
    description: "Prospecto proveniente de una campaña digital.",
    knownProfile: campaign.knownSignals,
    knownBenefits: [],
    engagementSignals: [
      `Llegó desde ${session.acquisition.source}`,
      `Campaña ${session.acquisition.campaign}`,
      `Contenido ${session.acquisition.content}`,
    ],
    requiredFields: [...PUBLIC_QUESTION_IDS],
  };
}

export function getCapacityRange(estimatedPayment: number): {
  minimum: number;
  maximum: number;
} | undefined {
  if (estimatedPayment <= 0) return undefined;
  const round = (value: number) => Math.round(value / 50_000) * 50_000;
  return {
    minimum: round(estimatedPayment * 0.85),
    maximum: round(estimatedPayment * 1.15),
  };
}

export const MAX_PUBLIC_DECISIONS = 6;

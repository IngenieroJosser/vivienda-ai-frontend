import type { ProfileAnswers, Scenario } from "../conversation/domain";
import { evaluateProfile } from "../conversation/engine";
import { resolveKnownProspect } from "./campaigns";
import type { CampaignExperience, ProspectSession } from "./domain";

const PUBLIC_QUESTION_IDS = [
  "affiliation",
  "mainConcern",
  "location",
  "horizon",
  "householdSize",
  "incomeRange",
  "obligations",
  "savings",
] as const;

export function createProspectSession(input: {
  id: string;
  acquisition: ProspectSession["acquisition"];
  campaign: CampaignExperience;
  timestamp: string;
}): ProspectSession {
  const knownProspect = resolveKnownProspect(input.acquisition.leadReference);
  const knownProfile = {
    ...input.campaign.knownSignals,
    ...knownProspect?.profile,
  };

  return {
    version: 2,
    id: input.id,
    ...(knownProspect?.firstName ? { firstName: knownProspect.firstName } : {}),
    acquisition: input.acquisition,
    campaignId: input.campaign.id,
    leadReference: input.acquisition.leadReference ?? `vm_local_${input.id}`,
    knownProfile,
    status: "CONSENT",
    questionIds: selectPublicQuestions(knownProfile),
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
  timestamp: string,
): ProspectSession {
  return {
    ...session,
    status: "DECLINED",
    evaluation: evaluateProfile(buildPublicScenario(session), "DECLINED", {}),
    updatedAt: timestamp,
  };
}

export function answerProspectQuestion(
  session: ProspectSession,
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
      ? { evaluation: evaluateProfile(buildPublicScenario(session), "USE_KNOWN_DATA", answers) }
      : {}),
    updatedAt: timestamp,
  };
}

export function buildPublicScenario(
  session: ProspectSession,
): Scenario {
  return {
    id: `public-${session.id}`,
    leadId: `lead-${session.leadReference}`,
    displayName: session.firstName ?? "Prospecto",
    leadSource: "META",
    capturedAt: session.createdAt,
    routeLabel: "Orientación pública",
    description: "Prospecto proveniente de una campaña digital.",
    knownProfile: session.knownProfile,
    knownBenefits: [],
    engagementSignals: [
      `Llegó desde ${session.acquisition.source}`,
      `Campaña ${session.acquisition.campaign}`,
      `Contenido ${session.acquisition.content}`,
    ],
    requiredFields: [...PUBLIC_QUESTION_IDS],
  };
}

export function selectPublicQuestions(knownProfile: ProfileAnswers): ProspectSession["questionIds"] {
  return PUBLIC_QUESTION_IDS.filter((field) => !knownProfile[field]);
}

export function getCapacityRange(estimatedPayment: number): {
  minimum: number;
  maximum: number;
} | undefined {
  if (estimatedPayment <= 0) return undefined;
  const round = (value: number) => Math.round(value / 50_000) * 50_000;
  return {
    minimum: round(estimatedPayment * 0.85),
    maximum: round(estimatedPayment),
  };
}

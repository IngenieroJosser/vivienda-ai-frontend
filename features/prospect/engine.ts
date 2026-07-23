import type { ProfileAnswers, ProfileField, Scenario } from "../conversation/domain";
import { evaluateProfile } from "../conversation/engine";
import { campaignExperiences, resolveKnownProspect } from "./campaigns";
import {
  buildContextualResponse,
  selectNextBestAction,
} from "./conversation-policy";
import type { CampaignExperience, ProspectSession } from "./domain";
import { extractProspectSignals } from "./signal-extractor";

const PUBLIC_PROFILE_FIELDS: ProfileField[] = [
  "affiliation",
  "mainConcern",
  "location",
  "horizon",
  "householdSize",
  "incomeRange",
  "obligations",
  "savings",
];

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
    version: 5,
    id: input.id,
    ...(knownProspect?.firstName ? { firstName: knownProspect.firstName } : {}),
    acquisition: input.acquisition,
    campaignId: input.campaign.id,
    leadReference: input.acquisition.leadReference ?? `vm_local_${input.id}`,
    knownProfile,
    knownBenefits: knownProspect?.knownBenefits ?? [],
    knownEngagementSignals: knownProspect?.engagementSignals ?? [],
    status: "CONSENT",
    nextAction: "OPEN_DISCOVERY",
    turns: [],
    answers: {},
    discovery: {},
    createdAt: input.timestamp,
    updatedAt: input.timestamp,
  };
}

export function acceptProspectConsent(
  session: ProspectSession,
  timestamp: string,
): ProspectSession {
  return {
    ...session,
    status: "ACTIVE",
    consentAcceptedAt: timestamp,
    updatedAt: timestamp,
  };
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

export function answerProspectMessage(
  session: ProspectSession,
  rawMessage: string,
  timestamp: string,
): ProspectSession {
  if (session.status !== "ACTIVE") return session;
  const userText = rawMessage.trim().replace(/\s+/g, " ").slice(0, 600);
  if (!userText) return session;

  const extraction = extractProspectSignals(userText, session.nextAction);
  const answers: ProfileAnswers = { ...session.answers, ...extraction.profile };
  const discovery = { ...session.discovery, ...extraction.discovery };
  const profile = { ...session.knownProfile, ...answers };
  const messageSequence = session.turns.length + 1;
  const selectedAction = selectNextBestAction(profile, discovery);
  const completed = selectedAction === "COMPLETE";
  const draft: ProspectSession = {
    ...session,
    answers,
    discovery,
    nextAction: completed ? "COMPLETE" : selectedAction,
    status: completed ? "COMPLETED" : "ACTIVE",
    updatedAt: timestamp,
  };
  const evaluation = evaluateProfile(buildPublicScenario(draft), "USE_KNOWN_DATA", answers);
  const assistantText = buildContextualResponse({
    extraction,
    nextAction: draft.nextAction,
    profile,
    estimatedHousingPayment: evaluation.capacity.estimatedHousingPayment,
  });

  return {
    ...draft,
    turns: [
      ...session.turns,
      {
        id: `${session.id}-message-${messageSequence}`,
        userText,
        assistantText,
        extractedFields: extraction.fields,
        createdAt: timestamp,
      },
    ],
    ...(completed ? { evaluation } : {}),
  };
}

export function buildPublicScenario(session: ProspectSession): Scenario {
  const campaignProjectId = campaignExperiences[session.campaignId].projectId;
  return {
    id: `public-${session.id}`,
    leadId: `lead-${session.leadReference}`,
    displayName: session.firstName ?? "Prospecto",
    leadSource: session.acquisition.source === "meta" ? "META" : "ORGANIC",
    capturedAt: session.createdAt,
    routeLabel: "Orientación pública",
    description: "Prospecto proveniente de una campaña digital.",
    knownProfile: session.knownProfile,
    knownBenefits: session.knownBenefits,
    engagementSignals: [
      ...session.knownEngagementSignals,
      `Llegó desde ${session.acquisition.source}`,
      `Campaña ${session.acquisition.campaign}`,
      `Contenido ${session.acquisition.content}`,
    ],
    ...(campaignProjectId ? { campaignProjectId } : {}),
    requiredFields: PUBLIC_PROFILE_FIELDS,
  };
}

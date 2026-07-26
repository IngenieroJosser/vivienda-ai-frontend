import type { ProfileAnswers, ProfileField, Scenario } from "../conversation/domain";
import { evaluateProfile } from "../conversation/engine";
import { campaignExperiences, resolveKnownProspect } from "./campaigns";
import {
  buildContextualResponse,
  selectNextBestAction,
} from "./conversation-policy";
import type { CampaignExperience, ProspectSession } from "./domain";
import {
  buildServiceGuidance,
  detectPreviousBuyerIntent,
  getPreviousBuyerIntentPrompt,
} from "./customer-journey";
import type { ProspectContactRequest } from "./handoff";
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
    version: 6,
    id: input.id,
    ...(knownProspect?.firstName ? { firstName: knownProspect.firstName } : {}),
    acquisition: input.acquisition,
    campaignId: input.campaign.id,
    leadReference: input.acquisition.leadReference ?? `vm_local_${input.id}`,
    knownProfile,
    knownBenefits: knownProspect?.knownBenefits ?? [],
    knownEngagementSignals: knownProspect?.engagementSignals ?? [],
    customerRelationship:
      knownProspect?.customerRelationship ??
      relationshipFromKnownProfile(knownProfile),
    ...(knownProspect?.knownHousing
      ? { knownHousing: knownProspect.knownHousing }
      : {}),
    status: "CONSENT",
    nextAction:
      knownProspect?.customerRelationship === "PREVIOUS_BUYER"
        ? "DISCOVER_PREVIOUS_BUYER_INTENT"
        : "OPEN_DISCOVERY",
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
  const userText = rawMessage
    .trim()
    .replace(/[^\S\r\n]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .slice(0, 600);
  if (!userText) return session;

  if (session.nextAction === "DISCOVER_PREVIOUS_BUYER_INTENT") {
    return answerPreviousBuyerIntent(session, userText, timestamp);
  }

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

export function buildPublicScenario(
  session: ProspectSession,
  contactRequest?: ProspectContactRequest,
): Scenario {
  const campaignProjectId = campaignExperiences[session.campaignId].projectId;
  return {
    id: `public-${session.id}`,
    leadId: `lead-${session.leadReference}`,
    displayName: session.answers.fullName ?? session.firstName ?? "Prospecto",
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
      ...(session.customerRelationship === "PREVIOUS_BUYER"
        ? ["Comprador anterior reconocido con datos locales simulados"]
        : []),
      ...(session.knownHousing
        ? [
            `Compra anterior: ${session.knownHousing.projectName}, ${session.knownHousing.purchaseYear}`,
          ]
        : []),
      ...(contactRequest
        ? [
            `Solicitó contacto por ${contactChannelForAdvisor(contactRequest.channel)}`,
            `Prefiere contacto ${contactTimeForAdvisor(contactRequest.timePreference)}`,
          ]
        : []),
    ],
    ...(campaignProjectId ? { campaignProjectId } : {}),
    requiredFields: PUBLIC_PROFILE_FIELDS,
  };
}

function answerPreviousBuyerIntent(
  session: ProspectSession,
  userText: string,
  timestamp: string,
): ProspectSession {
  const intent = detectPreviousBuyerIntent(userText);
  const messageSequence = session.turns.length + 1;

  if (!intent) {
    return {
      ...session,
      updatedAt: timestamp,
      turns: [
        ...session.turns,
        {
          id: `${session.id}-message-${messageSequence}`,
          userText,
          assistantText: `Quiero dirigir tu solicitud al lugar correcto. ${getPreviousBuyerIntentPrompt()}`,
          extractedFields: [],
          createdAt: timestamp,
        },
      ],
    };
  }

  if (intent === "BUY_AGAIN") {
    return answerProspectMessage(
      {
        ...session,
        previousBuyerIntent: intent,
        nextAction: "OPEN_DISCOVERY",
        updatedAt: timestamp,
      },
      userText,
      timestamp,
    );
  }

  return {
    ...session,
    previousBuyerIntent: intent,
    serviceGuidance: buildServiceGuidance({
      intent,
      knownHousing: session.knownHousing,
      knownBenefits: session.knownBenefits,
    }),
    nextAction: "COMPLETE",
    status: "COMPLETED",
    updatedAt: timestamp,
    turns: [
      ...session.turns,
      {
        id: `${session.id}-message-${messageSequence}`,
        userText,
        assistantText:
          "Entendido. No necesitas repetir un perfilamiento de compra. Ya organicé una ruta específica usando la información que conocemos de tu vivienda anterior.",
        extractedFields: [],
        createdAt: timestamp,
      },
    ],
  };
}

function relationshipFromKnownProfile(
  profile: ProfileAnswers,
): ProspectSession["customerRelationship"] {
  if (profile.affiliation === "AFFILIATE") return "AFFILIATE";
  if (profile.affiliation === "NON_AFFILIATE") return "NON_AFFILIATE";
  return "UNKNOWN";
}

function contactChannelForAdvisor(
  channel: ProspectContactRequest["channel"],
): string {
  return {
    WHATSAPP: "WhatsApp",
    PHONE: "llamada",
    EMAIL: "correo electrónico",
  }[channel];
}

function contactTimeForAdvisor(
  preference: ProspectContactRequest["timePreference"],
): string {
  return {
    WEEKDAY_MORNING: "entre semana en la mañana",
    WEEKDAY_AFTERNOON: "entre semana en la tarde",
    SATURDAY: "el sábado",
    ANY: "en cualquier horario",
  }[preference];
}

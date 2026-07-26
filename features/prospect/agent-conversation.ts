import type {
  AgentConversationResponse,
  AgentLeadRoute,
} from "@/lib/api/conversations";
import type {
  EvaluationResult,
  EvaluationRoute,
  ProfileAnswers,
  ProfileField,
  ProjectMatch,
} from "../conversation/domain";
import type {
  ConversationAction,
  DiscoveryContext,
  ProspectSession,
} from "./domain";

const profileFields = new Set<ProfileField>([
  "affiliation",
  "dreamGoal",
  "mainConcern",
  "location",
  "horizon",
  "householdSize",
  "incomeRange",
  "obligations",
  "savings",
  "subsidyInterest",
  "visitIntent",
  "homeOwnership",
  "creditStatus",
  "monthlySavingsGoal",
  "debtReductionPlan",
  "followUpPreference",
  "preferredChannel",
  "fullName",
  "phone",
  "email",
  "contactTimePreference",
  "contactConsent",
]);

const routeMap: Record<AgentLeadRoute, EvaluationRoute> = {
  READY_TO_CLOSE: "ADVISOR_NOW",
  NON_AFFILIATE_REVIEW: "NON_AFFILIATE_PRIORITY",
  REGULATORY_WAITLIST: "NURTURE_LONG_TERM",
  FINANCIAL_PREPARATION: "NURTURE_FINANCIAL",
  NURTURE: "NURTURE_LONG_TERM",
  NEEDS_VALIDATION: "NEEDS_DATA",
  OPTED_OUT: "OPTED_OUT",
};

export function applyAgentStart(
  session: ProspectSession,
  response: AgentConversationResponse,
): ProspectSession {
  const profile = toProfileAnswers(response.profile);
  return {
    ...session,
    leadId: response.lead_id,
    firstName: profile.fullName ?? session.firstName,
    answers: profile,
    discovery: toDiscovery(response.discovery),
    nextAction: toConversationAction(response.next_action),
    authoritativeJourney: response.journey,
    agentMode: response.agent_mode,
    conversationState: response.conversation_state,
    quickReplies: response.quick_replies,
    agentWelcomeMessage: response.assistant_message,
    syncStatus: "SYNCED",
    syncVersion: response.journey.session_version,
    updatedAt: response.generated_at,
  };
}

export function applyAgentSnapshot(
  session: ProspectSession,
  response: AgentConversationResponse,
): ProspectSession {
  const synchronized = applyAgentStart(session, response);
  return {
    ...synchronized,
    status: response.completed
      ? "COMPLETED"
      : session.status === "DECLINED"
        ? "DECLINED"
        : "ACTIVE",
    turns: session.turns,
    agentWelcomeMessage: session.agentWelcomeMessage,
    evaluation: response.completed
      ? mapAgentResponseToEvaluation(response, session)
      : session.evaluation,
  };
}

export function applyAgentMessage(
  session: ProspectSession,
  input: {
    userText: string;
    turnId: string;
    createdAt: string;
    response: AgentConversationResponse;
  },
): ProspectSession {
  const evaluation = mapAgentResponseToEvaluation(input.response, session);
  const profile = toProfileAnswers(input.response.profile);
  return {
    ...session,
    leadId: input.response.lead_id,
    firstName: profile.fullName ?? session.firstName,
    answers: profile,
    discovery: toDiscovery(input.response.discovery),
    nextAction: toConversationAction(input.response.next_action),
    status: input.response.completed ? "COMPLETED" : "ACTIVE",
    turns: [
      ...session.turns,
      {
        id: input.turnId,
        userText: input.userText,
        assistantText: input.response.assistant_message,
        extractedFields: input.response.extracted_fields.filter(
          (field): field is ProfileField => profileFields.has(field as ProfileField),
        ),
        createdAt: input.createdAt,
      },
    ],
    evaluation,
    authoritativeJourney: input.response.journey,
    agentMode: input.response.agent_mode,
    conversationState: input.response.conversation_state,
    quickReplies: input.response.quick_replies,
    lastTrainingRecordId: input.response.training_record_id ?? undefined,
    syncStatus: "SYNCED",
    syncVersion: input.response.journey.session_version,
    updatedAt: input.response.generated_at,
  };
}

export function mapAgentResponseToEvaluation(
  response: AgentConversationResponse,
  session: ProspectSession,
): EvaluationResult {
  const profile = toProfileAnswers(response.profile);
  const route = routeMap[response.journey.route];
  const projectMatches: ProjectMatch[] = response.journey.recommendations.map(
    (item, index) => ({
      projectId: item.project_id,
      score: Math.max(55, 94 - index * 10),
      signals: [
        ...(item.budget_status === "WITHIN_RANGE" ? (["CAPACITY"] as const) : []),
        ...((profile.location ? ["LOCATION"] : []) as ProjectMatch["signals"]),
      ],
      reasons: item.reasons,
      evidenceSourceIds: [
        item.price_reference_source ?? "PROJECT_CATALOG",
      ],
    }),
  );
  const monthlyIncomeEstimate = {
    LOW: 2_400_000,
    MID: 5_200_000,
    HIGH: 9_000_000,
  }[profile.incomeRange ?? ""] ?? 0;
  const payment = response.journey.capacity.estimated_monthly_payment ?? 0;
  const ratio = monthlyIncomeEstimate ? payment / monthlyIncomeEstimate : 0;
  const potentialBenefits = [
    ...(profile.subsidyInterest === "YES"
      ? ["Beneficios y subsidios potenciales sujetos a validación"]
      : []),
    ...(profile.affiliation === "AFFILIATE"
      ? ["Beneficios de caja por validar según condiciones vigentes"]
      : []),
  ];
  return {
    leadId: (response.lead_id || `lead-${session.leadReference}`) as EvaluationResult["leadId"],
    readinessScore: response.readiness_score,
    confidenceScore: response.confidence_score,
    priority: response.priority,
    route,
    projectIds: response.journey.recommendations.map((item) => item.project_id),
    projectMatches,
    capacity: {
      monthlyIncomeEstimate,
      currentCommitmentRatio: Math.max(0, 0.4 - ratio),
      maximumHousingRatio: ratio,
      estimatedHousingPayment: payment,
      status:
        ratio >= 0.25
          ? "STRONG"
          : ratio >= 0.12
            ? "MODERATE"
            : monthlyIncomeEstimate
              ? "LIMITED"
              : "UNKNOWN",
    },
    benefitSignals: {
      confirmed: [],
      potential: potentialBenefits,
    },
    profileSnapshot: profile,
    knownDataUsed: Object.keys(profile).filter(
      (field): field is ProfileField => profileFields.has(field as ProfileField),
    ),
    factors: response.journey.readiness.factors,
    blockers: response.journey.readiness.blockers,
    commercialSummary: commercialSummary(response),
    nextAction: response.journey.handoff.next_action,
    followUpAt: response.journey.nurture_plan?.review_date ?? null,
    advanceCondition:
      response.journey.nurture_plan?.primary_gap ??
      "Validar la información declarada y el proyecto recomendado.",
  };
}

function commercialSummary(response: AgentConversationResponse): string {
  if (response.journey.route === "READY_TO_CLOSE") {
    return "Perfil listo para un contacto enfocado en validación final, proyecto y agendamiento de visita.";
  }
  if (response.journey.route === "NON_AFFILIATE_REVIEW") {
    return "Perfil con preparación comercial sujeto a validación de disponibilidad para no afiliados.";
  }
  if (response.journey.route === "REGULATORY_WAITLIST") {
    return "Perfil con potencial conservado en acompañamiento mientras se reevalúa la disponibilidad comercial 90/10.";
  }
  return "Perfil en acompañamiento automatizado con brecha, siguiente acción y fecha de reevaluación.";
}

function toProfileAnswers(input: Record<string, string>): ProfileAnswers {
  const result: ProfileAnswers = {};
  for (const [field, value] of Object.entries(input)) {
    if (profileFields.has(field as ProfileField) && value) {
      result[field as ProfileField] = value;
    }
  }
  return result;
}

function toDiscovery(input: Record<string, string>): DiscoveryContext {
  return {
    ...(input.housingVision ? { housingVision: input.housingVision } : {}),
    ...(input.intendedFor ? { intendedFor: input.intendedFor } : {}),
    ...(input.motivation ? { motivation: input.motivation } : {}),
    ...(input.obstacle ? { obstacle: input.obstacle } : {}),
    ...(input.advanceNeed ? { advanceNeed: input.advanceNeed } : {}),
  };
}

function toConversationAction(value: string): ConversationAction {
  if (
    value === "OPEN_DISCOVERY" ||
    value === "DISCOVER_PREVIOUS_BUYER_INTENT" ||
    value === "DISCOVER_MOTIVATION" ||
    value === "DISCOVER_OBSTACLE" ||
    value === "DISCOVER_ADVANCE_NEED" ||
    value === "COMPLETE"
  ) {
    return value;
  }
  if (profileFields.has(value as ProfileField)) return value as ProfileField;
  return "OPEN_DISCOVERY";
}

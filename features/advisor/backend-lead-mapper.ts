import type { LeadListItem } from "../../lib/api/leads";
import type { EvaluationResult, ProfileAnswers, Scenario } from "../conversation/domain";
import type { QualifiedLead } from "../conversation/qualified-leads";

const routeMap: Record<NonNullable<LeadListItem["route"]>, EvaluationResult["route"]> = {
  READY_TO_CLOSE: "ADVISOR_NOW",
  NEEDS_VALIDATION: "NEEDS_DATA",
  NON_AFFILIATE_REVIEW: "NON_AFFILIATE_PRIORITY",
  REGULATORY_WAITLIST: "NURTURE_LONG_TERM",
  NURTURE: "NURTURE_LONG_TERM",
  FINANCIAL_PREPARATION: "NURTURE_FINANCIAL",
  OPTED_OUT: "OPTED_OUT",
};

export function mapBackendLeadToQualified(item: LeadListItem): QualifiedLead {
  const leadId = item.id as Scenario["leadId"];
  const profile = toProfileAnswers(item.profile ?? {});
  if (
    !profile.affiliation &&
    (item.affiliation_status === "AFFILIATE" ||
      item.affiliation_status === "NON_AFFILIATE")
  ) {
    profile.affiliation = item.affiliation_status;
  }

  const projectMatches = item.top_project_id
    ? [{
        projectId: item.top_project_id,
        score: 0,
        signals: [],
        reasons: ["Proyecto principal de la evaluación disponible"],
        evidenceSourceIds: [],
      }]
    : [];
  const route = item.route ? routeMap[item.route] : "NEEDS_DATA";
  const priority = item.priority ?? "LOW";

  const scenario: Scenario = {
    id: `backend-${item.session_id}`,
    leadId,
    displayName: item.first_name?.trim() || "Prospecto sin nombre",
    leadSource: item.source.toLowerCase() === "meta" ? "META" : "ORGANIC",
    capturedAt: item.qualified_at,
    routeLabel: routeLabelMap[route],
    description: `Oportunidad de ${item.source} · campaña ${item.campaign || "sin campaña"}.`,
    knownProfile: profile,
    knownBenefits: [],
    engagementSignals: [
      `Campaña ${item.campaign || "sin campaña"}`,
      `Estado ${item.status}`,
      ...(item.handoff_requested
        ? [`Solicitud de contacto ${item.handoff_status ?? "recibida"}`]
        : []),
      ...(item.agent_mode ? [`Modo conversacional ${item.agent_mode}`] : []),
      ...(item.conversation_state ? [`Estado conversacional ${item.conversation_state}`] : []),
      ...(item.regulatory_status ? [`Estado 90/10 ${item.regulatory_status}`] : []),
      ...(item.nurture_primary_gap ? [`Brecha prioritaria ${item.nurture_primary_gap}`] : []),
    ],
    requiredFields: [],
  };

  const evaluation: EvaluationResult = {
    leadId,
    readinessScore:
      item.readiness_score ??
      (item.readiness_level === "HIGH"
        ? 80
        : item.readiness_level === "DEVELOPING"
          ? 55
          : 25),
    confidenceScore: item.confidence_score ?? 0,
    priority,
    route,
    projectIds: item.top_project_id ? [item.top_project_id] : [],
    projectMatches,
    capacity: {
      monthlyIncomeEstimate: 0,
      currentCommitmentRatio: 0,
      maximumHousingRatio: 0,
      estimatedHousingPayment: item.estimated_monthly_payment ?? 0,
      status: item.estimated_monthly_payment ? "MODERATE" : "UNKNOWN",
    },
    benefitSignals: { confirmed: [], potential: [] },
    profileSnapshot: profile,
    knownDataUsed: profile.affiliation ? ["affiliation"] : [],
    factors: item.readiness_factors ?? [],
    blockers: item.readiness_blockers ?? [],
    commercialSummary:
      item.readiness_factors?.[0] ??
      "La información ampliada está disponible en el detalle de la oportunidad.",
    nextAction: item.next_action ?? "Revisar el detalle para confirmar el siguiente paso.",
    followUpAt: item.review_date,
    advanceCondition: "Completar la revisión del perfil y de los proyectos recomendados.",
  };

  return {
    scenario,
    evaluation,
    source: "BACKEND",
    backendNurture: item.nurture_status
      ? {
          status: item.nurture_status as NonNullable<
            QualifiedLead["backendNurture"]
          >["status"],
          primaryGap: item.nurture_primary_gap ?? null,
          targetAmount: item.nurture_target_amount ?? null,
          interventionRequired:
            item.nurture_intervention_required ?? false,
          milestones: (item.nurture_milestones ?? []).map((milestone) => ({
            id: milestone.id,
            label: milestone.label,
            completed: milestone.completed,
            completedAt: milestone.completed_at ?? null,
          })),
        }
      : undefined,
    backendWorkflow:
      item.commercial_state && item.workflow_version
        ? {
            state: item.commercial_state as NonNullable<
              QualifiedLead["backendWorkflow"]
            >["state"],
            version: item.workflow_version,
            assignedAdvisorId: item.assigned_advisor_id ?? null,
            nextAction: item.next_action ?? null,
            nextFollowUpAt: item.next_follow_up_at ?? null,
            slaDueAt: item.sla_due_at ?? null,
            updatedAt: item.updated_at,
          }
        : undefined,
  };
}

export function mapBackendLeadsToQualified(items: LeadListItem[]): QualifiedLead[] {
  return items.map(mapBackendLeadToQualified);
}

const routeLabelMap: Record<EvaluationResult["route"], string> = {
  ADVISOR_NOW: "Atención comercial",
  NON_AFFILIATE_PRIORITY: "Revisión comercial",
  NURTURE_FINANCIAL: "Preparación financiera",
  NURTURE_BENEFITS: "Validación de beneficios",
  NURTURE_LONG_TERM: "Acompañamiento",
  NEEDS_DATA: "Información pendiente",
  OPTED_OUT: "Sin contacto",
};

const profileFields = new Set([
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

function toProfileAnswers(profile: Record<string, unknown>): ProfileAnswers {
  return Object.fromEntries(
    Object.entries(profile).filter(
      (entry): entry is [keyof ProfileAnswers, string] =>
        profileFields.has(entry[0]) &&
        typeof entry[1] === "string" &&
        entry[1].trim().length > 0,
    ),
  );
}

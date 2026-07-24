import type { LeadListItem } from "../../lib/api/leads";
import type { EvaluationResult, ProfileAnswers, Scenario } from "../conversation/domain";
import type { QualifiedLead } from "../conversation/qualified-leads";

const routeMap: Record<NonNullable<LeadListItem["route"]>, EvaluationResult["route"]> = {
  READY_TO_CLOSE: "ADVISOR_NOW",
  NEEDS_VALIDATION: "NEEDS_DATA",
  NON_AFFILIATE_REVIEW: "NON_AFFILIATE_PRIORITY",
  NURTURE: "NURTURE_LONG_TERM",
  FINANCIAL_PREPARATION: "NURTURE_FINANCIAL",
  OPTED_OUT: "OPTED_OUT",
};

export function mapBackendLeadToQualified(item: LeadListItem): QualifiedLead {
  const leadId = item.id as Scenario["leadId"];
  const profile: ProfileAnswers = {};
  if (item.affiliation_status === "AFFILIATE" || item.affiliation_status === "NON_AFFILIATE") {
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
    capturedAt: item.updated_at,
    routeLabel: routeLabelMap[route],
    description: `Oportunidad de ${item.source} · campaña ${item.campaign || "sin campaña"}.`,
    knownProfile: profile,
    knownBenefits: [],
    engagementSignals: [
      `Campaña ${item.campaign || "sin campaña"}`,
      `Estado ${item.status}`,
    ],
    requiredFields: [],
  };

  const evaluation: EvaluationResult = {
    leadId,
    readinessScore: item.readiness_score ?? 0,
    confidenceScore: 0,
    priority,
    route,
    projectIds: item.top_project_id ? [item.top_project_id] : [],
    projectMatches,
    capacity: {
      monthlyIncomeEstimate: 0,
      currentCommitmentRatio: 0,
      maximumHousingRatio: 0,
      estimatedHousingPayment: 0,
      status: "UNKNOWN",
    },
    benefitSignals: { confirmed: [], potential: [] },
    profileSnapshot: profile,
    knownDataUsed: profile.affiliation ? ["affiliation"] : [],
    factors: [],
    blockers: [],
    commercialSummary: "La información ampliada está disponible en el detalle de la oportunidad.",
    nextAction: "Revisar el detalle para confirmar el siguiente paso.",
    followUpAt: null,
    advanceCondition: "Completar la revisión del perfil y de los proyectos recomendados.",
  };

  return {
    scenario,
    evaluation,
    source: "BACKEND",
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

import type { QualifiedLead } from "@/features/conversation/qualified-leads";
import { getQualifiedScenarioLeads, isCommercialOpportunity } from "@/features/conversation/qualified-leads";
import { getHousingProject } from "@/lib/housing-catalog";

const routeLabels = {
  ADVISOR_NOW: "Oportunidad comercial",
  NON_AFFILIATE_PRIORITY: "Oportunidad comercial",
  NURTURE_FINANCIAL: "Acompañamiento",
  NURTURE_BENEFITS: "Acompañamiento",
  NURTURE_LONG_TERM: "Acompañamiento",
  NEEDS_DATA: "Acompañamiento",
  OPTED_OUT: "Sin contacto",
} as const;

const horizonLabels: Record<string, string> = {
  "0_3": "0–3 meses",
  "3_6": "3–6 meses",
  "6_12": "6–12 meses",
  "12_PLUS": "Más de 12 meses",
};

const goalLabels: Record<string, string> = {
  BUY_THIS_YEAR: "Comprar vivienda este año",
  FIND_MATCHES: "Encontrar proyectos compatibles",
  PREPARE: "Prepararse para comprar",
  BENEFITS: "Conocer beneficios y subsidios",
};

export function toAdvisorLeadRow({ scenario, evaluation }: QualifiedLead) {
  const project = evaluation.projectIds
    .map(getHousingProject)
    .find((item) => item !== undefined);
  const profile = evaluation.profileSnapshot;

  return {
    id: scenario.leadId,
    name: scenario.displayName,
    initials: scenario.displayName.slice(0, 2).toUpperCase(),
    score: evaluation.readinessScore,
    confidence: evaluation.confidenceScore,
    capacity: evaluation.capacity.estimatedHousingPayment
      ? new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(evaluation.capacity.estimatedHousingPayment)
      : "Por completar",
    project: project?.name ?? "Sin asignar",
    source: scenario.leadSource === "META" ? "Meta" : "Canal propio",
    state: isCommercialOpportunity(evaluation) ? "Listo para asesor" : "Nutrición activa",
    priority: evaluation.priority === "HIGH" ? "Alta" : evaluation.priority === "MEDIUM" ? "Media" : "Baja",
    phone: "Dato protegido",
    email: "Dato protegido",
    affiliate: profile.affiliation === "AFFILIATE" ? "Afiliado verificado" : profile.affiliation === "NON_AFFILIATE" ? "No afiliado" : "Por confirmar",
    route: routeLabels[evaluation.route],
    horizon: horizonLabels[profile.horizon ?? ""] ?? "Por confirmar",
    goal: goalLabels[profile.dreamGoal ?? ""] ?? "Por confirmar",
    location: profile.location === "SOACHA" ? "Soacha" : profile.location === "BOGOTA" ? "Bogotá" : "Por confirmar",
    blocker: evaluation.blockers[0] ?? "Sin bloqueo principal",
    nextAction: evaluation.nextAction,
  };
}

export const leads = getQualifiedScenarioLeads().map(toAdvisorLeadRow);

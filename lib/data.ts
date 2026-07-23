import { getQualifiedScenarioLeads, isCommercialOpportunity } from "@/features/conversation/qualified-leads";

export const projects = [
  {
    id: "versalles",
    name: "Versalles",
    city: "Soacha",
    zone: "Cundinamarca",
    price: 180000000,
    priceLabel: "$180 M",
    area: "50–62 m²",
    rooms: "2–3",
    delivery: "Por confirmar",
    compatibility: 91,
    status: "Información por validar",
    units: 0,
    image: "/illustrations/project-1.svg",
    features: [
      "Compatible con el presupuesto estimado",
      "Coincide con la ubicación preferida",
      "Adecuado para un hogar de tres personas",
    ],
    reason: "Coincide preliminarmente con la capacidad, ubicación y composición del hogar del escenario Jonathan.",
  },
] as const;

const routeLabels = {
  ADVISOR_NOW: "Asesor ahora",
  NON_AFFILIATE_PRIORITY: "Prioridad no afiliado",
  NURTURE_FINANCIAL: "Nutrición financiera",
  NURTURE_BENEFITS: "Nutrición de beneficios",
  NURTURE_LONG_TERM: "Nutrición a largo plazo",
  NEEDS_DATA: "Información pendiente",
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

export const leads = getQualifiedScenarioLeads().map(({ scenario, evaluation }) => {
  const project = projects.find((item) => evaluation.projectIds.includes(item.id));
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
});

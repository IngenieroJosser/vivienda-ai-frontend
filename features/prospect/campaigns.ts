import type { AcquisitionContext, CampaignExperience } from "./domain";

const MAX_PARAM_LENGTH = 80;
const SAFE_LEAD_REFERENCE = /^vm_[A-Za-z0-9_-]{12,60}$/;

export const campaignExperiences: Record<CampaignExperience["id"], CampaignExperience> = {
  versalles: {
    id: "versalles",
    eyebrow: "Conoce si Versalles puede encajar contigo",
    title: "Tu interés por vivienda merece una orientación clara.",
    description: "En pocos minutos entenderás tu capacidad aproximada, los beneficios que conviene validar y si Versalles coincide con tu momento.",
    promise: "Orientación personalizada · Sin documentos para comenzar",
    assistantIntro: "Vi que llegaste desde una campaña de Versalles. Antes de recomendarte el proyecto, quiero entender tu momento y tu capacidad.",
    projectId: "versalles",
    knownSignals: { location: "SOACHA", dreamGoal: "FIND_MATCHES" },
  },
  cuota: {
    id: "cuota",
    eyebrow: "Encuentra una cuota que puedas manejar",
    title: "Da el primer paso sin comprometer tus finanzas.",
    description: "Te ayudamos a estimar un rango responsable para vivienda y a definir qué conviene hacer después.",
    promise: "Estimación orientativa · Máximo seis decisiones",
    assistantIntro: "Llegaste buscando una cuota que se ajuste a ti. Empecemos por entender cuándo quieres comprar y qué margen tienes disponible.",
    knownSignals: { dreamGoal: "BUY_THIS_YEAR", mainConcern: "PAYMENT" },
  },
  general: {
    id: "general",
    eyebrow: "Orientación personalizada de vivienda",
    title: "Entiende qué camino puede acercarte a tu vivienda.",
    description: "Cuéntanos únicamente lo necesario y recibe una orientación clara sobre capacidad, beneficios y siguiente paso.",
    promise: "A tu ritmo · Información protegida",
    assistantIntro: "Quiero ayudarte a entender qué camino puede acercarte a tu vivienda, sin volver a preguntarte información que ya tengamos.",
    knownSignals: { dreamGoal: "FIND_MATCHES" },
  },
};

export function sanitizeAcquisitionContext(raw: {
  utm_source?: string;
  utm_campaign?: string;
  utm_content?: string;
  leadId?: string;
}): AcquisitionContext {
  const source = sanitizeParameter(raw.utm_source, "meta");
  const campaign = sanitizeParameter(raw.utm_campaign, "vivienda");
  const content = sanitizeParameter(raw.utm_content, "anuncio");
  const candidate = raw.leadId?.trim();

  return {
    source,
    campaign,
    content,
    ...(candidate && SAFE_LEAD_REFERENCE.test(candidate) ? { leadReference: candidate } : {}),
  };
}

export function resolveCampaignExperience(campaign: string): CampaignExperience {
  const normalized = campaign.toLowerCase();
  if (normalized.includes("versalles")) return campaignExperiences.versalles;
  if (normalized.includes("cuota") || normalized.includes("capacidad")) return campaignExperiences.cuota;
  return campaignExperiences.general;
}

export function sanitizeFirstName(value: string): string {
  return value
    .replace(/[^\p{L}\s'-]/gu, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 40);
}

function sanitizeParameter(value: string | undefined, fallback: string): string {
  const sanitized = value
    ?.trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, "")
    .slice(0, MAX_PARAM_LENGTH);
  return sanitized || fallback;
}

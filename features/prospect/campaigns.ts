import type {
  AcquisitionContext,
  CampaignExperience,
  CustomerRelationship,
  KnownHousing,
} from "./domain";
import type { ProfileAnswers } from "../conversation/domain";

const MAX_PARAM_LENGTH = 80;
const SAFE_LEAD_REFERENCE = /^vm_[A-Za-z0-9_-]{12,60}$/;

export const campaignExperiences: Record<CampaignExperience["id"], CampaignExperience> = {
  versalles: {
    id: "versalles",
    eyebrow: "Orientación personalizada de vivienda",
    title: "¿Te interesó Versalles? Revisemos si se ajusta a ti.",
    description: "Conoce un rango prudente para tu cuota, los beneficios que podrías validar y si el proyecto coincide con lo que buscas.",
    promise: "Orientación personalizada · Sin documentos para comenzar",
    assistantIntro: "Llegaste desde nuestro anuncio de Versalles. Antes de recomendarte el proyecto, quiero entender tu momento y tus posibilidades.",
    projectId: "versalles",
    knownSignals: { location: "SOACHA", dreamGoal: "FIND_MATCHES" },
  },
  cuota: {
    id: "cuota",
    eyebrow: "Encuentra una cuota que puedas manejar",
    title: "Da el primer paso sin comprometer tus finanzas.",
    description: "Te ayudamos a estimar un rango responsable para vivienda y a definir qué conviene hacer después.",
    promise: "Estimación orientativa · Avance guardado",
    assistantIntro: "Llegaste buscando una cuota que se ajuste a ti. Empecemos por entender cuándo quieres comprar y qué margen tienes disponible.",
    knownSignals: { dreamGoal: "BUY_THIS_YEAR", mainConcern: "PAYMENT" },
  },
  general: {
    id: "general",
    eyebrow: "Orientación personalizada de vivienda",
    title: "Encuentra una vivienda acorde con tus posibilidades.",
    description: "Conversemos para conocer tu capacidad orientativa, los beneficios por validar y los proyectos que podrían ajustarse a ti.",
    promise: "A tu ritmo · Información protegida",
    assistantIntro: "Quiero ayudarte a entender qué camino puede acercarte a tu vivienda, sin volver a preguntarte información que ya tengamos.",
    knownSignals: { dreamGoal: "FIND_MATCHES" },
  },
};

type KnownProspect = {
  firstName: string;
  customerRelationship: CustomerRelationship;
  profile: ProfileAnswers;
  knownBenefits: string[];
  engagementSignals: string[];
  knownHousing?: KnownHousing;
};

const knownProspects: Record<string, KnownProspect> = {
  vm_Jonathan30X1: {
    firstName: "Jonathan",
    customerRelationship: "AFFILIATE",
    profile: { affiliation: "AFFILIATE", incomeRange: "MID", householdSize: "3" },
    knownBenefits: ["Subsidio familiar de vivienda por validar", "Acompañamiento Pertenecer"],
    engagementSignals: ["Respondió una pauta de vivienda", "Consultó información del proyecto Versalles"],
  },
  vm_Laura30X2026: {
    firstName: "Laura",
    customerRelationship: "NON_AFFILIATE",
    profile: { affiliation: "NON_AFFILIATE" },
    knownBenefits: [],
    engagementSignals: ["Consultó información de financiación"],
  },
  vm_Camila30X2026: {
    firstName: "Camila",
    customerRelationship: "AFFILIATE",
    profile: {
      affiliation: "AFFILIATE",
      dreamGoal: "PREPARE",
      horizon: "12_PLUS",
      savings: "NONE",
    },
    knownBenefits: ["Subsidio familiar de vivienda por validar", "Acompañamiento Pertenecer"],
    engagementSignals: ["Guardó contenido sobre subsidios"],
  },
  vm_AndresBuyer2026: {
    firstName: "Andrés",
    customerRelationship: "PREVIOUS_BUYER",
    profile: {
      affiliation: "AFFILIATE",
      incomeRange: "MID",
      householdSize: "3",
    },
    knownBenefits: ["Acompañamiento Pertenecer"],
    engagementSignals: [
      "Compró anteriormente un proyecto de vivienda Colsubsidio",
      "Registra una nueva consulta de vivienda",
    ],
    knownHousing: {
      projectName: "Ciudadela Maiporé",
      city: "Soacha",
      purchaseYear: 2021,
    },
  },
};

export function resolveKnownProspect(leadReference?: string): KnownProspect | undefined {
  return leadReference ? knownProspects[leadReference] : undefined;
}

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

function sanitizeParameter(value: string | undefined, fallback: string): string {
  const sanitized = value
    ?.trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, "")
    .slice(0, MAX_PARAM_LENGTH);
  return sanitized || fallback;
}

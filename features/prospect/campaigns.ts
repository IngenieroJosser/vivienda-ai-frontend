import type {
  AcquisitionContext,
  CampaignExperience,
  CustomerRelationship,
  KnownHousing,
} from "./domain";
import type { ProfileAnswers } from "../conversation/domain";

const MAX_PARAM_LENGTH = 160;
const MAX_CLICK_ID_LENGTH = 256;
const SAFE_LEAD_REFERENCE = /^vm_[A-Za-z0-9_-]{12,60}$/;
const SAFE_CLICK_ID = /^[A-Za-z0-9._~-]+$/;

export type AcquisitionQuery = {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  utm_id?: string;
  campaign_id?: string;
  adset_id?: string;
  adset_name?: string;
  ad_id?: string;
  ad_name?: string;
  placement?: string;
  site_source_name?: string;
  fbclid?: string;
  project_id?: string;
  project?: string;
  leadId?: string;
  lead_id?: string;
  external_lead_id?: string;
};

export type BrowserAcquisitionSignals = {
  landingPath?: string;
  referrer?: string;
  locale?: string;
  timezone?: string;
  viewportWidth?: number;
};

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
    assistantIntro:
      "Quiero acompañarte a descubrir qué camino puede acercarte a la vivienda que sueñas.",
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

export function sanitizeAcquisitionContext(raw: AcquisitionQuery): AcquisitionContext {
  const source = sanitizeParameter(raw.utm_source, "meta");
  const medium = sanitizeOptionalParameter(raw.utm_medium);
  const campaign = sanitizeParameter(raw.utm_campaign, "vivienda");
  const content = sanitizeParameter(raw.utm_content, "anuncio");
  const term = sanitizeOptionalParameter(raw.utm_term);
  const campaignId = sanitizeOptionalParameter(raw.campaign_id ?? raw.utm_id);
  const adSetId = sanitizeOptionalParameter(raw.adset_id);
  const adSetName = sanitizeOptionalParameter(raw.adset_name);
  const adId = sanitizeOptionalParameter(raw.ad_id);
  const adName = sanitizeOptionalParameter(raw.ad_name);
  const placement = sanitizeOptionalParameter(raw.placement);
  const siteSource = sanitizeOptionalParameter(raw.site_source_name);
  const projectId = sanitizeOptionalParameter(raw.project_id ?? raw.project);
  const clickId = sanitizeClickId(raw.fbclid);
  const candidate = (
    raw.leadId ??
    raw.lead_id ??
    raw.external_lead_id
  )?.trim();

  return {
    source,
    ...(medium ? { medium } : {}),
    campaign,
    content,
    ...(term ? { term } : {}),
    ...(campaignId ? { campaignId } : {}),
    ...(adSetId ? { adSetId } : {}),
    ...(adSetName ? { adSetName } : {}),
    ...(adId ? { adId } : {}),
    ...(adName ? { adName } : {}),
    ...(placement ? { placement } : {}),
    ...(siteSource ? { siteSource } : {}),
    ...(clickId ? { clickId } : {}),
    ...(projectId ? { projectId } : {}),
    ...(candidate && SAFE_LEAD_REFERENCE.test(candidate) ? { leadReference: candidate } : {}),
  };
}

export function enrichAcquisitionContext(
  acquisition: AcquisitionContext,
  signals: BrowserAcquisitionSignals,
): AcquisitionContext {
  const landingPath = sanitizeLandingPath(signals.landingPath);
  const referrerOrigin = sanitizeReferrerOrigin(signals.referrer);
  const locale = sanitizeLocale(signals.locale);
  const timezone = sanitizeTimezone(signals.timezone);
  const deviceClass = classifyDevice(signals.viewportWidth);

  return {
    ...acquisition,
    ...(landingPath ? { landingPath } : {}),
    ...(referrerOrigin ? { referrerOrigin } : {}),
    ...(locale ? { locale } : {}),
    ...(timezone ? { timezone } : {}),
    ...(deviceClass ? { deviceClass } : {}),
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

function sanitizeOptionalParameter(value?: string): string | undefined {
  const sanitized = sanitizeParameter(value, "");
  return sanitized || undefined;
}

function sanitizeClickId(value?: string): string | undefined {
  const candidate = value?.trim().slice(0, MAX_CLICK_ID_LENGTH);
  return candidate && SAFE_CLICK_ID.test(candidate) ? candidate : undefined;
}

function sanitizeLandingPath(value?: string): string | undefined {
  const candidate = value?.trim();
  if (!candidate?.startsWith("/") || candidate.startsWith("//")) return undefined;
  return candidate.split(/[?#]/, 1)[0].slice(0, MAX_PARAM_LENGTH);
}

function sanitizeReferrerOrigin(value?: string): string | undefined {
  if (!value) return undefined;
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:"
      ? url.origin.slice(0, MAX_PARAM_LENGTH)
      : undefined;
  } catch {
    return undefined;
  }
}

function sanitizeLocale(value?: string): string | undefined {
  const candidate = value?.trim().slice(0, 24);
  return candidate && /^[A-Za-z]{2,3}(?:-[A-Za-z0-9]{2,8})*$/.test(candidate)
    ? candidate
    : undefined;
}

function sanitizeTimezone(value?: string): string | undefined {
  const candidate = value?.trim().slice(0, 64);
  return candidate && /^[A-Za-z0-9_+\-/]+$/.test(candidate)
    ? candidate
    : undefined;
}

function classifyDevice(
  viewportWidth?: number,
): AcquisitionContext["deviceClass"] | undefined {
  if (!Number.isFinite(viewportWidth) || !viewportWidth || viewportWidth < 1) {
    return undefined;
  }
  if (viewportWidth < 768) return "MOBILE";
  if (viewportWidth < 1180) return "TABLET";
  return "DESKTOP";
}

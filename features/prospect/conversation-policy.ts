import type { ProfileAnswers, ProfileField } from "../conversation/domain";
import { formatCop } from "../conversation/profile-copy";
import { getCapacityRange } from "./capacity";
import type { ConversationAction, DiscoveryContext, ProspectSession } from "./domain";
import { getPreviousBuyerIntentPrompt } from "./customer-journey";
import type { SignalExtraction } from "./signal-extractor";

const REQUIRED_EVIDENCE: ProfileField[] = [
  "affiliation",
  "mainConcern",
  "location",
  "horizon",
  "incomeRange",
  "obligations",
  "savings",
];

export function selectNextBestAction(
  profile: ProfileAnswers,
  discovery: DiscoveryContext,
): ConversationAction {
  if (hasSufficientEvidence(profile, discovery)) return "COMPLETE";

  if (!discovery.housingVision) return "OPEN_DISCOVERY";
  if (!discovery.motivation) return "DISCOVER_MOTIVATION";
  if (!discovery.obstacle && !profile.mainConcern) return "DISCOVER_OBSTACLE";

  const contextualOrder: ProfileField[] = profile.mainConcern === "PAYMENT"
    ? ["incomeRange", "obligations", "savings", "horizon", "location", "affiliation"]
    : profile.mainConcern === "BENEFITS"
      ? ["affiliation", "incomeRange", "obligations", "savings", "horizon", "location"]
      : profile.mainConcern === "SPACE"
        ? ["householdSize", "location", "horizon", "incomeRange", "obligations", "savings", "affiliation"]
        : ["mainConcern", "horizon", "location", "incomeRange", "obligations", "savings", "affiliation"];

  const missingProfileField = contextualOrder.find((field) => !profile[field])
    ?? REQUIRED_EVIDENCE.find((field) => !profile[field]);

  if (missingProfileField) return missingProfileField;
  if (!discovery.advanceNeed) return "DISCOVER_ADVANCE_NEED";
  return "COMPLETE";
}

export function hasSufficientEvidence(
  profile: ProfileAnswers,
  discovery: DiscoveryContext,
): boolean {
  return REQUIRED_EVIDENCE.every((field) => Boolean(profile[field]))
    && Boolean(discovery.housingVision)
    && Boolean(discovery.motivation)
    && Boolean(discovery.obstacle || profile.mainConcern)
    && Boolean(discovery.advanceNeed);
}

export function getInitialMessage(session: ProspectSession): string {
  if (session.customerRelationship === "PREVIOUS_BUYER") {
    const previousHome = session.knownHousing
      ? ` Tenemos registrada tu compra en ${session.knownHousing.projectName}.`
      : "";
    return `Hola, ${session.firstName ?? ""}.${previousHome} Para orientarte sin repetir información, primero quiero entender qué necesitas ahora. ${getPreviousBuyerIntentPrompt()}`.replace(
      "Hola, .",
      "Hola.",
    );
  }
  if (session.firstName && session.customerRelationship === "AFFILIATE") {
    const campaignContext =
      session.campaignId === "versalles"
        ? " También vimos tu interés en Versalles."
        : "";
    return `Hola, ${session.firstName}. Tenemos registrada tu afiliación a Colsubsidio; si cambió, puedes contármelo.${campaignContext} Cuéntame qué buscas en tu próxima vivienda y qué te gustaría tener claro para avanzar.`;
  }
  if (session.firstName && session.customerRelationship === "NON_AFFILIATE") {
    return `Hola, ${session.firstName}. Tenemos registrado que actualmente no estás afiliada; si cambió, puedes contármelo. Recibirás la misma calidad de orientación. ¿Qué buscas en tu próxima vivienda y qué te gustaría aclarar para avanzar?`;
  }
  if (session.firstName && session.campaignId === "versalles") {
    return `Hola, ${session.firstName}. Vimos que estás interesado en adquirir vivienda y encontramos algunos beneficios que podrían ayudarte. Queremos entender qué estás buscando para orientarte mejor. Cuéntame, ¿cómo imaginas la vivienda que quieres para ti y tu familia?`;
  }
  if (session.firstName) {
    return `Hola, ${session.firstName}. Cuéntame qué buscas en tu próxima vivienda y qué te gustaría tener claro para poder avanzar.`;
  }
  return "Hola. Soy el orientador virtual de Vivienda Colsubsidio. Cuéntame qué buscas en tu próxima vivienda y qué te gustaría aclarar para tomar una decisión.";
}

export function buildContextualResponse(input: {
  extraction: SignalExtraction;
  nextAction: ConversationAction;
  profile: ProfileAnswers;
  estimatedHousingPayment: number;
}): string {
  if (input.nextAction === "COMPLETE") {
    return "Gracias. Ya tengo contexto suficiente para mostrarte una orientación útil y un siguiente paso acorde con tu momento.";
  }

  const reflection = buildReflection(input.extraction.profile);
  const capacity = getCapacityRange(input.estimatedHousingPayment);
  const value = capacity && (input.extraction.profile.incomeRange || input.extraction.profile.obligations)
    ? ` Con estos datos, el rango prudente para vivienda estaría entre ${formatCop(capacity.minimum)} y ${formatCop(capacity.maximum)} al mes; lo confirmaremos en tu orientación.`
    : "";
  const prompt = getPrompt(input.nextAction);

  const advisorBoundary = input.extraction.requestsAdvisor
    ? "Entiendo que prefieres hablar con una persona. Primero confirmemos si hoy existen condiciones para que esa conversación sea útil. "
    : "";
  if (!input.extraction.fields.length && !Object.keys(input.extraction.discovery).length) {
    return `${advisorBoundary}Quiero asegurarme de entenderte bien. ${prompt}`;
  }
  return `${advisorBoundary}${reflection}${value} ${prompt}`.trim();
}

function buildReflection(profile: ProfileAnswers): string {
  const parts: string[] = [];
  if (profile.mainConcern === "PAYMENT") parts.push("tu principal preocupación es que la cuota sea manejable");
  if (profile.mainConcern === "BENEFITS") parts.push("quieres aclarar qué beneficios podrían aplicar");
  if (profile.mainConcern === "SPACE") parts.push("el espacio para tu familia es importante");
  if (profile.householdSize === "2") parts.push("la vivienda sería para dos personas");
  if (profile.householdSize === "3") parts.push("la vivienda sería para tres personas");
  if (profile.householdSize === "4_PLUS") parts.push("la vivienda sería para cuatro o más personas");
  if (profile.savings === "NONE") parts.push("todavía no cuentas con ahorro para la cuota inicial");
  if (profile.savings === "PARTIAL") parts.push("ya estás construyendo tu ahorro");
  if (profile.location === "SOACHA") parts.push("te interesa Soacha");

  if (!parts.length) return "Entiendo lo que me cuentas.";
  return `Entiendo: ${joinNaturally(parts)}.`;
}

function getPrompt(action: ConversationAction): string {
  const prompts: Partial<Record<ConversationAction, string>> = {
    OPEN_DISCOVERY: "¿Cómo imaginas la vivienda que quieres y para quién sería?",
    DISCOVER_PREVIOUS_BUYER_INTENT: getPreviousBuyerIntentPrompt(),
    DISCOVER_MOTIVATION: "¿Qué te motivó a buscar vivienda justo ahora?",
    DISCOVER_OBSTACLE: "¿Qué sientes que podría impedirte avanzar hoy?",
    DISCOVER_ADVANCE_NEED: "¿Qué necesitarías tener claro para sentirte preparado para avanzar?",
    mainConcern: "¿Qué es lo que más necesitas aclarar antes de elegir una vivienda?",
    affiliation: "¿Actualmente estás afiliado a Colsubsidio?",
    location: "¿En qué zona te gustaría vivir?",
    horizon: "¿En qué momento te gustaría comprar?",
    householdSize: "¿Cuántas personas vivirían en la vivienda?",
    incomeRange: "Para darte un rango responsable, ¿en qué rango están los ingresos mensuales de tu hogar?",
    obligations: "¿Qué parte de esos ingresos ya está comprometida en deudas u otras obligaciones?",
    savings: "¿Cómo vas con el ahorro para la cuota inicial?",
  };
  return prompts[action] ?? "¿Qué más te gustaría contarme sobre tu búsqueda?";
}

function joinNaturally(parts: string[]): string {
  if (parts.length === 1) return parts[0]!;
  return `${parts.slice(0, -1).join(", ")} y ${parts.at(-1)}`;
}

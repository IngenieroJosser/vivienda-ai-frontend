import type {
  KnownHousing,
  PreviousBuyerIntent,
  ServiceGuidance,
} from "./domain";

export function detectPreviousBuyerIntent(
  message: string,
): PreviousBuyerIntent | undefined {
  const text = normalize(message);

  if (
    /(garantia|postventa|posventa|humedad|fisura|defecto|reparacion|entrega del inmueble|servicio despues de la compra)/.test(
      text,
    )
  ) {
    return "AFTER_SALES";
  }
  if (
    /(mejorar|mejoramiento|remodelar|remodelacion|ampliar|arreglar|renovar|acabados de mi vivienda)/.test(
      text,
    )
  ) {
    return "HOME_IMPROVEMENT";
  }
  if (/(beneficio|subsidio|apoyo|credito para vivienda actual)/.test(text)) {
    return "BENEFITS";
  }
  if (
    /(otra vivienda|segunda vivienda|comprar de nuevo|nueva vivienda|invertir en vivienda|volver a comprar)/.test(
      text,
    )
  ) {
    return "BUY_AGAIN";
  }

  return undefined;
}

export function buildServiceGuidance(input: {
  intent: Exclude<PreviousBuyerIntent, "BUY_AGAIN">;
  knownHousing?: KnownHousing;
  knownBenefits: string[];
}): ServiceGuidance {
  const knownContext = input.knownHousing
    ? [
        `Vivienda adquirida: ${input.knownHousing.projectName}`,
        `Ubicación registrada: ${input.knownHousing.city}`,
        `Año de compra registrado: ${input.knownHousing.purchaseYear}`,
      ]
    : ["La vivienda anterior requiere confirmación antes de iniciar una gestión."];

  if (input.intent === "HOME_IMPROVEMENT") {
    return {
      route: "HOME_IMPROVEMENT",
      title: "Tu ruta es orientación para mejorar la vivienda.",
      description:
        "No necesitas iniciar un perfilamiento de compra. Primero conviene precisar qué quieres mejorar y validar las alternativas vigentes para tu vivienda.",
      capacitySummary:
        "No calculamos capacidad para una nueva compra porque tu intención actual es mejorar la vivienda que ya tienes.",
      benefitSummary: [
        ...input.knownBenefits,
        "Programas y financiación para mejoramiento por validar según condiciones vigentes.",
      ],
      projectSummary:
        "No mostramos proyectos nuevos en esta ruta porque no corresponden a tu necesidad actual.",
      nextAction:
        "Definir el tipo de mejora y validar los programas vigentes con el equipo de vivienda.",
      knownContext,
    };
  }

  if (input.intent === "BENEFITS") {
    return {
      route: "BENEFITS_GUIDANCE",
      title: "Revisemos los beneficios relacionados con tu vivienda.",
      description:
        "Usaremos la información de tu compra anterior como punto de partida y separaremos los beneficios conocidos de aquellos que requieren validación.",
      capacitySummary:
        "No calculamos capacidad para una nueva compra porque solicitaste orientación sobre beneficios.",
      benefitSummary: input.knownBenefits.length
        ? input.knownBenefits
        : ["Beneficios disponibles por validar según afiliación y condiciones vigentes."],
      projectSummary:
        "No recomendamos proyectos mientras tu intención no sea adquirir otra vivienda.",
      nextAction:
        "Confirmar el beneficio que deseas revisar y sus requisitos vigentes.",
      knownContext,
    };
  }

  return {
    route: "AFTER_SALES",
    title: "Tu solicitud corresponde a una ruta de servicio.",
    description:
      "La garantía o postventa debe revisarse con la información de la vivienda adquirida y el detalle de la situación reportada.",
    capacitySummary:
      "La capacidad de compra no aplica para una solicitud de garantía o postventa.",
    benefitSummary: [
      "Cobertura y condiciones de garantía pendientes de validación por el canal de servicio.",
    ],
    projectSummary:
      "No mostramos proyectos comerciales porque esta gestión corresponde a tu vivienda actual.",
    nextAction:
      "Preparar una descripción del caso y los soportes disponibles para continuar por el canal de servicio.",
    knownContext,
  };
}

export function getPreviousBuyerIntentPrompt(): string {
  return "Cuéntame si quieres comprar otra vivienda, mejorar la que ya tienes, conocer beneficios o solicitar ayuda de garantía o postventa.";
}

function normalize(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[¿?¡!.,;:]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

import type { EvaluationResult } from "./domain";

type ResultPresentation = {
  eyebrow: string;
  title: string;
  description: string;
  readinessLabel: string;
  actionLabel: string;
  actionHref?: string;
};

const resultPresentations: Record<EvaluationResult["route"], ResultPresentation> = {
  ADVISOR_NOW: {
    eyebrow: "Listo para avanzar",
    title: "Tienes una ruta clara para continuar.",
    description: "Tu momento, preparación y preferencias permiten dar el siguiente paso con acompañamiento.",
    readinessLabel: "Preparación avanzada",
    actionLabel: "Agendar conversación",
    actionHref: "/vivienda/agendar",
  },
  NON_AFFILIATE_PRIORITY: {
    eyebrow: "Ruta prioritaria",
    title: "Tu preparación abre una ruta de atención.",
    description: "No estar afiliado no reduce la calidad de tu orientación. Un asesor puede ayudarte a validar el camino disponible.",
    readinessLabel: "Preparación avanzada",
    actionLabel: "Solicitar orientación",
    actionHref: "/vivienda/agendar",
  },
  NURTURE_FINANCIAL: {
    eyebrow: "Plan de preparación",
    title: "El mejor paso ahora es fortalecer tu punto de partida.",
    description: "Una meta concreta de ahorro te permitirá avanzar con más claridad y mejores opciones.",
    readinessLabel: "Preparación en construcción",
    actionLabel: "Explorar el proyecto vigente",
    actionHref: "/vivienda/proyectos",
  },
  NURTURE_BENEFITS: {
    eyebrow: "Beneficios por revisar",
    title: "Conviene validar tus beneficios antes de elegir.",
    description: "La orientación identifica una posibilidad, pero ningún subsidio se considera confirmado todavía.",
    readinessLabel: "Preparación por validar",
    actionLabel: "Explorar proyectos",
    actionHref: "/vivienda/proyectos",
  },
  NURTURE_LONG_TERM: {
    eyebrow: "Ruta a tu ritmo",
    title: "Puedes avanzar por etapas, sin apresurarte.",
    description: "Tu horizonte permite organizar decisiones y revisar el progreso cuando sea oportuno.",
    readinessLabel: "Preparación gradual",
    actionLabel: "Explorar proyectos",
    actionHref: "/vivienda/proyectos",
  },
  NEEDS_DATA: {
    eyebrow: "Orientación inicial",
    title: "Aún necesitamos un poco más de contexto.",
    description: "Tus respuestas no permiten recomendar una ruta concluyente, pero ya indican qué conviene validar.",
    readinessLabel: "Información por completar",
    actionLabel: "Iniciar otra orientación",
    actionHref: "/demo",
  },
  OPTED_OUT: {
    eyebrow: "Orientación finalizada",
    title: "No continuaremos usando información de esta sesión.",
    description: "Puedes volver cuando quieras e iniciar una orientación nueva.",
    readinessLabel: "Sin evaluación",
    actionLabel: "Volver a la demo",
    actionHref: "/demo",
  },
};

export function getResultPresentation(route: EvaluationResult["route"]): ResultPresentation {
  return resultPresentations[route];
}

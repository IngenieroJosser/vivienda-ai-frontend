export type ReadinessPresentation = {
  label: "Alta" | "En desarrollo" | "Inicial";
  description: string;
};

export type EvidencePresentation = {
  label: "Sólida" | "Parcial" | "Por completar";
  description: string;
};

export function getReadinessPresentation(
  readinessScore: number,
): ReadinessPresentation {
  if (readinessScore >= 75) {
    return {
      label: "Alta",
      description:
        "Hay condiciones observables para iniciar la atención comercial.",
    };
  }
  if (readinessScore >= 50) {
    return {
      label: "En desarrollo",
      description:
        "Existen avances, pero todavía hay condiciones que deben confirmarse.",
    };
  }
  return {
    label: "Inicial",
    description:
      "La prioridad es completar información o fortalecer la preparación.",
  };
}

export function getEvidencePresentation(
  confidenceScore: number,
): EvidencePresentation {
  if (confidenceScore >= 0.8) {
    return {
      label: "Sólida",
      description: "La mayoría de los datos necesarios está confirmada.",
    };
  }
  if (confidenceScore >= 0.65) {
    return {
      label: "Parcial",
      description: "Hay información suficiente, con datos todavía por validar.",
    };
  }
  return {
    label: "Por completar",
    description: "Faltan datos relevantes para sostener la orientación.",
  };
}

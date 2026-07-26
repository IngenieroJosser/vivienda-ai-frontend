import type { ProfileAnswers, ProfileField, Scenario } from "./domain";
import { questionBank } from "./questions";

const knownFieldLabels: Partial<Record<ProfileField, string>> = {
  affiliation: "afiliación",
  incomeRange: "rango de ingresos",
  householdSize: "composición del hogar",
  dreamGoal: "momento de búsqueda",
  horizon: "horizonte de compra",
  savings: "estado de ahorro",
};

export function getAnswerLabel(field: ProfileField, value: string): string {
  return questionBank[field].options.find((option) => option.value === value)?.label ?? value;
}

export function getKnownDataMessage(scenario: Scenario): string {
  const labels = Object.keys(scenario.knownProfile)
    .map((field) => knownFieldLabels[field as ProfileField])
    .filter(Boolean);

  if (!labels.length) return "Empezaremos desde cero y solo te preguntaremos lo necesario.";
  return `Ya conocemos ${joinNaturalLanguage(labels as string[])}. No volveremos a preguntártelo.`;
}

export function getProfileValue(profile: ProfileAnswers, field: ProfileField): string {
  const value = profile[field];
  return value ? getAnswerLabel(field, value) : "Por confirmar";
}

export function formatCop(value: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(value);
}

function joinNaturalLanguage(items: string[]): string {
  if (items.length <= 1) return items[0] ?? "";
  return `${items.slice(0, -1).join(", ")} y ${items.at(-1)}`;
}

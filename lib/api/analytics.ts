import { apiRequest } from "./client";
import type { components } from "./generated";

export type AdvisorDashboardData =
  components["schemas"]["AdvisorDashboardResponse"];
export type AdvisorInsight = components["schemas"]["AdvisorInsight"];
export type DistributionItem = components["schemas"]["DistributionItem"];
export type DataAsset = components["schemas"]["DataAsset"];

export function getAdvisorDashboard(
  signal?: AbortSignal,
): Promise<AdvisorDashboardData> {
  return apiRequest<AdvisorDashboardData>("/analytics/advisor-dashboard", {
    signal,
    advisorAuth: true,
  });
}

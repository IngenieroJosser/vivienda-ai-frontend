import { apiRequest } from "./client";

// Mirrors the JSON returned by GET /api/v1/projects on the backend.
export type ProjectDto = {
  id: string;
  name: string;
  city: string;
  development: string;
  housing_type: string | null;
  brochure_url: string | null;
  tour_urls: string[];
  summary: string;
  active: boolean;
  historical_sample_size: number;
  historical_profile: Record<string, unknown>;
};

export function listProjects(signal?: AbortSignal): Promise<ProjectDto[]> {
  return apiRequest<ProjectDto[]>("/projects", { signal });
}

const DEFAULT_BASE_URL = "http://localhost:8000/api/v1";

/**
 * Base URL del backend. Se configura con `NEXT_PUBLIC_API_URL` en `.env.local`.
 * Si no está definida, cae al backend local por defecto.
 */
export const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL ?? DEFAULT_BASE_URL
).replace(/\/$/, "");

export class ApiError extends Error {
  readonly status: number;
  readonly details: unknown;

  constructor(message: string, status: number, details: unknown = null) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  signal?: AbortSignal;
};

/**
 * Cliente HTTP tipado para el backend. Serializa JSON, adjunta cabeceras y
 * normaliza los errores en `ApiError` para que la UI pueda decidir el fallback.
 */
export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { method = "GET", body, signal } = options;
  const url = `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;

  let response: Response;
  try {
    response = await fetch(url, {
      method,
      signal,
      headers: {
        Accept: "application/json",
        ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch (cause) {
    throw new ApiError(
      "No se pudo contactar el servicio. Verifica que el backend esté activo.",
      0,
      cause,
    );
  }

  if (!response.ok) {
    const details = await safeParseJson(response);
    throw new ApiError(
      `El servicio respondió con estado ${response.status}.`,
      response.status,
      details,
    );
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

async function safeParseJson(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

export type HealthResponse = {
  status: string;
  version: string;
  database: string;
  model_available: boolean;
  processed_data_available: boolean;
};

/**
 * Sonda de disponibilidad del backend. Útil para validar conectividad y CORS.
 */
export function getHealth(signal?: AbortSignal): Promise<HealthResponse> {
  return apiRequest<HealthResponse>("/health", { signal });
}

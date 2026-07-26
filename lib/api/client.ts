const DEFAULT_BASE_URL = "https://vivienda-ai-backend.onrender.com/api/v1";

/**
 * Base URL del backend. Se configura con `NEXT_PUBLIC_API_URL` en `.env.local`.
 * Si no está definida, utiliza el servicio desplegado configurado para la demo.
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
  advisorAuth?: boolean;
  headers?: Record<string, string>;
};

/**
 * Cliente HTTP tipado para el backend. Serializa JSON, adjunta cabeceras y
 * normaliza los errores en `ApiError` para que la UI pueda decidir el fallback.
 */
export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const {
    method = "GET",
    body,
    signal,
    advisorAuth = false,
    headers = {},
  } = options;
  const url = `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;

  let response: Response;
  try {
    response = await fetch(url, {
      method,
      signal,
      headers: {
        Accept: "application/json",
        ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
        ...(advisorAuth && process.env.NEXT_PUBLIC_ADVISOR_ACCESS_TOKEN
          ? {
              Authorization: `Bearer ${process.env.NEXT_PUBLIC_ADVISOR_ACCESS_TOKEN}`,
            }
          : {}),
        ...headers,
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

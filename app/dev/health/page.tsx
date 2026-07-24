"use client";

import { useEffect, useState } from "react";

import { API_BASE_URL, ApiError, getHealth, type HealthResponse } from "@/lib/api/client";

type ProbeState =
  | { status: "loading" }
  | { status: "ok"; data: HealthResponse }
  | { status: "error"; message: string };

/**
 * Herramienta de diagnóstico (solo desarrollo): confirma que el frontend puede
 * hablar con el backend y que CORS está bien configurado desde este origen.
 */
export default function ApiHealthPage() {
  const [state, setState] = useState<ProbeState>({ status: "loading" });

  useEffect(() => {
    const controller = new AbortController();
    getHealth(controller.signal)
      .then((data) => setState({ status: "ok", data }))
      .catch((error) => {
        const message =
          error instanceof ApiError
            ? `${error.message} (status ${error.status})`
            : "Error inesperado al consultar el backend.";
        setState({ status: "error", message });
      });
    return () => controller.abort();
  }, []);

  return (
    <main style={{ padding: "2rem", fontFamily: "system-ui, sans-serif" }}>
      <h1>Diagnóstico de conexión con el backend</h1>
      <p>
        Base URL: <code>{API_BASE_URL}</code>
      </p>

      {state.status === "loading" && <p>Consultando <code>/health</code>…</p>}

      {state.status === "ok" && (
        <div>
          <p style={{ color: "green", fontWeight: 600 }}>✅ Conexión establecida</p>
          <pre
            style={{
              background: "#f5f5f5",
              padding: "1rem",
              borderRadius: "8px",
              overflowX: "auto",
            }}
          >
            {JSON.stringify(state.data, null, 2)}
          </pre>
        </div>
      )}

      {state.status === "error" && (
        <div>
          <p style={{ color: "crimson", fontWeight: 600 }}>❌ No se pudo conectar</p>
          <p>{state.message}</p>
          <p>
            Verifica que el backend esté corriendo en <code>{API_BASE_URL}</code> y que{" "}
            <code>CORS_ORIGINS</code> incluya este origen.
          </p>
        </div>
      )}
    </main>
  );
}

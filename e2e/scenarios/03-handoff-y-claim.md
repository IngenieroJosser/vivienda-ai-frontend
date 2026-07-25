# Escenario 3 — Handoff del prospecto al asesor (claim)

> **Crítico para la demo.** Demuestra que la oportunidad efectivamente cruza de la orientación al workflow comercial.

## Perfiles usados

- **Jonathan** (prospecto) — sigue el flujo del escenario 1 hasta solicitar contacto.
- **Asesor demo** — token `ADVISOR` vigente.

## Precondiciones

- Escenario 1 ejecutado: Jonathan aparece en la bandeja con `handoff_requested = true`.
- Token vigente de asesor.

## Pasos

### 1. Asesor entra a la bandeja

1. Abrir `http://localhost:3000/asesor/leads` con el token cargado.
2. Confirmar que Jonathan está en la lista.

### 2. Asesor abre el detalle

1. Pulsar la tarjeta de Jonathan.
2. Confirmar que el detalle carga con:
   - Estado actual visible.
   - Sección **Actividad** o **Workflow** visible.
   - Botón **Tomar oportunidad** o **Claim** visible.

### 3. Asesor reclama la oportunidad

1. Pulsar **Tomar oportunidad**.
2. Verificar en Network un `POST /api/v1/leads/{id}/claim` con `200`.
3. Verificar que el botón desaparece o cambia a "Liberar / Siguiente acción".

### 4. Verificar cambio de estado

1. Confirmar que el `commercial_state` ahora es `ASSIGNED`.
2. Confirmar que `assigned_advisor_id` coincide con el `sub` del token.
3. Confirmar que `workflow_version` se incrementó en 1.

## Resultado esperado

| Punto de verificación | Esperado |
|---|---|
| `POST /api/v1/leads/{id}/claim` | `200` con `CommercialWorkflowResponse` |
| `commercial_state` | `ASSIGNED` |
| `assigned_advisor_id` | igual al `sub` del token |
| `workflow_version` | ≥ 1 |
| `audit_events` | nuevo evento `LEAD_CLAIMED` registrado |

## Evidencia para la demo

- Captura del detalle antes del claim (botón visible).
- Captura del detalle después del claim (estado ASSIGNED).
- Captura de DevTools → Network con `POST /claim` 200.
- Captura de la respuesta JSON con `commercial_state` y `assigned_advisor_id`.

## Mensaje para el jurado

> "El reclamo es **atómico**: si dos asesores intentan reclamar la misma oportunidad al mismo tiempo, uno solo gana. El otro recibe un error 409 `LEAD_ALREADY_ASSIGNED`."

## Riesgos conocidos

- Si el token es de `SUPERVISOR` y no `ADVISOR`, el endpoint también acepta la operación.
- Si el lead ya está `CLOSED_*` o `OPTED_OUT`, el claim devuelve `409 INVALID_WORKFLOW_TRANSITION`.

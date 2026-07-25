# Escenario 2 — Prospecto no preparado

> **Crítico para la demo.** Demuestra la ruta de nutrición y que el sistema **NO** ofrece proyectos incompatibles a quien no está listo.

## Perfil usado

**Camila** — afiliada, ingresos bajos, sin ahorro, horizonte 6–12 meses.

```json
{
  "first_name": "Camila",
  "affiliation": "AFFILIATE",
  "income_range": "SMLV_1_2",
  "obligations": "medium",
  "savings": "none",
  "horizon": "6_12",
  "location": "Soacha",
  "household_size": "2",
  "subsidy_interest": "yes"
}
```

Resultado esperado del backend: `route = NURTURE_FINANCIAL` o `FINANCIAL_PREPARATION`, `priority = LOW`, sin proyectos compatibles o con proyectos de referencia.

## Precondiciones

- Backend activo en `:3001`.
- Frontend activo en `:3000`.
- BD inicializada.

## Pasos

### 1. Entrar al flujo con Camila

1. Abrir `http://localhost:3000` en navegador.
2. Hacer clic en el CTA → `/orientacion`.
3. Aceptar consentimiento.

### 2. Responder conversación con perfil de bajo ahorro

Mensajes sugeridos:
- "Sí, soy afiliada."
- "Vivo en Soacha."
- "Gano entre 1 y 2 salarios mínimos."
- "Tengo obligaciones medias (un crédito de vehículo)."
- "Aún no tengo ahorro para la cuota inicial."
- "Quiero comprar en los próximos 6 a 12 meses."
- "Somos 2 en la familia."

### 3. Verificar el resultado

1. Confirmar que la página de resultado muestra:
   - Ruta: **Preparación financiera** o **Acompañamiento**.
   - **NO** aparecen proyectos incompatibles (cuota inicial fuera de su capacidad).
   - Aparece un **plan de acompañamiento** con hitos.
2. Si aparecen proyectos, deben marcarse como **REFERENCIA**, no como coincidencia directa.

### 4. Verificar el plan de nutrición

1. El plan debe incluir al menos 3 hitos con fechas tentativas.
2. La fecha de revisión (`review_date`) debe estar entre 3 y 6 meses en el futuro.
3. El `next_action` debe sugerir una acción concreta (ej. "Aumentar ahorro programado", "Validar capacidad crediticia").

## Resultado esperado

| Punto de verificación | Esperado |
|---|---|
| `POST /api/v1/leads/sync` | `200` con `route` distinto a `READY_TO_CLOSE` |
| `priority` | `LOW` o `MEDIUM` |
| `recommendations` | máximo 1, marcado como `purpose = "REFERENCE"` |
| `nurture_plan` | presente con `milestones` y `review_date` |
| UI | muestra plan de hitos, NO CTA agresivo de "Solicitar contacto" |

## Evidencia para la demo

- Captura del resultado mostrando la ruta de nutrición y los hitos.
- Captura del JSON de respuesta (`POST /leads/sync`) mostrando `route` y `nurture_plan`.

## Mensaje para el jurado

> "El sistema **NO** recomienda proyectos incompatibles. Para Camila el camino es preparación financiera; el recomendador respeta la capacidad estimada."

## Riesgos conocidos

- Si `recommendations` está vacío, el frontend debe mostrar mensaje claro "No hay proyectos compatibles todavía".
- Si por error CatBoost devuelve proyectos no viables, el filtro de catálogo vigente debe excluirlos.

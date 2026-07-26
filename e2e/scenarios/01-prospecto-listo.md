# Escenario 1 — Prospecto preparado

> **Crítico para la demo.** Es el flujo que demuestra el cumplimiento del reto: un lead pagado se perfila y termina en manos del asesor con proyectos compatibles.

## Perfil usado

**Jonathan** — afiliado, ingresos altos, ahorro listo, horizonte 0–3 meses.

```json
{
  "first_name": "Jonathan",
  "affiliation": "AFFILIATE",
  "income_range": "SMLV_8_10",
  "obligations": "low",
  "savings": "ready",
  "horizon": "0_3",
  "location": "Bogotá",
  "household_size": "3",
  "subsidy_interest": "yes"
}
```

Resultado esperado del backend: `route = READY_TO_CLOSE`, `priority = HIGH`, hasta 3 proyectos compatibles.

## Precondiciones

- Backend activo en `:3001`.
- Frontend activo en `:3000`.
- BD inicializada con 18 proyectos.
- Token vigente de asesor (opcional para este escenario, requerido para el 3).

## Pasos

### 1. El prospecto entra al flujo

1. Abrir `http://localhost:3000` en el navegador.
2. Hacer clic en el CTA que lleva a `/orientacion`.
3. Confirmar que la página de consentimiento se muestra.

### 2. Aceptar consentimiento

1. Marcar el checkbox "Autorizo el tratamiento...".
2. Pulsar **Aceptar y conversar**.
3. Verificar que el input de mensaje queda enfocado.

### 3. Conversación adaptativa

1. Responder las preguntas que el sistema muestra. Mensajes sugeridos para reproducir el escenario Jonathan:
   - "Sí, soy afiliado a Colsubsidio."
   - "Estoy en Bogotá."
   - "Ganho entre 8 y 10 salarios mínimos."
   - "Tengo pocas obligaciones."
   - "Ya tengo el ahorro listo."
   - "Quiero comprar en los próximos 3 meses."
   - "Somos 3 en la familia."
   - "Sí me interesa saber sobre subsidios."
2. Esperar a que el sistema complete la conversación y redirija a `/orientacion/resultado/[id]`.

### 4. Verificar el resultado

1. Confirmar que la página de resultado muestra:
   - Ruta: **Listo para contacto**.
   - Hasta 3 tarjetas de proyectos.
   - Botón **Solicitar contacto**.
2. En DevTools → Network, verificar que hubo un `POST /api/v1/leads/sync` con `200`.

### 5. Solicitar handoff

1. Pulsar **Solicitar contacto**.
2. Completar el formulario modal con canal y horario preferido.
3. Confirmar que la respuesta muestra el handoff registrado.

### 6. Verificar la bandeja del asesor

1. Abrir `http://localhost:3000/asesor/leads` con el token de asesor en `.env.local`.
2. Confirmar que Jonathan aparece en la lista.
3. Confirmar que su `priority` es `HIGH` y su `route` es `READY_TO_CLOSE`.
4. Confirmar que `handoff_requested = true`.

## Resultado esperado

| Punto de verificación | Esperado |
|---|---|
| `POST /api/v1/leads/sync` | `200` con `lead_id` válido |
| `route` en respuesta | `READY_TO_CLOSE` |
| `priority` en respuesta | `HIGH` |
| `recommendations` | 1–3 proyectos vigentes y compatibles |
| `handoff.status` | `REQUESTED` tras paso 5 |
| `GET /api/v1/leads` | contiene el lead con `first_name = "Jonathan"` |
| Persistencia | recargar `/asesor/leads` mantiene al lead |

## Evidencia para la demo

- Captura del resultado en `/orientacion/resultado/[id]` mostrando ruta + proyectos.
- Captura de la bandeja con Jonathan arriba.
- Captura de DevTools → Network con el `POST /leads/sync` 200.
- Captura de DevTools → Network con `GET /leads` mostrando el lead.

## Comandos útiles

```bash
# Generar el token si expiró
cd vivienda-ai-backend
source .venv/bin/activate
python -m app.cli issue-token --sub advisor-demo --role ADVISOR --minutes 480

# Confirmar que Jonathan está en la bandeja
TOKEN="<pegar-token>"
curl -H "Authorization: Bearer $TOKEN" "http://127.0.0.1:3001/api/v1/leads?limit=5" \
  | python3 -m json.tool | grep -A 3 "Jonathan"
```

## Riesgos conocidos

- Si el recomendador CatBoost no está entrenado, `recommendations` puede estar vacío → fallback determinístico debe responder al menos 1 proyecto.
- Si el `LLM_PROVIDER=mock`, las respuestas del chat son determinísticas pero pueden sonar rígidas.

# Escenario 5 — Reclamo concurrente

> **Importante para la demo.** Demuestra que el reclamo atómico funciona: dos asesores no pueden tomar la misma oportunidad.

## Perfiles usados

- **Jonathan** — prospecto en estado `PENDING` o `IN_PROGRESS`.
- **Asesor A** — token `ADVISOR` con `sub = advisor-A`.
- **Asesor B** — token `ADVISOR` con `sub = advisor-B`.

## Precondiciones

- Backend activo.
- Jonathan en estado `PENDING` (sin asignar).
- Dos tokens emitidos con sub distinto.

## Pasos

### 1. Generar dos tokens

```bash
cd vivienda-ai-backend
source .venv/bin/activate

TOKEN_A=$(python -m app.cli issue-token --sub advisor-A --role ADVISOR --minutes 480 | python3 -c "import json,sys;print(json.load(sys.stdin)['access_token'])")
TOKEN_B=$(python -m app.cli issue-token --sub advisor-B --role ADVISOR --minutes 480 | python3 -c "import json,sys;print(json.load(sys.stdin)['access_token'])")
```

### 2. Obtener el lead_id de Jonathan

```bash
LEAD_ID=$(curl -H "Authorization: Bearer $TOKEN_A" "http://127.0.0.1:3001/api/v1/leads?limit=20" \
  | python3 -c "import json,sys;d=json.load(sys.stdin);print([x['id'] for x in d if x['first_name']=='Jonathan'][0])")
```

### 3. Reclamo concurrente (con `&` para paralelizar)

```bash
curl -X POST -H "Authorization: Bearer $TOKEN_A" \
  "http://127.0.0.1:3001/api/v1/leads/$LEAD_ID/claim" \
  -w "Asesor A → HTTP %{http_code}\n" &

curl -X POST -H "Authorization: Bearer $TOKEN_B" \
  "http://127.0.0.1:3001/api/v1/leads/$LEAD_ID/claim" \
  -w "Asesor B → HTTP %{http_code}\n" &

wait
```

### 4. Verificar el resultado

1. Uno de los dos `curl` debe responder `200`.
2. El otro debe responder `409` con código `LEAD_ALREADY_ASSIGNED`.
3. Confirmar con `GET /leads/{id}` que `assigned_advisor_id` es el ganador.

## Resultado esperado

| Punto de verificación | Esperado |
|---|---|
| Respuesta A | exactamente una de las dos es `200` |
| Respuesta B | la otra es `409` con `LEAD_ALREADY_ASSIGNED` |
| `assigned_advisor_id` | igual al `sub` del ganador |
| `audit_events` | un único evento `LEAD_CLAIMED` registrado |

## Evidencia para la demo

- Salida de los dos `curl` mostrando los status codes.
- Captura de la bandeja donde Jonathan aparece asignado solo a un asesor.
- Captura de la respuesta `409` mostrando `code: LEAD_ALREADY_ASSIGNED`.

## Mensaje para el jurado

> "El reclamo es atómico. No hay condición de carrera: la primera operación que llegue al servidor gana, la siguiente recibe 409."

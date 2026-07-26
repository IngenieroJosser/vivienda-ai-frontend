# Escenario 6 — Autorización y roles

> **Importante para la demo.** Demuestra que la API no expone oportunidades ajenas y que los roles se respetan.

## Perfiles usados

- **Jonathan** — prospecto ya reclamado por Asesor A.
- **Asesor A** — token `ADVISOR` con `sub = advisor-A`.
- **Asesor B** — token `ADVISOR` con `sub = advisor-B` (sin asignación sobre Jonathan).
- **Supervisor** — token `SUPERVISOR`.

## Precondiciones

- Backend activo.
- Jonathan en estado `ASSIGNED` a Asesor A (tras escenario 5).

## Pasos

### 1. Sin token: la bandeja devuelve 401

```bash
curl -i "http://127.0.0.1:3001/api/v1/leads?limit=5"
```

Resultado esperado: `HTTP 401` con `code: UNAUTHORIZED`.

### 2. Asesor B intenta acceder al lead de Asesor A

```bash
LEAD_ID="<pegar-id-de-jonathan>"
curl -i -H "Authorization: Bearer $TOKEN_B" \
  "http://127.0.0.1:3001/api/v1/leads/$LEAD_ID"
```

Resultado esperado: `HTTP 403` con `code: RESOURCE_FORBIDDEN`.

### 3. Asesor B intenta modificar el workflow del lead ajeno

```bash
curl -i -X PATCH -H "Authorization: Bearer $TOKEN_B" \
  -H "Content-Type: application/json" \
  -d '{"target_state":"IN_PROGRESS","workflow_version":1}' \
  "http://127.0.0.1:3001/api/v1/leads/$LEAD_ID/workflow"
```

Resultado esperado: `HTTP 403` con `code: RESOURCE_FORBIDDEN`.

### 4. Asesor A puede ver y modificar el lead

```bash
curl -i -H "Authorization: Bearer $TOKEN_A" \
  "http://127.0.0.1:3001/api/v1/leads/$LEAD_ID"
```

Resultado esperado: `HTTP 200` con el detalle del lead.

### 5. Supervisor reasigna a Asesor B

```bash
TOKEN_SUPER=$(python -m app.cli issue-token --sub supervisor-1 --role SUPERVISOR --minutes 480 | python3 -c "import json,sys;print(json.load(sys.stdin)['access_token'])")

curl -i -X POST -H "Authorization: Bearer $TOKEN_SUPER" \
  -H "Content-Type: application/json" \
  -d '{"advisor_id":"advisor-B","reason":"rebalanceo","workflow_version":1}' \
  "http://127.0.0.1:3001/api/v1/leads/$LEAD_ID/assign"
```

Resultado esperado: `HTTP 200` con `assigned_advisor_id = "advisor-B"`.

### 6. Endpoints internos

```bash
curl -i "http://127.0.0.1:3001/api/v1/admin/scope"
curl -i "http://127.0.0.1:3001/api/v1/analytics/overview"
```

Resultado esperado (sin token): `HTTP 401`.
Resultado esperado (con token `ADVISOR`): `HTTP 403`.
Resultado esperado (con token `SUPERVISOR`): `HTTP 200`.

## Resultado esperado

| Punto de verificación | Esperado |
|---|---|
| `GET /leads` sin token | `401` |
| `GET /leads/{id}` de lead ajeno | `403 RESOURCE_FORBIDDEN` |
| `PATCH /leads/{id}/workflow` de lead ajeno | `403 RESOURCE_FORBIDDEN` |
| `POST /leads/{id}/assign` con `ADVISOR` | `403 FORBIDDEN` |
| `POST /leads/{id}/assign` con `SUPERVISOR` | `200` |
| `/admin/*`, `/analytics/*` sin token | `401` |

## Evidencia para la demo

- Salida de cada `curl` con su status code.
- Captura de la respuesta `403` con el código legible.

## Mensaje para el jurado

> "Cada operación valida el token, el rol y la propiedad de la oportunidad. No hay manera de leer o modificar un lead que no te pertenece."

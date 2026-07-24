# Arquitectura full-stack

## Decisión

Se utiliza un **monolito modular FastAPI** y no microservicios. Para una hackathon, esta decisión reduce despliegues y fallas operativas, pero mantiene límites de dominio que después pueden extraerse.

```text
Canales / frontend Next.js
          │
          ▼
      FastAPI /api/v1
          │
 ┌────────┼───────────────┬────────────────┐
 │        │               │                │
Leads  Scoring       Recomendador     Integraciones
 │        │               │                │
 └────────┴───────┬───────┴────────────────┘
                  ▼
             PostgreSQL
                  │
       ┌──────────┴──────────┐
       ▼                     ▼
  Auditoría             Analítica

Archivos raw → pipeline Python → processed/Parquet/CSV → seed/modelo
```

## Fronteras

### Frontend

- Captura contexto y respuestas.
- Mantiene experiencia rápida y continuidad local.
- Visualiza evaluación, recomendación, simulación y handoff.
- No contiene pesos ni decide la regla 90/10.

### Dominio backend

- Valida perfil.
- Calcula preparación.
- Aplica política de afiliación.
- Produce reason codes.
- Registra snapshots y latencia.

### Datos e IA

- Normaliza archivos.
- Genera EDA y métricas de calidad.
- Entrena y sirve el recomendador.
- Extrae señales desde texto con esquema Pydantic.
- Resume para el asesor sin inventar datos.

### Integraciones

- Adaptadores deshabilitados por defecto.
- Timeouts y fallback.
- Consentimiento y finalidad explícita.
- Ninguna integración externa es requisito para el flujo principal.

## Flujo end-to-end

1. El frontend crea o actualiza una sesión local.
2. `backend-sync.ts` envía un snapshot a `POST /api/v1/leads/sync`.
3. FastAPI hace upsert idempotente por `session_id`.
4. El motor calcula score, confianza, ruta y reason codes.
5. El recomendador filtra y ordena hasta tres proyectos.
6. Se guarda evaluación, recomendaciones, versiones y latencia.
7. El frontend conserva su flujo original y puede consultar inteligencia y simulaciones.
8. El asesor recibe contexto para validar y cerrar, no para empezar la exploración desde cero.

## Persistencia

Tablas principales:

- `leads`
- `conversation_turns`
- `lead_evaluations`
- `projects`
- `enrichments`
- `audit_events`
- `simulations`

SQLite funciona por defecto para demostración. Docker Compose utiliza PostgreSQL 16.

## Resiliencia

- El frontend no se bloquea si FastAPI no responde.
- El LLM tiene `MockLLMProvider`.
- El recomendador tiene fallback explicable.
- Enriquecimiento y Search Console son opcionales.
- Los datos de demo pueden restaurarse con `python -m app.cli seed`.

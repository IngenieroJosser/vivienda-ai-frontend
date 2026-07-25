# Pruebas E2E — Vivienda Match AI

> **Reto 03 · Perfilamiento inteligente de leads (Colsubsidio × 30X)**
> Siete escenarios que validan el recorrido crítico antes del **domingo 26/07/2026 11:30 a.m.**

## Propósito

Esta carpeta contiene los escenarios end-to-end que el equipo debe poder ejecutar el día de la demo. Cada escenario describe:

- **Qué perfil de prospecto se usa.**
- **Qué debe pasar en la UI y en el backend.**
- **Qué errores se esperan ver en condiciones controladas.**

Los escenarios se piensan como guía verificable. Funcionan como:

1. **Manual:** se ejecutan en navegador siguiendo los pasos numerados.
2. **Automatizado:** se traducen a tests Playwright (ver `tests/`).

## Prerrequisitos

| Pieza | Comando | Estado esperado |
|---|---|---|
| Backend corriendo | `cd vivienda-ai-backend && source .venv/bin/activate && python -m uvicorn app.main:app --reload --port 3001` | `http://127.0.0.1:3001/api/v1/health` → 200 |
| BD inicializada | `python -m app.cli db-init && python -m app.cli seed-projects` | 18 proyectos sembrados |
| Frontend corriendo | `cd vivienda-ai-frontend && npm run dev` | `http://localhost:3000` |
| Token de asesor | `python -m app.cli issue-token --sub advisor-demo --role ADVISOR --minutes 480` | Token JWT con `role: ADVISOR` |

## Cómo correr la suite (cuando los tests Playwright estén listos)

```bash
cd vivienda-ai-frontend
npm install --save-dev @playwright/test
npx playwright install chromium

# Toda la suite
npm run test:e2e

# Solo un escenario
npm run test:e2e -- 01-prospecto-listo

# Con video (útil para video de respaldo de la demo)
npm run test:e2e -- --video=on

# Modo interactivo para depurar
npm run test:e2e -- --ui
```

## Los siete escenarios

| # | Escenario | Carpeta | Riesgo si falla la demo |
|---|---|---|---|
| 1 | Prospecto preparado | [`scenarios/01-prospecto-listo.md`](scenarios/01-prospecto-listo.md) | 🔴 La promesa central del reto |
| 2 | Prospecto no preparado | [`scenarios/02-prospecto-no-listo.md`](scenarios/02-prospecto-no-listo.md) | 🔴 La ruta de nutrición no se demuestra |
| 3 | Handoff y claim | [`scenarios/03-handoff-y-claim.md`](scenarios/03-handoff-y-claim.md) | 🔴 El asesor nunca recibe el lead |
| 4 | Persistencia | [`scenarios/04-persistencia.md`](scenarios/04-persistencia.md) | 🔴 No se ve continuidad de sesión |
| 5 | Concurrencia | [`scenarios/05-concurrencia.md`](scenarios/05-concurrencia.md) | 🟠 El claim atómico no se prueba |
| 6 | Autorización | [`scenarios/06-autorizacion.md`](scenarios/06-autorizacion.md) | 🟠 Riesgo de seguridad visible |
| 7 | Degradación LLM | [`scenarios/07-degradacion-llm.md`](scenarios/07-degradacion-llm.md) | 🟠 La demo se rompe si el LLM falla |

## Convenciones de los escenarios

Cada archivo `NN-nombre.md` sigue esta estructura:

```markdown
# Escenario N — <nombre>

## Perfil usado
Datos sintéticos del prospecto (Jonathan, Laura, Camila, Andrés).

## Precondiciones
- Backend activo en :3001
- Token vigente de asesor
- ...

## Pasos
1. Acción 1
2. Verificar estado X
3. Acción 2
4. ...

## Resultado esperado
- Status 200 en endpoint Y
- UI muestra Z
- ...

## Evidencia para la demo
- Captura del estado final
- Log del endpoint
```

## Datos sintéticos

Los tres perfiles canónicos viven en [`fixtures/scenarios.ts`](fixtures/scenarios.ts):

- **Jonathan** — afiliado, ingresos altos, ahorro listo, horizonte 0–3 meses → `READY_TO_CLOSE`.
- **Laura** — no afiliada, ingresos medios, sin ahorro → `NON_AFFILIATE_REVIEW`.
- **Camila** — afiliada, ingresos bajos, sin ahorro → `NURTURE_FINANCIAL`.
- **Andrés** — comprador anterior (Ciudadela Maiporé 2021) → ruta dedicada de mejoramiento.

## Tokens

[`fixtures/auth.ts`](fixtures/auth.ts) lee el token de `.env.local` (`NEXT_PUBLIC_ADVISOR_ACCESS_TOKEN`) o emite uno nuevo con `app.cli issue-token` cuando se necesita un token fresco.

## Lo que NO cubre esta suite

- Producción (staging, CI, PostgreSQL, backups): pertenece a A4.8 (post-demo).
- Scraping o enriquecimiento externo: deshabilitado por consentimiento y por el alcance del reto.
- Aprobación de crédito o DataCrédito: explícitamente fuera del alcance.
- Multi-proveedor LLM: el MVP usa un único proveedor configurable.

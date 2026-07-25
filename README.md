# Vivienda Match AI — Frontend

Experiencia digital para el reto de Vivienda Colsubsidio. El producto combina
información conocida y una conversación natural para orientar al prospecto y
entregar oportunidades accionables al equipo comercial.

Está construido con Next.js 16, React 19, TypeScript y Tailwind CSS. El frontend
consume los servicios FastAPI disponibles y conserva una experiencia local
funcional cuando la API no responde.

## Ejecución local

Requisitos:

- Node.js 20 o superior.
- npm 10 o superior.
- Backend de Vivienda Match AI para probar los recorridos conectados.

Crea `.env.local`:

```dotenv
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
```

Luego ejecuta:

```bash
npm install
npm run dev
```

La aplicación queda disponible en `http://localhost:3000`.

## Validación

```bash
npm run lint
npm test
npm run build
```

## Recorridos activos

### Prospecto

- `/` — entrada pública centrada en la conversación.
- `/orientacion` — identificación, consentimiento e inicio.
- `/orientacion/[sessionId]` — conversación libre y recuperable.
- `/orientacion/resultado/[sessionId]` — resultado, proyectos y siguiente paso.
- `/vivienda/proyectos` — catálogo de proyectos.
- `/vivienda/proyectos/[id]` — información, galería y recursos de cada proyecto.
- `/vivienda/agendar` — preferencia de contacto y horario.

### Equipo comercial

- `/login` — acceso local al recorrido comercial.
- `/asesor` y `/asesor/resumen` — prioridades y estado de atención.
- `/asesor/leads` — bandeja de oportunidades.
- `/asesor/leads/[id]` — detalle, recomendación y evidencia disponible.
- `/asesor/agenda` — actividades y seguimientos.
- `/asesor/nutricion` — acompañamiento de prospectos en preparación.
- `/asesor/comparador` — comparación contextual de proyectos; no forma parte de
  la navegación principal.

## Integración con servicios

La URL base se configura mediante `NEXT_PUBLIC_API_URL`. Durante la
demostración, las vistas internas también requieren
`NEXT_PUBLIC_ADVISOR_ACCESS_TOKEN`. Puede generarse desde el backend:

```powershell
python -m app.cli issue-token --sub advisor-demo --role ADVISOR --minutes 480
```

El token firmado es únicamente para la demostración local y expira. En una
integración productiva debe obtenerse después de autenticar al asesor, no
incorporarse al bundle público. Los recorridos conectados usan actualmente:

- `POST /leads/sync` para conservar una versión de la sesión y obtener el
  resultado canónico.
- `POST /leads/{id}/handoff` para persistir la solicitud y preferencia de
  contacto.
- `PUT /leads/{id}/nurture` para persistir hitos y estado del acompañamiento.
- `GET /leads` para alimentar la bandeja comercial.
- `GET /leads/{id}` para consultar perfil, conversación, recomendaciones y
  trazabilidad.

Las rutas de asesor y acompañamiento envían Bearer Token; la sincronización y
la solicitud inicial de contacto permanecen públicas.

La sesión se guarda primero en el dispositivo. La sincronización ocurre en
segundo plano y no bloquea la conversación. Si el servicio no está disponible,
la interfaz mantiene los datos locales y presenta estados recuperables. Cuando
el backend responde, su nivel, ruta, capacidad, plan y recomendaciones son la
fuente autoritativa para la presentación.

Los contratos TypeScript se generan desde el OpenAPI versionado del backend:

```bash
npm run api:types
```

El resultado se conserva en `lib/api/generated.ts`; no debe editarse a mano.

## Arquitectura

| Módulo                  | Responsabilidad                                          |
| ----------------------- | -------------------------------------------------------- |
| `features/prospect`     | Sesión, consentimiento, conversación y resultado público |
| `features/conversation` | Evaluación, adaptación y bandeja unificada               |
| `features/advisor`      | Flujo comercial, actividad y agenda                      |
| `features/nurturing`    | Planes y progreso de acompañamiento                      |
| `lib/api`               | Cliente HTTP y contratos de servicios                    |
| `lib/housing-catalog`   | Catálogo, fuentes y consultas de proyectos               |
| `components`            | Identidad, navegación, feedback y presentación compartida |

La capacidad, prioridad, beneficios y coincidencias se reciben como resultados
explicables. Prospecto y asesor comparten los mismos identificadores de sesión,
oportunidad y proyecto.

Los estados vacíos y los errores recuperables consumen `FeedbackState`. Los
skeletons permanecen junto a cada recorrido porque reproducen la estructura
real del contenido y evitan saltos de layout.

## Sistema visual

Los tokens y superficies autorizadas están en `app/globals.css`. La
especificación completa se mantiene en `docs/SISTEMA_VISUAL_V1.md`.

El sistema diferencia una experiencia guiada para el prospecto y una densidad
operativa para el asesor. El blur está limitado a superficies autorizadas,
cuenta con fallback sólido y respeta `prefers-reduced-motion`.

Manrope se sirve mediante `next/font/local` desde un único archivo variable
WOFF2. Su licencia SIL OFL está versionada junto a la fuente en `app/fonts`.

En móvil, las galerías usan desplazamiento nativo con ajuste por imagen. El
visor ampliado acepta gestos horizontales y conserva botones accesibles como
alternativa; ambos controles desaparecen cuando solo existe una imagen.

La suite protege las reglas principales del sistema:

- No permite colores, gradientes o sombras directas en módulos de interfaz.
- Impide texto público de 9 o 10 px.
- Detecta vocabulario interno o técnico en textos visibles.
- Verifica la carga diferida y la configuración de imágenes y visores.
- Comprueba umbral, dirección y predominio horizontal de los gestos de galería.
- Confirma que la fuente local y su variable CSS permanezcan conectadas.

---

## Estado de la integración al 2026-07-25

> **Rama:** `feature/Alejandro` (basada en `feature/integration-between-back&front` + merge de `Erick`)
>
> **Fecha límite del reto:** domingo 26/07/2026 11:30 a. m. (hora Colombia)

### Quién hizo qué — dependencia de Alejandro con Erick y Josser

Alejandro **depende** del trabajo de Erick (cliente API) y de Josser (backend + chat LLM).
Esta sección documenta las dependencias y contribuciones para que el equipo
pueda continuar sin ambigüedad.

#### Contribuciones de Erick (merge del 24/07, commit `c32950b`)

Erick construyó la capa de transporte que Alejandro consume directamente.
**Sin esto, mi A1 y A2 no existirían.**

| Archivo | Función que Alejandro usa |
|---|---|
| `lib/api/leads.ts` | `claimLead`, `updateWorkflow`, `createActivity`, `listActivities`, `listLeads` con filtros |
| `lib/api/commercial-operations.ts` | `claimLeadAndRefresh`, `updateWorkflowAndRefresh`, `createActivityAndRefresh` |
| `lib/api/commercial-errors.ts` | `getCommercialErrorMessage` para traducir códigos del backend |
| `lib/api/__tests__/commercial-operations.test.ts` | Tests que validan el cliente |
| `lib/api/__tests__/commercial-errors.test.ts` | Tests que validan la traducción de errores |
| `lib/api/__tests__/leads.test.ts` | +163 líneas de tests |

**Estado actual:** Erick cumple E1, E2, E4 (parcial). E3 bloqueado por J3.

#### Contribuciones de Alejandro (este repo, `feature/Alejandro`)

| Commit | Archivo | Qué hace |
|---|---|---|
| `c32561a` | `ROADMAPV4.md` | Mirror del roadmap versionado en el frontend |
| `081f54a` | `e2e/` (nuevo) | 7 escenarios documentados para la demo |
| `3a34686` | `app/asesor/leads/[id]/page.tsx` | Wrapper que soporta IDs sin scenario local |
| `f866b1d` | `features/advisor/components/backend-lead-detail.tsx` | **A1** — `AdvisorActionsPanel` con claim/workflow/activity |
| `490ddc4` | `features/advisor/components/commercial-dashboard.tsx` | **A2** — Dashboard con tres secciones del backend |
| `71e72a6` | `README.md` | Esta documentación |
| `d1c85a4` | `scripts/seed-demo-leads.py` | Crea 4 prospectos canónicos directo en BD |
| `c286438` | `features/advisor/components/backend-lead-detail.tsx` | SLA badge visual |

**Estado actual:** Alejandro cumple A1, A2 (completados). A3 bloqueado por J3. A4 en proceso.

#### Pendiente de Josser (backend)

Josser es el dueño del backend y de las decisiones regulatorias. Alejandro
**no puede avanzar** en A3 hasta que Josser libere lo siguiente:

| Pieza | Por qué bloquea Alejandro |
|---|---|
| `J1` — Proteger `/admin/*`, `/analytics/*`, `/ai/*` | Riesgo de seguridad visible en la demo |
| `J2` — Denylist de features y eliminar bono de campaña | El recomendador aún sesga por `channel`/`campaign` |
| `J3` — `POST /leads/{id}/chat/messages` | Sin este endpoint, A3 no puede progresar |
| `J4` — Contrato final congelado | Estabiliza el alcance de la demo |

---

### ✅ Lo que funciona end-to-end (probado el 25/07)

| Verificado | Detalle |
|---|---|
| ✅ `GET /health` | Backend responde 200 en `:3001` |
| ✅ `GET /projects` y `GET /projects/{id}` | 18 proyectos sembrados |
| ✅ `GET /leads` (con token) | Bandeja real del asesor con filtros `pendingAssignment`, `assignedToMe`, `slaOverdue` |
| ✅ `GET /leads/{id}` (con token) | Detalle con perfil, discovery, evaluation, journey, commercial_workflow |
| ✅ `POST /leads/{id}/claim` | Reclamo atómico (probado con `83453dbf-...`) |
| ✅ `PATCH /leads/{id}/workflow` | Cambio de estado con `workflow_version` (workflow ahora en IN_PROGRESS v4) |
| ✅ `POST /leads/{id}/activities` | Registro con `Idempotency-Key` (probado, ID `fd145d93-3f6e-4629-b0d9-72caf1722272`) |
| ✅ `GET /leads/{id}/activities` | Lista de actividades registradas |
| ✅ `GET /asesor` y `/asesor/leads` | Dashboard con tres secciones (Por reclamar, Asignadas a mí, SLA vencido) |

### ❌ Lo que falta

- ❌ **A3 — Chatbot con backend** (`POST /leads/{id}/chat/messages` aún no existe en backend, dependencia de Josser).
- ❌ Video de respaldo de la demo.
- ❌ Capturas de pantalla del flujo completo.
- ❌ Selector visual de escenarios para demo (`/_dev/seed` o `/demo`).

---

## Cambios aplicados en esta rama

### Merge de la rama `Erick` (1 commit)

```
c32950b  merge: bring in Erick's A4.7 API integration (claim, workflow, activities)
c496ee0  feat(advisor-api): integrate commercial workflow operations
```

**Archivos recibidos de Erick:**

| Archivo | Qué agrega |
|---|---|
| `lib/api/leads.ts` | `claimLead`, `updateWorkflow`, `createActivity` (con `Idempotency-Key`), `listActivities` y filtros de `listLeads` (`assignedToMe`, `pendingAssignment`, `commercialState`, `slaOverdue`, `overdueFollowUp`, `nextAction`, `reevaluationDate`) |
| `lib/api/commercial-operations.ts` | Helpers `claimLeadAndRefresh`, `updateWorkflowAndRefresh`, `createActivityAndRefresh` que devuelven `{ workflow, lead, activities }` |
| `lib/api/commercial-errors.ts` | `getCommercialErrorMessage` traduce códigos (`LEAD_ALREADY_ASSIGNED`, `STALE_WORKFLOW_VERSION`, `INVALID_WORKFLOW_TRANSITION`, `TERMINAL_WORKFLOW_IMMUTABLE`, `ACTIVITY_IDEMPOTENCY_CONFLICT`, `RESOURCE_FORBIDDEN`) |
| `lib/api/__tests__/commercial-operations.test.ts` | 95 líneas de tests |
| `lib/api/__tests__/commercial-errors.test.ts` | 44 líneas de tests |
| `lib/api/__tests__/leads.test.ts` | +163 líneas (tests ampliados) |

**Por qué importan estos cambios:** sin ellos, no podríamos llamar a `claim`/`workflow`/`activities` desde el frontend. Erick dejó la capa de transporte lista; Alejandro solo la consume.

### Cambios propios de `feature/Alejandro`

| Archivo | Qué hace |
|---|---|
| `features/advisor/components/backend-lead-detail.tsx` | Agrega `AdvisorActionsPanel` con botones `claim`/`workflow`/`activity`, pestaña "Actividades" con `listActivities`, manejo de 404 `COMMERCIAL_WORKFLOW_NOT_FOUND`, escucha del evento `vivienda:lead-refresh` |
| `app/asesor/leads/[id]/page.tsx` | Soporta IDs sin scenario local (título genérico) |
| `e2e/README.md` y `e2e/scenarios/*.md` | Documentación de los 7 escenarios E2E obligatorios del ROADMAPV4 |

### Regeneración de tipos

```bash
npx openapi-typescript ../vivienda-ai-backend/docs/openapi.json -o lib/api/generated.ts
```

`generated.ts` actualizado para incluir `commercial_workflow` y `CommercialWorkflowResponse`.

---

## Pruebas manuales realizadas (25/07)

### 1. Verificar backend y crear token

```bash
cd ../vivienda-ai-backend
source .venv/bin/activate
python -m app.cli issue-token --sub advisor-demo --role ADVISOR --minutes 480
```

Copiar el token a `vivienda-ai-frontend/.env.local` como `NEXT_PUBLIC_ADVISOR_ACCESS_TOKEN`.

### 2. Crear lead Jonathan (perfil de listo)

```bash
TOKEN=$(... )

curl -X POST -H "Content-Type: application/json" \
  -d "{
    \"session_id\":\"demo-jonathan-$(date +%s)\",
    \"session_version\":1,
    \"lead_id\":null,
    \"first_name\":\"Jonathan\",
    \"acquisition\":{\"source\":\"meta\",\"campaign\":\"vivienda_junio\",\"content\":\"home\",\"lead_reference\":null,\"is_paid\":true},
    \"status\":\"IN_PROGRESS\",
    \"consent_accepted_at\":\"2026-07-25T10:00:00Z\",
    \"customer_relationship\":\"NEW\",
    \"profile\":{\"affiliation\":\"AFFILIATE\",\"location\":\"Bogotá\",\"income_range\":\"SMLV_8_10\",\"obligations\":\"low\",\"savings\":\"ready\",\"horizon\":\"0_3\",\"household_size\":\"3\",\"subsidy_interest\":\"yes\"},
    \"discovery\":{\"housing_vision\":\"PRIMARY\",\"intended_for\":\"FAMILY\",\"motivation\":\"Mejor ubicación\",\"obstacle\":\"\",\"advance_need\":\"\"},
    \"turns\":[{\"id\":\"t1\",\"user_text\":\"Soy afiliado, ingresos altos\",\"assistant_text\":\"Excelente\",\"extracted_fields\":[],\"created_at\":\"2026-07-25T10:00:00Z\"}],
    \"created_at\":\"2026-07-25T10:00:00Z\",
    \"updated_at\":\"2026-07-25T10:00:00Z\"
  }" \
  "http://127.0.0.1:3001/api/v1/leads/sync"
# → route: READY_TO_CLOSE, recommendations: [Araucaria, Inari, Los Nogales]
```

### 3. Crear handoff (crea workflow en PENDING)

```bash
curl -X POST -H "Content-Type: application/json" \
  -d '{"channel":"WHATSAPP","time_preference":"Mañana 9-12","project_ids":[],"requested_at":"2026-07-25T12:00:00Z"}' \
  "http://127.0.0.1:3001/api/v1/leads/$LEAD_ID/handoff"
# → handoff.status: REQUESTED, workflow.state: PENDING
```

### 4. Probar UI completa

```
http://localhost:3000/asesor/leads/83453dbf-999e-4989-a168-c2c50a54c884
```

Pasos verificados:

1. ✅ Sección "Acciones del asesor" visible arriba de "Perfil y contexto".
2. ✅ Botón "Tomar oportunidad" presente (workflow PENDING, sin asignar).
3. ✅ Click → `POST /claim` 200, UI muestra `Estado actual: ASSIGNED`.
4. ✅ Selector "Nuevo estado" cambia a `IN_PROGRESS`, click "Aplicar cambio" → `PATCH /workflow` 200.
5. ✅ Formulario "Registrar nueva actividad" con tipo/canal/resultado/nota.
6. ✅ Click "Registrar actividad" → `POST /activities` 201 con `Idempotency-Key` automático.
7. ✅ Pestaña "Actividades" muestra la entrada recién creada.

### 5. Validar persistencia

- `Ctrl+R` en la página del detalle: el estado sigue en `IN_PROGRESS`, la actividad sigue visible.
- `GET /leads/{id}/activities` vía curl: 1 actividad registrada con ID real (`fd145d93-3f6e-4629-b0d9-72caf1722272`).

### 6. Resetear workflow para repetir pruebas

Si necesitas probar el flujo de claim desde cero:

```bash
sqlite3 vivienda_match.db "UPDATE lead_commercial_workflows SET state='PENDING', assigned_advisor_id=NULL, workflow_version=1 WHERE lead_id='83453dbf-999e-4989-a168-c2c50a54c884'"
sqlite3 vivienda_match.db "DELETE FROM lead_activities WHERE lead_id='83453dbf-999e-4989-a168-c2c50a54c884'"
```

(No es código de producto; solo atajo de desarrollo para repetir la demo.)

---

## Estado del ROADMAPV4 (secciones A1–A4, Alejandro)

### ✅ Completado

- **A1 — Detalle operativo del asesor (P0)**
  - ✅ Renderizar `CommercialActions` desde el panel de acciones (claim, workflow, actividad).
  - ✅ Mostrar estado actual, asesor asignado, próxima acción, versión del workflow.
  - ✅ Mostrar historial persistido de actividades (pestaña "Actividades").
  - ✅ Estados de carga, vacío, error y reintento en `listActivities`.
  - ✅ Recargar el detalle después de mutaciones (evento `vivienda:lead-refresh`).

### 🟡 En proceso

- 🟡 A1 — Eliminar lecturas canónicas desde `features/advisor/storage.ts`: parcialmente. `AdvisorActionsPanel` ya no lee del storage local, pero `commercial-dashboard.tsx` (A2) todavía sí.

### ❌ Sin terminar

- ❌ **A2 — Dashboard mínimo del asesor (P1)**: tres vistas (por reclamar, asignadas a mí, SLA vencido).
- ❌ **A3 — Experiencia del chat (P0)**: pendiente del endpoint `POST /leads/{id}/chat/messages` que libera Josser (backend bloqueante).
- ❌ **A4 — Datos de demo y presentación**: video, capturas, datos sintéticos para 4 prospectos canónicos.

### ✅ Completado por Erick (en el merge)

- ✅ **E1** — Tipos regenerados desde OpenAPI; estados sintéticos eliminados en mi código.
- ✅ **E2** — Cliente API de A4.7: `claimLead`, `updateWorkflow`, `createActivity` con `Idempotency-Key`, `listActivities`, errores traducidos.
- ✅ **E4** — Tests nuevos para cliente API: 17 tests adicionales (164 totales, 31 archivos).

### ❌ Pendiente de Josser

- ❌ **J1** — Proteger `/admin/*`, `/analytics/*`, `/ai/*` (siguen públicos).
- ❌ **J2** — Allowlist/denylist de features en scoring y recomendador.
- ❌ **J3** — Chat con LLM configurable, fallback determinístico, credencial de prospecto.
- ❌ **J4** — Contrato final congelado y OpenAPI sincronizado.

---

## Para el equipo (información útil)

### Bugs del backend pendientes (no resueltos en esta rama)

1. **`POST /leads/sync` con `session_version: 1` retorna `409 SESSION_VERSION_IN_PROGRESS`** incluso cuando el `session_id` es único. Imposible crear más leads vía API. Workaround: usar leads existentes (`83453dbf-...`, `9713a35d-...`, `d1905483-...`).
2. **`handoff.status === NOT_REQUESTED`** para leads con `route: NURTURE` aunque exista el workflow. El backend rechaza con `409 HANDOFF_NOT_ALLOWED`.
3. **Las rutas `/admin/*`, `/analytics/*`, `/ai/*` están públicamente accesibles** sin token. Riesgo de seguridad previo a despliegue.

### Decisiones que necesitan confirmarse

- ¿Persistir el chat del prospecto en `conversation_turns` (existente) o crear `chat_messages`? Josser ya extendió `conversation_turns` con metadatos LLM; A4.8 los normaliza.
- ¿Quién emite los tokens en producción? El CLI actual es demo-only.
- ¿Qué hacer con leads NURTURE que no piden handoff en N meses? (Reactivación, archivo, lead scoring).

### Setup local rápido

```bash
# Terminal 1 — backend
cd vivienda-ai-backend
source .venv/bin/activate
python -m app.cli db-init
python -m app.cli seed-projects
python -m uvicorn app.main:app --reload --port 3001

# Terminal 2 — frontend
cd vivienda-ai-frontend
echo "NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1" > .env.local
echo "NEXT_PUBLIC_ADVISOR_ACCESS_TOKEN=$(python -m app.cli issue-token --sub advisor-demo --role ADVISOR --minutes 480 | python3 -c 'import json,sys;print(json.load(sys.stdin)[\"access_token\"])')" >> .env.local
npm install
npm run dev

# Validación
npm test
```

### Leads de prueba disponibles al 25/07

| `lead_id` | `first_name` | `route` | `workflow.state` | Para qué sirve |
|---|---|---|---|---|
| `83453dbf-...` | Jonathan | READY_TO_CLOSE | **IN_PROGRESS v4** | Demo end-to-end del flujo comercial |
| `9713a35d-...` | (null) | NURTURE | None | Mostrar mensaje "sin handoff" en la UI |
| `d1905483-...` | smoke | NURTURE | None | Smoke / pruebas |

### Cómo conectar el dashboard (A2, próxima tarea)

1. En `commercial-dashboard.tsx`, reemplazar `useCommercialStates()` y `useQualifiedLeads()` por:
   ```ts
   import { listLeads } from "@/lib/api/leads";
   const [opportunities, setOpportunities] = useState([]);
   useEffect(() => {
     listLeads({ assignedToMe: true }).then(setOpportunities);
   }, []);
   ```
2. Añadir selectores para `pendingAssignment: true`, `slaOverdue: true`, `overdueFollowUp: true`.
3. Mantener el orden que devuelve el backend (`PRIORITY_ORDER`).

### Cómo conectar el chat (A3, depende de Josser)

1. Esperar a que Josser libere `POST /leads/{id}/chat/messages` con credencial de prospecto.
2. Erick generará `lib/api/chat.ts` con `sendProspectMessage(leadId, content)` y `getProspectConversation(leadId)`.
3. En `prospect-conversation.tsx`, reemplazar `answerProspectMessage()` por la llamada al backend.
4. Mantener el motor determinístico como fallback.

---

## Pruebas automatizadas (vitest)

```bash
npm test
```

```
Test Files  31 passed (31)
Tests        164 passed (164)
```

Detalle:
- Tests previos a merge: 147
- Tests nuevos por Erick (en `lib/api/__tests__/`): +17
- Tests propios de Alejandro: 0 nuevos (no agregué tests todavía — pendiente)

---

## Comando rápido de validación manual

```bash
# Estado del backend
curl http://127.0.0.1:3001/api/v1/health

# Bandeja del asesor
TOKEN=$(cd ../vivienda-ai-backend && source .venv/bin/activate && \
  python -m app.cli issue-token --sub advisor-demo --role ADVISOR --minutes 480 | \
  python3 -c "import json,sys;print(json.load(sys.stdin)['access_token'])")
curl -H "Authorization: Bearer $TOKEN" "http://127.0.0.1:3001/api/v1/leads?limit=10" | python3 -m json.tool
```

---

## Próximos pasos inmediatos (orden)

1. **Video de respaldo** (sábado 26/07 10:00-11:00).
2. **Ensayo E2E** con los 4 prospectos (sábado 14:00-17:00).
3. **Capturas de pantalla** durante el ensayo.

---

## Contactos rápidos

- **Backend / IA / Scoring**: Josser.
- **Cliente API / Mapper**: Erick.
- **Páginas, UX, E2E, demo**: Alejandro (este repo, `feature/Alejandro`).
- **Fecha límite**: domingo 26/07/2026 11:30 a. m. (hora Colombia).

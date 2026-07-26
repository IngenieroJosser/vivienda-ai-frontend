# Vivienda Match AI — Guía de implementación del chatbot

## 1. Resultado entregado

La solución integra el frontend actual con un backend FastAPI que centraliza el
perfilamiento. El flujo cubre las tres tareas solicitadas:

1. **Chatbot contextualizado al reto**: usa un LLM mediante OpenAI Agents SDK,
   salida estructurada, persistencia y fallback determinístico.
2. **Dashboard `/asesor`**: recibe los leads, su ruta, capacidad preliminar,
   señales de afiliación, recomendaciones, acompañamiento y trazabilidad.
3. **Tabla `chat_leads`**: conserva cada intercambio y permite un ciclo de
   aprendizaje supervisado, sin reentrenar automáticamente el LLM con datos sin
   revisar.

## 2. Arquitectura

```text
Meta / Google / WhatsApp / formulario / sitio web
                         │
                         ▼
                    Next.js 16
                         │
        POST /api/v1/conversations/{id}/messages
                         │
                         ▼
                     FastAPI
                         │
        ┌────────────────┼────────────────┐
        ▼                ▼                ▼
 OpenAI Agents SDK   Reglas oficiales   Persistencia
 comprensión/tono    scoring, 90/10,     SQLAlchemy
 herramientas        rutas y nutrición   ChatLead
        │                │                │
        └────────────────┼────────────────┘
                         ▼
          proyecto, asesor o acompañamiento
```

El LLM **no decide** aprobación de crédito, subsidios, disponibilidad ni la
regla 90/10. Comprende y conversa; FastAPI valida y toma la decisión oficial.

## 3. Qué hace el chatbot

- Usa fuente, campaña y datos ya conocidos para no repetir preguntas.
- Confirma afiliación temprano.
- Recoge de manera progresiva ubicación, horizonte, ingresos, obligaciones,
  ahorro, propiedad de vivienda y situación crediticia declarada.
- Calcula preparación, confianza y capacidad orientativa.
- Si el lead está listo, muestra hasta tres proyectos compatibles con el
  presupuesto estimado y prepara el handoff al asesor.
- Si no está listo, continúa dentro del mismo chat con una meta de ahorro,
  reducción de obligaciones, preferencia de seguimiento y fecha de revisión.
- Si es no afiliado, consulta el motor demostrativo 90/10 y puede enviarlo a
  revisión o lista regulatoria sin descartarlo.
- Si OpenAI no está disponible, usa el flujo determinístico y mantiene la
  conversación operativa.

## 4. Instalación del backend

Desde PowerShell:

```powershell
cd vivienda-match-ai-backend
py -3.12 -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip setuptools wheel
python -m pip install -r requirements-dev.txt
Copy-Item .env.example .env
```

También puedes ejecutar:

```powershell
.\setup_windows.ps1
```

### Configuración de `.env`

```dotenv
APP_PORT=3001
DATABASE_URL=sqlite:///./vivienda_match.db
CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000

JWT_SECRET=cambia-esto-por-un-secreto-de-32-caracteres-o-mas

LLM_PROVIDER=openai_agents
OPENAI_API_KEY=tu_clave_del_proyecto
OPENAI_BASE_URL=https://api.openai.com/v1
OPENAI_MODEL=gpt-5.4-mini
OPENAI_AGENT_MAX_TURNS=4
OPENAI_AGENT_TRACING=false
OPENAI_AGENT_STORE=false
AGENT_FALLBACK_ENABLED=true

REGULATORY_MODE=DEMO
REGULATORY_NON_AFFILIATE_LIMIT=0.10
REGULATORY_DEMO_AFFILIATE_SALES=90
REGULATORY_DEMO_NON_AFFILIATE_SALES=8
```

El modelo es configurable. Usa un modelo habilitado en tu proyecto de OpenAI.
La clave debe permanecer exclusivamente en FastAPI; nunca debe declararse en
`NEXT_PUBLIC_*`.

## 5. Procesar datos y entrenar el recomendador

Las carpetas `data/processed`, `reports` y `artifacts` se entregan vacías. Los
archivos originales están en `data/raw`.

Ejecuta manualmente:

```powershell
python -m app.cli validate-raw
python -m app.cli clean-buyers
python -m app.cli clean-resources
python -m app.cli extract-personas
python -m app.cli build-projects
python -m app.cli validate-processed
python -m app.cli eda
python -m app.cli train
```

El modelo CatBoost usa `project_id` como objetivo para estimar afinidad
histórica entre proyectos. No representa probabilidad de compra ni aprobación
de crédito.

## 6. Crear la base y cargar proyectos

```powershell
python -m app.cli db-init
python -m app.cli seed-projects
```

Esto crea, entre otras, las tablas:

```text
leads
conversation_turns
lead_journey_states
lead_evaluations
project_recommendations
nurture_plans
lead_commercial_workflows
lead_activities
regulatory_quotas
chat_leads
```

## 7. Verificar el agente

```powershell
python -m app.cli agent-check
```

Con la API configurada debe aparecer:

```json
{
  "status": "ok",
  "agent_mode": "OPENAI_AGENTS"
}
```

Sin clave o ante un error aparecerá:

```json
{
  "status": "fallback",
  "agent_mode": "DETERMINISTIC_FALLBACK"
}
```

## 8. Iniciar FastAPI

```powershell
python -m uvicorn app.main:app --reload --port 3001
```

Verifica:

```text
http://localhost:3001/docs
http://localhost:3001/api/v1/health
```

## 9. Instalar el frontend

En otra terminal:

```powershell
cd vivienda-match-ai-frontend
Copy-Item .env.example .env.local
npm install
```

Genera un token temporal para el asesor desde el backend:

```powershell
python -m app.cli issue-token --sub advisor-demo --role ADVISOR --minutes 480
```

Configura `frontend/.env.local`:

```dotenv
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
NEXT_PUBLIC_ADVISOR_ACCESS_TOKEN=pega_aqui_el_token
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Inicia:

```powershell
npm run dev
```

## 10. Recorrido funcional

1. Abre `http://localhost:3000/orientacion`.
2. Acepta el consentimiento.
3. Conversa de forma natural. Ejemplo:

```text
Busco un apartamento para mi esposo, mi hija y para mí.
Mi esposo está afiliado a Colsubsidio.
Entre los dos ganamos cinco millones al mes.
Pagamos setecientos mil pesos en créditos.
Tenemos veinte millones entre ahorro y cesantías.
No tenemos vivienda y queremos comprar este año.
```

4. Revisa el resultado y los proyectos sugeridos.
5. Abre `http://localhost:3000/asesor/leads`.
6. Consulta el detalle del lead y su conversación.
7. Revisa `http://localhost:3000/asesor/nutricion` para los leads en preparación.
8. Abre `http://localhost:3000/asesor/inteligencia` para el ciclo ChatLead.

## 11. API principal

```text
POST /api/v1/conversations
POST /api/v1/conversations/{session_id}/messages
GET  /api/v1/conversations/{session_id}
POST /api/v1/conversations/{session_id}/decline

GET  /api/v1/leads
GET  /api/v1/leads/{lead_id}
POST /api/v1/leads/{lead_id}/claim
POST /api/v1/leads/{lead_id}/activities
PUT  /api/v1/leads/{lead_id}/nurture
POST /api/v1/leads/{lead_id}/handoff

POST /api/v1/conversations/chat-records/{record_id}/feedback
GET  /api/v1/conversations/chat-training/summary
POST /api/v1/conversations/chat-training/export
```

## 12. Tabla `chat_leads` y aprendizaje

Cada turno registra:

- Mensaje del usuario y respuesta.
- Estado conversacional y siguiente acción.
- Ruta comercial.
- Señales extraídas.
- Snapshot del perfil y del journey.
- Modo del agente, modelo, prompt, tokens y latencia.
- Calificación del asesor.
- Corrección de acción o ruta.
- Resultado observado.
- Autorización para entrenamiento.

El flujo correcto es:

```text
chat real
→ revisión humana
→ corrección/resultado
→ exportación de registros aprobados
→ evaluación
→ entrenamiento controlado del router local
```

Comandos:

```powershell
python -m app.cli chat-training-summary
python -m app.cli export-chat-training
python -m app.cli train-chat-router
```

El artefacto se genera en:

```text
artifacts/chat_training/chat_next_action_router.joblib
artifacts/chat_training/chat_next_action_router_metadata.json
```

Este router local puede sugerir la próxima pregunta. No puede cambiar la ruta
comercial, la regulación, aprobar beneficios ni reemplazar las reglas del
backend.

## 13. Validación

Backend:

```powershell
python -m pytest -q
python -m compileall -q app
```

Frontend:

```powershell
npm run lint
npm test
npm run build
```

## 14. Qué es demostrativo y qué requiere una fuente real

| Componente | Estado |
|---|---|
| Chatbot adaptativo | Implementado |
| Persistencia | Implementada |
| Recomendación por presupuesto/afinidad | Implementada con datos disponibles |
| Acompañamiento automático | Implementado |
| Dashboard del asesor | Implementado |
| ChatLead y aprendizaje supervisado | Implementado |
| Regla 90/10 | Implementada en modo demo |
| Cupos y ventas oficiales | Requiere integración empresarial |
| Subsidios confirmados | No se confirman; solo potencial por validar |
| Aprobación crediticia | Fuera del alcance |
| CRM/DataCrédito/contact center reales | Fuera del alcance |

## 15. Camino a producción

Antes de un piloto empresarial se debe migrar SQLite a PostgreSQL, usar un
proveedor corporativo de identidad, versionar reglas de subsidios, conectar
catálogo/precios/cupos vigentes, definir retención de datos personales y medir
contacto, visita, separación y venta. Esos resultados son los que permitirán
entrenar posteriormente modelos de conversión confiables.

# Vivienda Match AI — Frontend

Frontend de Vivienda Match AI construido con Next.js 16, React, TypeScript y Tailwind CSS.

El frontend consume el backend FastAPI como fuente primaria en los flujos integrados A0–A4 y conserva la lógica local como fallback para mantener la demo funcional cuando el backend no está disponible.

## Requisitos

- Node.js 20 o superior.
- Backend disponible en `http://localhost:8000` para probar la integración completa.
- Dependencias instaladas con `npm install`.

## Ejecución

### 1. Configurar el backend

Desde otra terminal, iniciar primero `vivienda-ai-backend` siguiendo su README.

### 2. Configurar el frontend

```bash
cp .env.example .env.local
```

En `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

Luego:

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

La ruta `/dev/health` permite verificar desde el navegador la conexión, CORS, base de datos y disponibilidad del modelo del backend.

## Rutas activas

### Públicas

- `/` — Landing.
- `/orientacion` — Entrada de la orientación y lectura de parámetros de campaña.
- `/orientacion/[sessionId]` — Conversación de perfilamiento.
- `/orientacion/resultado/[sessionId]` — Resultado de la orientación y siguiente paso.
- `/vivienda/proyectos` — Catálogo de proyectos desde backend con fallback local.
- `/vivienda/proyectos/[id]` — Detalle de proyecto; mantiene el catálogo local como fallback.
- `/vivienda/agendar` — Solicitud local de cita.
- `/login` — Entrada visual del asesor; la identidad real aún no está conectada.

### Asesor

- `/asesor` — Resumen ejecutivo.
- `/asesor/resumen` — Acceso al resumen ejecutivo.
- `/asesor/leads` — Bandeja desde `GET /api/v1/leads` con fallback local.
- `/asesor/leads/[id]` — Detalle desde `GET /api/v1/leads/{id}`, incluyendo evaluación y auditoría.
- `/asesor/agenda` — Agenda y estado de gestión local.
- `/asesor/comparador` — Comparación de proyectos.
- `/asesor/nutricion` — Espacio de acompañamiento y nutrición.

### Diagnóstico

- `/dev/health` — Sonda técnica de `GET /api/v1/health`.

## Estado de integración A0–A4

| Paso | Integración | Cliente frontend | Estado |
| --- | --- | --- | --- |
| A0 | Health y cliente HTTP | `lib/api/client.ts` | Listo |
| A1 | `GET /projects` | `lib/api/projects.ts` + fallback local | Listo |
| A2 | `POST /leads/sync` | `lib/api/leads.ts` + `features/prospect/storage.ts` | Listo |
| A3 | `GET /leads` | `listLeads()` + bandeja del asesor | Listo |
| A4 | `GET /leads/{id}` | `getLead()` + detalle y auditoría | Listo |
| A5 | `POST /ai/extract` | No cableado | Diferido |

A2 guarda primero en `localStorage` y sincroniza en segundo plano. La evaluación backend queda almacenada en `backendEvaluation`; el resultado público conserva la evaluación local para no romper el fallback actual.

A3 y A4 usan el backend como fuente primaria. Si la request falla, la bandeja o el detalle recurren a los escenarios y sesiones locales disponibles.

## Escenarios de demostración

- **Jonathan:** afiliado listo; ruta de asesor.
- **Laura:** no afiliada con capacidad; ruta de revisión prioritaria.
- **Camila:** afiliada con barrera de ahorro; ruta de acompañamiento.

Los datos no representan personas reales. La afiliación no equivale a aprobación de subsidio ni de crédito.

## Límites actuales

- No existe autenticación real para las rutas del asesor.
- A5 (`POST /ai/extract`) está diferido: el backend usa un proveedor LLM `mock` y su contrato no cubre todos los campos que necesita el extractor local. La extracción determinística de `features/prospect/signal-extractor.ts` sigue siendo la fuente primaria.
- La lógica local de conversación, matching y capacidad se conserva como fallback; no debe retirarse hasta validar un reemplazo backend completo.
- La capacidad financiera es orientativa y no representa aprobación crediticia.
- Los beneficios potenciales no representan subsidios aprobados.
- Precio, disponibilidad, inventario y compatibilidad requieren validación comercial.
- Nutrición, handoff y agenda conservan partes de su estado en `localStorage`.

## Arquitectura visual

Los tokens y superficies autorizadas están en `app/globals.css`. La especificación está en `docs/SISTEMA_VISUAL_V1.md`.

El blur se limita a variantes autorizadas, incluye fallback sin `backdrop-filter` y respeta `prefers-reduced-motion`.

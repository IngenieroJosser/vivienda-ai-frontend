# Vivienda Match AI — Frontend

Experiencia digital para el reto de Vivienda Colsubsidio. Combina información
conocida y una conversación natural para orientar al prospecto y entregar
oportunidades accionables al equipo comercial.

Está construido con Next.js 16, React 19, TypeScript y Tailwind CSS. Consume los
servicios FastAPI disponibles y conserva un recorrido local recuperable cuando
la API no responde.

## Requisitos

- Node.js 20 o superior.
- npm 10 o superior.
- Backend de Vivienda Match AI para probar los recorridos conectados.

## Ejecución local

Copia `.env.example` como `.env.local`. Como mínimo:

```dotenv
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
NEXT_PUBLIC_ADVISOR_ACCESS_TOKEN=
```

El token firmado de demostración se genera desde el backend:

```powershell
python -m app.cli issue-token --sub advisor-demo --role ADVISOR --minutes 480
```

Después:

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

Los recorridos manuales críticos están documentados en
[`e2e/README.md`](e2e/README.md). Esa carpeta es una guía de validación; todavía
no constituye una suite automatizada de navegador.

## Recorridos activos

### Prospecto

- `/` — entrada pública centrada en la conversación.
- `/orientacion` — identificación, consentimiento e inicio.
- `/orientacion/[sessionId]` — conversación libre y recuperable.
- `/orientacion/resultado/[sessionId]` — resultado y siguiente paso.
- `/vivienda/proyectos` — catálogo de proyectos.
- `/vivienda/proyectos/[id]` — ficha, galería y recursos del proyecto.
- `/vivienda/agendar` — preferencia de contacto y horario.

### Equipo comercial

- `/login` — acceso local al recorrido comercial.
- `/asesor` — resumen operativo.
- `/asesor/leads` — oportunidades por reclamar, asignadas y vencidas.
- `/asesor/leads/[id]` — detalle, acciones, proyectos y trazabilidad.
- `/asesor/agenda` — actividades y seguimientos.
- `/asesor/nutricion` — acompañamiento de prospectos en preparación.

## Integración con servicios

La URL base se configura mediante `NEXT_PUBLIC_API_URL`. Las vistas internas
requieren `NEXT_PUBLIC_ADVISOR_ACCESS_TOKEN` durante la demostración local. Este
token se incorpora al cliente y no representa una estrategia de autenticación
productiva.

Operaciones conectadas:

- `POST /leads/sync` — sincroniza la sesión y obtiene el resultado canónico.
- `POST /leads/{id}/handoff` — registra una solicitud de contacto.
- `PUT /leads/{id}/nurture` — conserva el progreso de acompañamiento.
- `GET /leads` — consulta la bandeja y sus filtros operativos.
- `GET /leads/{id}` — obtiene el expediente completo.
- `POST /leads/{id}/claim` — reclama una oportunidad.
- `PATCH /leads/{id}/workflow` — cambia el estado comercial con control de
  versión.
- `POST /leads/{id}/activities` — registra una actividad idempotente.
- `GET /leads/{id}/activities` — consulta el historial comercial.

Después de cada mutación, la interfaz usa el snapshot actualizado devuelto por
el cliente. Los reintentos de una misma actividad conservan la misma clave y el
mismo instante de gestión para evitar duplicaciones.

La sesión del prospecto se guarda primero en el dispositivo. Si el servicio no
está disponible, la interfaz presenta estados recuperables. Cuando el backend
responde, su nivel, ruta, capacidad, plan, recomendaciones y workflow son la
fuente autoritativa.

## Contratos

Los tipos se generan desde el OpenAPI versionado del backend:

```bash
npm run api:types
```

El resultado se conserva en `lib/api/generated.ts` y no debe editarse
manualmente.

## Arquitectura

| Módulo                  | Responsabilidad                                           |
| ----------------------- | --------------------------------------------------------- |
| `features/prospect`     | Sesión, consentimiento, conversación y resultado público |
| `features/conversation` | Evaluación, adaptación y compatibilidad local             |
| `features/advisor`      | Bandeja, workflow, actividad y agenda                     |
| `features/nurturing`    | Planes y progreso de acompañamiento                       |
| `lib/api`               | Cliente HTTP y contratos generados                        |
| `lib/housing-catalog`   | Catálogo, fuentes y consultas de proyectos                |
| `components`            | Navegación, feedback y presentación compartida            |

La lógica de negocio autoritativa permanece en el backend. Los componentes no
escriben directamente en bases de datos ni duplican los contratos HTTP.

## Sistema visual

Los tokens y superficies autorizadas están en `app/globals.css`. La
especificación se mantiene en `docs/SISTEMA_VISUAL_V1.md`.

El sistema diferencia una experiencia guiada para el prospecto y una densidad
operativa para el asesor. El blur está limitado, tiene fallback sólido y
respeta `prefers-reduced-motion`.

Manrope se sirve mediante `next/font/local` desde un archivo variable WOFF2. Su
licencia SIL OFL está versionada en `app/fonts`.

En móvil, las galerías usan desplazamiento nativo con ajuste por imagen. El
visor ampliado acepta gestos horizontales y conserva controles accesibles.

## Límites actuales

- El chat remoto y su fallback dependen del contrato de backend pendiente.
- Las guías E2E todavía deben ejecutarse manualmente en navegador.
- La autenticación productiva y las integraciones externas no forman parte de
  este frontend de demostración.

<p align="center">
  <img src="./public/brand/colsubsidio-logo.svg" alt="Colsubsidio" width="230" />
</p>

<h1 align="center">Vivienda Match AI · Frontend</h1>

<p align="center">
  Orientación conversacional para transformar el interés por vivienda en
  oportunidades comerciales explicables y acompañadas.
</p>

<p align="center">
  <img alt="Next.js 16" src="https://img.shields.io/badge/Next.js-16-0067B1?style=flat-square" />
  <img alt="React 19" src="https://img.shields.io/badge/React-19-0067B1?style=flat-square" />
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-strict-0067B1?style=flat-square" />
  <img alt="Tests" src="https://img.shields.io/badge/tests-Vitest-FFD000?style=flat-square&labelColor=0067B1" />
</p>

---

Este repositorio contiene la experiencia web de **Vivienda Match AI** para el
reto de Vivienda Colsubsidio. Reúne el recorrido público del prospecto, el
catálogo verificable de proyectos y el espacio operativo del equipo comercial.

La interfaz aprovecha el contexto conocido del prospecto sin convertir la
conversación en un formulario. Cuando una persona todavía no está preparada
para comprar, presenta un plan de acompañamiento; cuando existe una oportunidad
real, entrega al asesor el contexto necesario para actuar.

## Repositorios del producto

| Repositorio | Responsabilidad |
| --- | --- |
| **[Frontend](https://github.com/IngenieroJosser/vivienda-ai-frontend)** | Experiencia del prospecto, catálogo y portal comercial |
| **[Backend](https://github.com/IngenieroJosser/vivienda-ai-backend)** | Conversación, evaluación, matching, persistencia y flujo operativo |

## Capacidades principales

- Conversación libre y recuperable, sin respuestas preescritas.
- Reconocimiento de afiliados, no afiliados y compradores anteriores.
- Evaluación financiera orientativa con límite responsable del 40 %.
- Recomendación explicable de hasta tres proyectos con fuentes verificables.
- Acompañamiento de prospectos que necesitan fortalecer sus condiciones.
- Entrega consistente del resultado al portal del asesor.
- Catálogo responsive con galerías, planos y recorridos virtuales optimizados.
- Estados de carga, error, recuperación y continuidad local.

## Tecnología

Next.js 16, React 19, TypeScript estricto, Tailwind CSS y Vitest. El frontend
consume la API FastAPI del repositorio backend y conserva una experiencia local
recuperable cuando el servicio no responde.

## Ejecución local

Requisitos:

- Node.js 20 o superior.
- npm 10 o superior.
- [Backend de Vivienda Match AI](https://github.com/IngenieroJosser/vivienda-ai-backend)
  ejecutándose en el puerto `3001` para probar los recorridos conectados.

Instala las dependencias y crea `.env.local`:

```dotenv
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
```

```bash
npm install
npm run dev
```

La aplicación queda disponible en `http://localhost:3000`.

## Validación

```bash
npm run lint
npm test -- --run
npm run build
```

Los tres comandos deben finalizar correctamente antes de integrar o publicar
cambios.

## Recorridos activos

### Prospecto

- `/` — entrada pública centrada en la conversación.
- `/orientacion` — atribución de campaña, consentimiento e inicio.
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
- `/asesor/inteligencia` — revisión de ChatLead y aprendizaje supervisado.
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

- `POST /conversations` para crear o reanudar una sesión del perfilador.
- `POST /conversations/{session_id}/messages` para ejecutar el agente, reglas y
  persistencia de cada turno.
- `GET /conversations/{session_id}` para recuperar el estado canónico.
- `POST /conversations/chat-records/{id}/feedback` para revisión humana.
- `GET /conversations/chat-training/summary` y `POST
  /conversations/chat-training/export` para el ciclo supervisado de ChatLead.
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

### Contexto de adquisición

La entrada desde pauta conserva una lista explícita de parámetros útiles:
fuente, medio, campaña, contenido, término, identificadores de campaña,
conjunto y anuncio, ubicación, proyecto de interés y referencia del clic.
Después añade contexto técnico grueso —ruta de entrada, origen, idioma, zona
horaria y clase de dispositivo— para facilitar soporte y análisis.

Este contexto se mantiene local antes del consentimiento y se envía al backend
al iniciar la conversación autorizada. No se realiza fingerprinting ni se
capturan agente de usuario, URL completa del referente, características del
hardware o información sensible inferida desde el navegador.

Los contratos TypeScript se generan desde el OpenAPI versionado del backend:

```bash
npm run api:types
```

El resultado se conserva en `lib/api/generated.ts`; no debe editarse a mano.

```text
Pauta o entrada directa
→ consentimiento e identificación
→ conversación adaptativa
→ evaluación y recomendación autoritativas
→ resultado o acompañamiento
→ oportunidad visible para el asesor
```

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

## Documentación

- [`docs/SISTEMA_VISUAL_V1.md`](docs/SISTEMA_VISUAL_V1.md) — tokens,
  superficies, accesibilidad y rendimiento visual.
- [`lib/api/generated.ts`](lib/api/generated.ts) — contrato TypeScript generado
  desde OpenAPI.
- [README del backend](https://github.com/IngenieroJosser/vivienda-ai-backend#readme)
  — ejecución de la API, agente conversacional y persistencia.

## Seguridad

- Las claves privadas pertenecen exclusivamente al backend.
- Ningún secreto debe usar el prefijo `NEXT_PUBLIC_`.
- El contexto de pauta se limita a campos explícitos y no realiza
  fingerprinting.
- La capacidad financiera es orientativa y los beneficios requieren validación.
- Los precios, inventarios y fechas se presentan con su fuente o como
  información por confirmar.

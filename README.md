# Vivienda Match AI — Frontend

Experiencia frontend para el reto de Vivienda Colsubsidio. El producto convierte
información conocida y una conversación natural en una orientación explicable
para el prospecto y una oportunidad accionable para el equipo comercial.

Está construido con Next.js 16, React 19, TypeScript y Tailwind CSS. En esta etapa
los datos y la continuidad de los recorridos se conservan localmente; no se
simulan integraciones remotas.

## Ejecución local

Requisitos:

- Node.js 20 o superior.
- npm 10 o superior.

```bash
npm install
npm run dev
```

Validación completa:

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
- `/asesor/leads` — bandeja de oportunidades preparadas.
- `/asesor/leads/[id]` — detalle, recomendación y actividad comercial.
- `/asesor/agenda` — actividades y seguimientos.
- `/asesor/nutricion` — acompañamiento de prospectos en preparación.
- `/asesor/comparador` — comparación contextual de proyectos; no forma parte de
  la navegación principal.

## Arquitectura

| Módulo                  | Responsabilidad                                          |
| ----------------------- | -------------------------------------------------------- |
| `features/prospect`     | Sesión, consentimiento, conversación y resultado público |
| `features/conversation` | Evaluación determinística y recomendación explicable     |
| `features/advisor`      | Flujo comercial, actividad y agenda                      |
| `features/nurturing`    | Planes y progreso de acompañamiento                      |
| `lib/housing-catalog`   | Catálogo, fuentes y consultas de proyectos               |
| `components`            | Identidad, navegación, feedback y presentación compartida |

La interfaz no calcula capacidad, prioridad, beneficios o coincidencias de
proyectos. Prospecto y asesor consumen el mismo resultado de evaluación y los
mismos identificadores del catálogo.

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

En móvil, las galerías usan scroll nativo con ajuste por imagen. El índice
observado durante el gesto no dispara un segundo desplazamiento programático.
El visor ampliado acepta swipe horizontal y conserva botones accesibles como
alternativa; ambos controles desaparecen cuando solo existe una imagen.

La suite protege las reglas principales del sistema:

- No permite colores, gradientes o sombras directas en módulos de interfaz.
- Impide texto público de 9 o 10 px.
- Detecta vocabulario interno o técnico en textos visibles.
- Verifica la carga diferida y la configuración de imágenes y visores.
- Comprueba umbral, dirección y predominio horizontal de los gestos de galería.
- Confirma que la fuente local y su variable CSS permanezcan conectadas.

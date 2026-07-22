# Vivienda Match AI — Colsubsidio

Frontend integral para el reto de **perfilamiento inteligente de leads de vivienda**. El proyecto incluye la experiencia del afiliado, el portal comercial, marketing, administración, favicon y sistema visual del producto.

## Stack

- Next.js 16.2.11 con App Router
- React 19
- TypeScript
- Tailwind CSS 4
- Datos simulados en memoria para demostración

## Sistema visual

- Amarillo: `#ffd000`
- Azul: `#0067b1`
- Fondo: `#fafafa`
- Texto y superficies oscuras: `#111820`

La experiencia visual adopta un sistema de fondos líquidos amarillos inspirado en la referencia suministrada. El tratamiento se usa con mayor intensidad en la portada y de forma controlada en flujos, login y portales internos:

- Fondo líquido animado con pliegues, luces, profundidad y movimiento orgánico.
- Nueva identidad **Vivienda Match AI**.
- Navegación pública diferenciada de la landing.
- Flujo del afiliado con stepper, panel contextual y estados explicables.
- Portal empresarial con sidebar claro, navegación por roles y jerarquía visual consistente.
- Tarjetas de alto contraste, sombras controladas, microinteracciones, tablas, formularios y botones refinados.
- Variantes visuales claras para portada, flujo del afiliado, login y portales empresariales.
- Diseño responsive para móvil, tableta y escritorio.
- Tipografía autohospedada por Next.js mediante `next/font`.

## Marca y favicon

Archivos principales:

```text
public/brand/vivienda-match-ai-logo.png
public/brand/vivienda-match-ai-icon.png
app/favicon.ico
app/icon.png
app/apple-icon.png
```


## Ejecución

Instalar dependencias:

```bash
yarn install
```

Desarrollo:

```bash
yarn dev
```

Producción:

```bash
yarn build
yarn start
```

## Pantallas incluidas

### Experiencia del afiliado

- `/` — Landing inmersiva con fondo líquido amarillo animado.
- `/vivienda/inicio` — Identificación, consentimientos y seguridad.
- `/vivienda/perfilamiento` — Perfilamiento conversacional adaptativo.
- `/vivienda/documentos` — Carga, OCR y validación documental.
- `/vivienda/analizando` — Procesamiento y estados del análisis.
- `/vivienda/resultado` — Resultado, explicabilidad y siguientes pasos.
- `/vivienda/proyectos` — Proyectos recomendados.
- `/vivienda/proyectos/reserva-del-parque` — Detalle del proyecto.
- `/vivienda/simulador` — Simulador financiero interactivo.
- `/vivienda/agendar` — Agenda de asesoría.
- `/vivienda/confirmacion` — Confirmación y preparación de la cita.

### Portal comercial

- `/login` — Acceso empresarial.
- `/asesor/dashboard` — Dashboard del asesor.
- `/asesor/leads` — Bandeja y filtros de leads.
- `/asesor/leads/lead-001` — Detalle y trazabilidad del lead.
- `/asesor/agenda` — Agenda comercial.
- `/asesor/comparador` — Comparador de proyectos.

### Marketing y administración

- `/marketing/dashboard` — Inteligencia de adquisición.
- `/marketing/campanas` — Gestión de campañas.
- `/admin/proyectos` — Administración de proyectos.
- `/admin/scoring` — Configuración versionada del scoring.
- `/admin/auditoria` — Auditoría y trazabilidad.

## Validación recomendada

Antes de desplegar:

```bash
yarn install --frozen-lockfile
yarn lint
yarn build
```

La animación respeta `prefers-reduced-motion` para no afectar a usuarios que reduzcan el movimiento del sistema.

## Alcance

El proyecto es un frontend funcional para demo y hackathon. Los formularios, filtros, simulador, selección de citas, comparador, estados de campañas y configuración visual del scoring tienen interacción local. Para producción deben conectarse a APIs, autenticación corporativa, almacenamiento documental, CRM, motor de scoring, analítica y servicios de agenda.

## Sistema visual animado v2

El proyecto incorpora `components/animated-hero-background.tsx`, un fondo reutilizable y optimizado con:

- movimiento orgánico mediante `transform` y `opacity`;
- formas que aparecen, se transforman y desaparecen progresivamente;
- movimiento autónomo sin listeners del cursor ni trabajo continuo en JavaScript;
- variantes visuales para `vivienda`, `projects`, `asesor`, `marketing`, `admin`, `hero` y `dark`;
- compatibilidad con `prefers-reduced-motion`;
- reutilización en la página principal, el flujo de vivienda, proyectos, login y portales internos.

Las pantallas de administración, asesoría, marketing, vivienda y proyectos comparten ahora un sistema coherente de superficies translúcidas, hero contextual, entradas escalonadas, tarjetas interactivas y fondos animados por dominio.

## Optimización de rendimiento

Esta versión incorpora una revisión específica de carga inicial y navegación:

- `AnimatedHeroBackground` funciona únicamente con CSS y no registra listeners globales del puntero.
- Las animaciones se limitan a `transform` y `opacity`; se eliminaron cambios continuos de `filter` y `border-radius`.
- En móvil se reducen automáticamente capas, desenfoques, sombras y formas secundarias.
- Los portales de asesoría, marketing y administración usan layouts persistentes: sidebar, encabezado y fondo no se reconstruyen al cambiar de pantalla.
- El flujo de vivienda conserva el encabezado y el fondo entre rutas.
- Las rutas siguientes se precargan durante tiempo ocioso para acelerar botones que usan `router.push`.
- Se añadieron `loading.tsx` por dominio para ofrecer respuesta visual inmediata durante cualquier transición.
- Los detalles de proyectos y leads conocidos se generan estáticamente con `generateStaticParams` y `dynamicParams = false`.
- El logo visible se renderiza como SVG inline; no descarga una imagen PNG pesada en cada pantalla.
- Se eliminó la descarga de una fuente web global y se usa la pila tipográfica nativa del sistema para acelerar el primer render.
- Las ilustraciones SVG se sirven sin pasar por el optimizador de imágenes y declaran tamaños responsivos.
- Los iconos PNG se cuantizaron sin modificar sus dimensiones, reduciendo significativamente su peso.
- El contenido fuera del viewport usa `content-visibility: auto` cuando el navegador lo soporta.

### Presupuesto recomendado

Para conservar la experiencia rápida al conectar APIs reales:

- Evitar consultas bloqueantes en layouts compartidos.
- Paginar tablas y listas desde el backend.
- Cargar gráficos avanzados mediante importación dinámica.
- Mantener imágenes de proyectos por debajo de 180 KB en WebP o AVIF.
- No añadir librerías de animación para efectos que puedan resolverse con CSS.

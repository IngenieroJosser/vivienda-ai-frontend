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

La página principal se conservó con su composición original. El rediseño se aplicó a las pantallas internas mediante:

- Nueva identidad **Vivienda Match AI**.
- Navegación pública diferenciada de la landing.
- Flujo del afiliado con stepper, panel contextual y estados explicables.
- Portal empresarial con sidebar claro, navegación por roles y jerarquía visual consistente.
- Tarjetas, tablas, formularios, botones y estados interactivos refinados.
- Diseño responsive para móvil, tableta y escritorio.
- Construcción sin dependencia de Google Fonts en tiempo de compilación.

## Marca y favicon

Archivos principales:

```text
public/brand/vivienda-match-ai-logo.png
public/brand/vivienda-match-ai-icon.png
app/favicon.ico
app/icon.png
app/apple-icon.png
```

Los recursos originales generados se conservan en:

```text
public/brand/source/
```

## Ejecución

Instalar dependencias:

```bash
npm install
```

Desarrollo:

```bash
npm run dev
```

Producción:

```bash
npm run build
npm run start
```

## Pantallas incluidas

### Experiencia del afiliado

- `/` — Landing de campaña, conservada visualmente.
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

## Validaciones realizadas

- ESLint sin errores ni advertencias.
- TypeScript validado durante el build.
- Compilación de producción correcta con Webpack.
- Generación estática correcta de 34 rutas.
- Validación HTTP `200` sobre rutas públicas, comerciales, marketing, administración y recursos de marca.

## Alcance

El proyecto es un frontend funcional para demo y hackathon. Los formularios, filtros, simulador, selección de citas, comparador, estados de campañas y configuración visual del scoring tienen interacción local. Para producción deben conectarse a APIs, autenticación corporativa, almacenamiento documental, CRM, motor de scoring, analítica y servicios de agenda.

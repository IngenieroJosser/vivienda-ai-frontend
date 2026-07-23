# Vivienda Match AI — Frontend

Frontend de Vivienda Match AI construido con Next.js, React, TypeScript y Tailwind CSS.

La aplicación está en transición desde un prototipo visual hacia el MVP conversacional. El flujo anterior, Marketing, Administración y las acciones demostrativas sin integración fueron retirados para evitar dos productos paralelos.

## Ejecución

```bash
npm install
npm run dev
```

Validación:

```bash
npm run lint
npm run build
```

El repositorio todavía no tiene una suite de pruebas automatizadas.

## Rutas activas

### Públicas

- `/` — Landing.
- `/login` — Entrada visual del asesor; permanece deshabilitada hasta conectar identidad real.
- `/vivienda/proyectos` — Catálogo asociado a escenarios aprobados.
- `/vivienda/proyectos/[id]` — Detalle de proyecto.
- `/vivienda/agendar` — Selección local de cita, sin persistencia externa.

### Asesor

- `/asesor/leads` — Bandeja de Jonathan, Laura y Camila.
- `/asesor/leads/[id]` — Resumen ejecutivo del escenario.
- `/asesor/agenda` — Estado vacío hasta integrar agenda.
- `/asesor/comparador` — Comparación de proyectos aprobados.

## Estructura objetivo

```text
/
├── /demo
├── /conversacion/[sessionId]
├── /resultado/[leadId]
├── /vivienda/proyectos
├── /vivienda/proyectos/[id]
├── /vivienda/agendar
└── /asesor
    ├── /resumen
    ├── /leads
    ├── /leads/[id]
    ├── /agenda
    ├── /nutricion
    └── /comparador
```

Falta construir `/demo`, `/conversacion/[sessionId]`, `/resultado/[leadId]`, `/asesor/resumen` y `/asesor/nutricion`.

## Escenarios sintéticos aprobados

- **Jonathan:** afiliado listo; ruta de asesor.
- **Laura:** no afiliada con capacidad; ruta regulatoria prioritaria.
- **Camila:** afiliada con barrera de ahorro; ruta de nutrición.

Los datos no representan personas reales. La afiliación no modifica el puntaje de preparación; determina beneficios y ruta comercial.

## Límites actuales

- No existe autenticación real.
- No hay API, base de datos ni persistencia.
- No se envían llamadas, correos, citas o notificaciones.
- La capacidad financiera es orientativa.
- Los beneficios potenciales no representan subsidios aprobados.
- Precio, disponibilidad y compatibilidad requieren validación.

## Sistema visual

Los tokens y superficies autorizadas están en `app/globals.css`. La especificación está en `docs/SISTEMA_VISUAL_V1.md`.

El blur se limita a variantes autorizadas, incluye fallback sin `backdrop-filter` y respeta `prefers-reduced-motion`.

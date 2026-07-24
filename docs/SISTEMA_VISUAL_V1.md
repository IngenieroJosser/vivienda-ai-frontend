# Sistema Visual Vivienda Match AI v1

Estado: vigente, con implementación incremental

Alcance inicial: prospecto y asesor
Fuera del producto activo del MVP: marketing y administración independientes

## 1. Propósito

Vivienda Match AI usa una identidad propia basada en glassmorphism y liquid glass. El efecto visual acompaña la jerarquía, pero no sustituye la claridad, el contraste ni la navegación.

La misma identidad tiene dos densidades:

- `density-guided`: prospecto emocional, sencillo, conversacional y principalmente móvil.
- `density-compact`: asesor ejecutivo, informativo y orientado a acciones.

La regla de producto es:

> El prospecto debe sentirse acompañado; el asesor debe sentirse en control.

## 2. Principios no negociables

1. La afiliación modifica beneficios y rutas, nunca la calidad visual ni el trato.
2. Cada estado del recorrido del prospecto tiene una acción principal.
3. Cada vista del asesor responde qué requiere atención, por qué, qué se conoce y qué debe hacerse.
4. La próxima mejor acción permanece visible en el detalle del lead.
5. Los recursos confirmados y los beneficios por validar nunca comparten el mismo tratamiento visual.
6. Las tablas, los bloques financieros, los historiales y los textos críticos usan superficies sólidas.
7. El blur solo existe en componentes autorizados; no se activa mediante utilidades sueltas.
8. La experiencia completa funciona sin blur, animación ni hover.
9. Marketing y administración no forman parte del árbol activo del MVP.

## 3. Tokens semánticos

Los valores se exponen como propiedades CSS bajo el prefijo `--vm-`. Tailwind puede consumirlos, pero la fuente de verdad es `app/globals.css`.

### 3.1 Color

| Token | Valor | Uso |
|---|---:|---|
| `--vm-color-brand-yellow` | `#ffd000` | Acento de marca y énfasis |
| `--vm-color-brand-blue` | `#0067b1` | Acción principal, vínculo y selección |
| `--vm-color-brand-blue-deep` | `#004f8c` | Hover de acción principal |
| `--vm-color-ink` | `#111820` | Texto principal |
| `--vm-color-ink-muted` | `#52606d` | Texto secundario sobre superficie clara |
| `--vm-color-canvas` | `#fafafa` | Fondo base |
| `--vm-color-canvas-muted` | `#f5f7f8` | Fondo neutro de acceso y transiciones |
| `--vm-color-surface` | `#ffffff` | Superficie sólida |
| `--vm-color-info` | `#0067b1` | Información |
| `--vm-color-success` | `#087a55` | Estado confirmado o exitoso |
| `--vm-color-success-soft` | `#ecfdf5` | Fondo de confirmación |
| `--vm-color-warning` | `#805d00` | Revisión o beneficio potencial |
| `--vm-color-warning-soft` | `#fffaf0` | Fondo de advertencia no bloqueante |
| `--vm-color-error` | `#b4233a` | Error o bloqueo |
| `--vm-color-error-soft` | `#fff1f3` | Fondo de error recuperable |
| `--vm-color-focus` | `#005fcc` | Anillo de foco |
| `--vm-color-on-dark` | `#ffffff` | Contenido sobre fondo oscuro |

El amarillo no se usa para texto pequeño sobre blanco. Los estados nunca dependen solamente del color: incluyen etiqueta, icono o descripción.

### 3.2 Superficie, opacidad y blur

| Token | Valor |
|---|---:|
| `--vm-surface-solid` | `#ffffff` |
| `--vm-glass-subtle-bg` | `rgba(255, 255, 255, 0.82)` |
| `--vm-glass-elevated-bg` | `rgba(255, 255, 255, 0.72)` |
| `--vm-glass-dark-bg` | `rgba(17, 24, 32, 0.88)` |
| `--vm-blur-none` | `0px` |
| `--vm-blur-subtle` | `10px` |
| `--vm-blur-elevated` | `18px` |
| `--vm-saturation-glass` | `112%` |

No se permiten valores de blur superiores a `18px` en el MVP. En pantallas de hasta 720 px, `--vm-blur-elevated` se reduce a `12px`.

### 3.3 Borde y sombra

| Token | Valor |
|---|---|
| `--vm-border-subtle` | `1px solid rgba(17, 24, 32, 0.08)` |
| `--vm-border-glass` | `1px solid rgba(255, 255, 255, 0.58)` |
| `--vm-border-active` | `1px solid rgba(0, 103, 177, 0.52)` |
| `--vm-shadow-low` | `0 8px 24px rgba(17, 24, 32, 0.06)` |
| `--vm-shadow-medium` | `0 18px 54px rgba(17, 24, 32, 0.09)` |
| `--vm-shadow-high` | `0 24px 70px rgba(17, 24, 32, 0.14)` |
| `--vm-shadow-focus` | `0 0 0 3px rgba(0, 95, 204, 0.35)` |
| `--vm-shadow-brand-control` | Elevación de selección compacta |
| `--vm-shadow-brand-medium` | Elevación de acción principal |
| `--vm-shadow-brand-high` | Elevación del siguiente paso público |
| `--vm-shadow-accent` | Halo amarillo de énfasis |
| `--vm-shadow-inset-active` | Indicador lateral de selección |

Las sombras indican elevación, no decoración. Una superficie anidada no puede tener una sombra mayor que su contenedor.

### 3.4 Gradientes semánticos

Los gradientes reutilizables se declaran como tokens y se consumen mediante una
clase de superficie con propósito. No se escriben colores ni gradientes
directamente en componentes.

| Token | Uso |
|---|---|
| `--vm-gradient-guidance` | Resumen, recomendación y siguiente acción |
| `--vm-gradient-result-action` | Cierre del resultado del prospecto |
| `--vm-gradient-media-overlay` | Contraste de texto sobre fotografía |
| `--vm-gradient-login-overlay` | Lectura del panel fotográfico de acceso |
| `--vm-gradient-progress` | Progreso institucional |

### 3.5 Radio

| Token | Valor |
|---|---:|
| `--vm-radius-control` | `12px` |
| `--vm-radius-card` | `20px` |
| `--vm-radius-elevated` | `28px` |
| `--vm-radius-pill` | `999px` |

### 3.6 Espaciado

Escala base de 4 px:

| Token | Valor |
|---|---:|
| `--vm-space-1` | `4px` |
| `--vm-space-2` | `8px` |
| `--vm-space-3` | `12px` |
| `--vm-space-4` | `16px` |
| `--vm-space-5` | `20px` |
| `--vm-space-6` | `24px` |
| `--vm-space-8` | `32px` |
| `--vm-space-10` | `40px` |
| `--vm-space-12` | `48px` |
| `--vm-space-16` | `64px` |

No se introducen valores nuevos cuando uno de la escala resuelve la composición con una diferencia menor a 2 px.

### 3.7 Tipografía

| Token | Tamaño / línea | Peso | Uso |
|---|---|---:|---|
| `--vm-type-display` | `clamp(2.25rem, 5vw, 4.75rem) / 0.98` | 700 | Portada |
| `--vm-type-h1` | `clamp(2rem, 3vw, 2.75rem) / 1.05` | 700 | Título de vista |
| `--vm-type-h2` | `1.5rem / 1.2` | 700 | Sección |
| `--vm-type-h3` | `1.125rem / 1.3` | 700 | Tarjeta |
| `--vm-type-body` | `1rem / 1.6` | 400 | Prospecto |
| `--vm-type-body-compact` | `0.875rem / 1.5` | 400 | Asesor |
| `--vm-type-label` | `0.75rem / 1.3` | 650 | Etiqueta |
| `--vm-type-caption` | `0.6875rem / 1.4` | 550 | Metadato interno del asesor |

Manrope se carga una sola vez desde el layout raíz mediante `next/font/local`.
El archivo variable WOFF2 y su licencia SIL OFL se versionan en `app/fonts`.
Next.js sirve la fuente desde el mismo origen, aplica `display: swap` y el build
no depende de Google Fonts.

En la experiencia pública, el texto informativo no baja de 12 px y el cuerpo se
mantiene en 16 px. En la densidad compacta, los metadatos pueden usar 11 px
cuando no contienen una acción ni información necesaria para decidir.

### 3.8 Movimiento

| Token | Valor |
|---|---:|
| `--vm-motion-instant` | `80ms` |
| `--vm-motion-fast` | `140ms` |
| `--vm-motion-normal` | `220ms` |
| `--vm-motion-slow` | `360ms` |
| `--vm-ease-standard` | `cubic-bezier(.2, .72, .24, 1)` |
| `--vm-ease-exit` | `cubic-bezier(.4, 0, 1, 1)` |

Solo se animan `transform` y `opacity` en interacciones frecuentes. Ninguna animación esencial dura más de 400 ms. Con `prefers-reduced-motion: reduce`, las transiciones quedan en `1ms` y se eliminan desplazamientos, órbitas y brillos animados.

### 3.9 Densidad

| Token | `density-guided` | `density-compact` |
|---|---:|---:|
| `--vm-control-height` | `52px` | `40px` |
| `--vm-control-padding-x` | `20px` | `14px` |
| `--vm-card-padding` | `24px` | `16px` |
| `--vm-stack-gap` | `20px` | `12px` |
| `--vm-page-gap` | `32px` | `20px` |
| `--vm-body-size` | `16px` | `14px` |

La densidad no modifica colores ni significado; solo espacio, tamaño y cantidad de información visible.

## 4. Variantes autorizadas

### `glass-subtle`

Uso: navegación, toolbar, filtros, compositores y controles flotantes.

- Fondo `--vm-glass-subtle-bg`.
- Blur `--vm-blur-subtle`.
- Borde `--vm-border-glass`.
- Sombra `--vm-shadow-low`.
- No contiene tablas ni párrafos críticos de más de tres líneas.

### `glass-elevated`

Uso: modal, conversación, resumen ejecutivo, panel destacado y tarjeta principal.

- Fondo `--vm-glass-elevated-bg`.
- Blur `--vm-blur-elevated`.
- Borde `--vm-border-glass`.
- Sombra `--vm-shadow-medium` o `--vm-shadow-high`.
- Máximo una superficie elevada dominante por región visual.

### `surface-solid`

Uso: tablas, formularios largos, finanzas, historiales, auditoría y mensajes críticos.

- Fondo `--vm-surface-solid`.
- Sin blur.
- Borde `--vm-border-subtle`.
- Texto con contraste calculado contra blanco sólido.

### `density-guided`

Uso: inicio, consentimiento, conversación libre, evaluación, resultado y siguiente paso.

- Una acción primaria por estado del recorrido.
- Objetivos táctiles mínimos de 44 × 44 px.
- Texto base de 16 px.
- Máximo recomendado de 72 caracteres por línea.

### `density-compact`

Uso: resumen, leads, agenda, nutrición, comparador y detalle del lead.

- Puede presentar acciones secundarias simultáneas.
- Mantiene objetivos interactivos mínimos de 40 × 40 px; 44 × 44 px en táctil.
- Prioriza escaneo, alineación y datos comparables.

## 5. Estados de componentes

Todos los componentes interactivos implementan los siguientes estados:

| Estado | Contrato visual y funcional |
|---|---|
| `default` | Etiqueta y propósito visibles; contraste AA |
| `hover` | Cambio no mayor a 4 px de desplazamiento; nunca es la única señal |
| `focus` | Anillo de 3 px con offset de 2 px; no queda oculto por sticky headers |
| `active` | Contraste, borde o relleno persistente y `aria-current`, `aria-pressed` o equivalente |
| `disabled` | Sin interacción; opacidad mínima 0.48; conserva etiqueta legible |
| `loading` | Mantiene dimensiones; anuncia estado; evita doble envío |
| `error` | Mensaje textual próximo al origen; ofrece recuperación |
| `success` | Confirmación textual; no desaparece antes de 4 segundos si requiere lectura |
| `fallback sin blur` | Fondo opaco ≥ 0.96; conserva borde, sombra, jerarquía y contraste |

Los estados `loading`, `error` y `success` no cambian el ancho o alto externo del control.

## 6. Navegación vigente

### 6.1 Prospecto

```text
Entrada pública o campaña
→ orientación y consentimiento
→ conversación adaptativa
→ evaluación
→ resultado personalizado
→ siguiente paso
```

Rutas objetivo:

| Etapa | Ruta |
|---|---|
| Entrada pública | `/` |
| Inicio de orientación | `/orientacion` |
| Conversación o recuperación | `/orientacion/[sessionId]` |
| Evaluación | Estado dentro de la sesión; no exige una nueva ruta |
| Resultado | `/orientacion/resultado/[sessionId]` |
| Catálogo | `/vivienda/proyectos` |
| Detalle de proyecto | `/vivienda/proyectos/[id]` |
| Preferencia de agendamiento | `/vivienda/agendar` |

La experiencia pública no muestra un selector de personajes, un contador de preguntas ni alternativas predefinidas. El prospecto conversa mediante texto libre y la sesión finaliza cuando existe evidencia suficiente para orientar. Volver o recargar no elimina los mensajes conservados.

### 6.2 Asesor

Navegación persistente, con icono y texto:

```text
Resumen
Oportunidades
Agenda
Acompañamiento
```

Rutas objetivo:

| Opción | Ruta |
|---|---|
| Resumen | `/asesor/resumen` |
| Oportunidades | `/asesor/leads` |
| Agenda | `/asesor/agenda` |
| Acompañamiento | `/asesor/nutricion` |

El comparador existe como herramienta contextual en `/asesor/comparador`, pero
no forma parte de la navegación persistente. Se abre únicamente desde un
recorrido que aporta contexto de oportunidad.

En pantallas pequeñas la navegación se convierte en drawer con botón etiquetado, cierre con `Escape`, bloqueo de scroll y devolución del foco al disparador.

Jerarquía del detalle:

```text
Resumen ejecutivo
→ próxima mejor acción
→ objetivo de vivienda
→ preparación financiera
→ afiliación y beneficios
→ proyectos compatibles
→ historial y agenda
```

La próxima mejor acción es sticky dentro del panel de contenido en escritorio y aparece como barra sólida inferior en móvil. No puede tapar el último elemento enfocable.

## 7. Arquitectura visual y funcional

La aplicación concentra cada responsabilidad en un módulo reconocible:

| Módulo | Responsabilidad | Interface pública |
|---|---|---|
| `features/prospect` | Entrada desde campaña, consentimiento, conversación libre, sesión y resultado público | Sesión `ProspectSession` y funciones puras de avance |
| `features/conversation` | Evaluación determinística y proyección para el asesor | `evaluateProfile` y `EvaluationResult` |
| `lib/housing-catalog` | Catálogo respaldado por evidencia, formatos y consultas de proyectos | `HousingProject` y selectores exportados por `index.ts` |
| `components/brand.tsx` | Identidad oficial de Colsubsidio en todos los recorridos | `Brand` y `ProductBrand`, ambos sobre el mismo lockup |
| `components` | Presentación compartida y navegación | Propiedades visuales; no contiene reglas de calificación |

Reglas de arquitectura:

- La conversación pública puede reutilizar la evaluación, pero la evaluación no depende de componentes React, almacenamiento ni navegación.
- La UI nunca calcula capacidad, prioridad, beneficios ni proyectos compatibles.
- Catálogo, resultado y asesor consumen los mismos identificadores de proyecto.
- Los datos de campaña y escenarios alimentan el motor; no se renderizan como selectores públicos.
- Los cuestionarios estructurados de `features/conversation` existen únicamente como harness interno para escenarios y pruebas. No forman parte del recorrido público.
- Los adaptadores de `localStorage` permanecen detrás de los módulos de almacenamiento y deberán reemplazarse por persistencia backend sin cambiar el dominio.
- Ningún componente incorpora una segunda identidad gráfica ni reproduce valores comerciales del catálogo.

## 8. Contratos de componentes y aceptación

Los nombres siguientes describen los módulos objetivo del sistema visual. Durante
la migración, algunos contratos todavía son satisfechos por clases y módulos
existentes; no deben interpretarse como exportaciones ya disponibles hasta que
el código las implemente y las pruebas cubran su interface.

| Componente | Variante inicial | Criterios de aceptación |
|---|---|---|
| `GlassShell` | `glass-subtle` | Aplica densidad y presupuesto; funciona sin blur; no crea blur anidado |
| `GlassCard` | subtle/elevated/solid | Elemento semántico configurable; padding por densidad; estados opcionales |
| `LiquidButton` | primary/secondary/quiet/destructive | Etiqueta obligatoria; loading sin resize; foco visible; no depende del reflejo |
| `GlassModal` | `glass-elevated` | `role="dialog"`, título accesible, focus trap, `Escape`, devolución de foco |
| `GlassSidebar` | `glass-subtle` | Icono más texto; activo con `aria-current`; navegación completa por teclado |
| `GlassToolbar` | `glass-subtle` | Controles etiquetados; wrap o scroll controlado a 320 px |
| `StatusChip` | sólido | Texto e icono opcional; no usa solo color; no es botón salvo semántica explícita |
| `ConfidenceIndicator` | sólido | Expresa calidad del dato, no probabilidad; incluye texto alternativo |
| `LoadingState` | sólido | Usa skeleton estático con movimiento reducido; `aria-busy` en el contenedor |
| `EmptyState` | sólido | Explica causa y próxima acción; no culpa al usuario |
| `FeedbackState` | sólido/embebido | Unifica error, éxito y vacío; acción recuperable opcional; jerarquía configurable |
| `JourneyStepper` | subtle | Etapa textual; `aria-current="step"`; usable a 320 px |
| `AdvisorSidebar` | subtle | Cuatro opciones principales; estado activo inequívoco; drawer accesible |
| `ContextualHeader` | subtle/solid | Título, contexto y acción principal; no oculta foco ni contenido |

## 9. Matriz de migración

| Actual | Destino | Acción |
|---|---|---|
| `.surface-card` | `GlassCard` o `surface-solid` | Mantener alias temporal; clasificar por contenido antes de migrar |
| `.surface-card--interactive` | `GlassCard interactive` | Mover hover y foco al componente |
| `.flow-panel` | `GlassCard` elevado o sólido | Conversación puede usar elevated; formularios usan solid |
| `.flow-aside-card` | `GlassCard` subtle | Migrar después del shell del prospecto |
| `.metric-card` / `StatCard` | `GlassCard density-compact` | Conservar métrica; retirar decoración no semántica |
| `.portal-sidebar` / `PortalLayout` | `AdvisorSidebar` | Mantener Resumen, Oportunidades, Agenda y Acompañamiento |
| `.portal-hero` / `PortalPage` | `ContextualHeader` | Migrar únicamente el portal del asesor |
| `.form-field` | control base sólido | Nunca aplicar blur a cada input |
| `.liquid-button` | `LiquidButton` | Unificar botón y enlace con la misma API visual |
| `Pill` | `StatusChip` | Separar estado, categoría y acción |
| Estados vacíos locales | `feedback/EmptyState` | Extraer cuando exista más de un consumidor real |
| stepper de `PublicFlowShell` | etapa contextual | No mostrar cantidad de preguntas ni prometer una longitud fija |
| `backdrop-blur*` directo | variante autorizada | Eliminar de las rutas activas y reemplazar mediante tokens autorizados |
| colores y sombras arbitrarios | tokens `--vm-*` | Migración por componente, no reemplazo global ciego |

Durante la migración, los alias legacy no pueden adquirir nuevas variantes. Todo componente nuevo usa el sistema v1.

## 10. Refactor aplicado en `app/globals.css`

La habilitación selectiva mantiene este contrato:

1. Añadir tokens `--vm-*` sin cambiar estilos actuales.
2. Retirar declaraciones directas de `backdrop-filter` en superficies legacy, que permanecen opacas hasta su migración.
3. Autorizar únicamente `.glass-subtle`, `.glass-elevated` y sus atributos equivalentes.
4. Habilitar blur solo si el componente incluye `data-vm-glass="subtle"` o `data-vm-glass="elevated"`.
5. Implementar el fallback opaco antes del bloque `@supports`.
6. Activar el efecto dentro de:

```css
@supports ((-webkit-backdrop-filter: blur(1px)) or (backdrop-filter: blur(1px))) {
  [data-vm-glass="subtle"],
  [data-vm-glass="elevated"] {
    -webkit-backdrop-filter:
      blur(var(--vm-component-blur)) saturate(var(--vm-saturation-glass));
    backdrop-filter:
      blur(var(--vm-component-blur)) saturate(var(--vm-saturation-glass));
  }
}
```

7. Desactivar nuevamente blur bajo `[data-vm-visual-budget="reduced"]`, `prefers-reduced-transparency`, impresión y forced colors.
8. Eliminar blur directo solo cuando el componente equivalente haya migrado.

No se cambia la regla global por una habilitación general de Tailwind `backdrop-blur-*`.

## 11. Accesibilidad verificable

Objetivo: WCAG 2.2 nivel AA.

- Texto normal: contraste mínimo `4.5:1`.
- Texto grande: mínimo `3:1`.
- Controles, iconos informativos y foco: mínimo `3:1` contra colores adyacentes.
- Zoom a 200% sin pérdida de contenido ni funcionalidad.
- Reflow a 320 CSS px sin scroll horizontal, excepto tablas y comparadores identificados.
- Objetivo táctil recomendado de 44 × 44 px; nunca inferior a 24 × 24 px.
- Orden de tabulación coincide con el orden visual.
- Ningún `div` o `span` simula un botón sin semántica y teclado equivalentes.
- El foco siempre es visible y no queda completamente oculto.
- Modales, drawers y menús gestionan foco, `Escape` y retorno al disparador.
- Los cambios asíncronos relevantes se anuncian con regiones `aria-live`.
- Los errores se asocian al campo mediante `aria-describedby`.
- Las tablas conservan encabezados semánticos y nombre accesible.
- `prefers-reduced-motion: reduce` elimina movimiento no esencial.
- `forced-colors: active` elimina transparencias y conserva bordes del sistema.

Validación mínima por incremento:

```text
ESLint
→ axe sin violaciones críticas/serias
→ navegación manual solo con teclado
→ contraste automatizado y revisión manual del glass
→ 320, 360, 768, 1024 y 1440 px
→ 200% zoom
→ reduced motion
→ fallback sin backdrop-filter
```

## 12. Presupuesto de rendimiento

### Escritorio

- Máximo 4 superficies con blur visibles simultáneamente.
- Máximo 1 `glass-elevated` dominante por región.
- Blur máximo de 18 px.
- El área combinada con blur no supera aproximadamente 45% del viewport.

### Móvil

- Máximo 2 superficies con blur visibles simultáneamente.
- Blur máximo de 12 px.
- Sin blur en listas repetidas, cada burbuja de conversación, inputs o tarjetas dentro de carruseles.
- El encabezado sticky y la barra de acción no usan blur simultáneamente si juntos cubren más de 25% del viewport.

### Presupuesto reducido

Se aplica `data-vm-visual-budget="reduced"` cuando existe ahorro de datos, preferencia de transparencia reducida o una señal confiable de dispositivo limitado. En ese modo:

- Blur `0px`.
- Fondo de glass con opacidad mínima 0.96.
- Sin grano, shimmer continuo ni blobs secundarios.
- Sombras reducidas a `--vm-shadow-low`.
- Sin pérdida funcional o de jerarquía.

Reglas globales:

- No se anidan superficies con blur.
- No se anima `filter`, `backdrop-filter`, `box-shadow` ni `border-radius`.
- Los reflejos de hover se implementan con pseudo-elementos y `transform`.
- Los fondos ambientales no reciben eventos y usan capas limitadas.
- La conversación virtualiza o pagina historiales extensos.
- El presupuesto se verifica en un dispositivo móvil de gama media/baja, no solo en escritorio.

## 13. Criterios de aceptación por experiencia

### Prospecto

- Existe una sola acción primaria evidente por pantalla.
- La conversación funciona a 320 px y con teclado.
- El compositor acepta texto libre, crece sin ocultar el último mensaje y conserva una etiqueta accesible.
- Las galerías móviles permiten swipe horizontal sin competir con el scroll vertical; el índice observado no reinicia el gesto.
- El visor de imágenes conserva botones accesibles y añade swipe solo cuando existen varias imágenes.
- Las únicas burbujas son mensajes enviados entre el prospecto y Vivienda Colsubsidio.
- No se muestra cantidad de preguntas ni una duración fija de la conversación.
- Volver o recargar recupera la sesión sin repetir datos confirmados ni duplicar mensajes.
- Beneficios potenciales incluyen “por validar”; recursos confirmados incluyen fuente y vigencia.
- Un no afiliado recibe el mismo nivel visual y lenguaje respetuoso.
- Loading, error, desconexión y recuperación tienen diseño explícito.

### Asesor

- Resumen, Oportunidades, Agenda y Acompañamiento permanecen accesibles y etiquetados.
- Desde Resumen se llega a una acción comercial en máximo dos interacciones.
- Búsqueda y filtros son visibles en Oportunidades.
- Los filtros sobreviven al abrir y cerrar un detalle.
- La prioridad incluye explicación; no se presenta como una caja negra.
- La próxima mejor acción permanece visible sin ocultar contenido.
- Tablas y finanzas usan superficies sólidas.
- Estados vacíos, de carga, error y desconexión indican la siguiente acción.

## 14. Orden de evolución

```text
Tokens y superficies
→ entrada y navegación pública
→ conversación y resultado
→ catálogo respaldado por evidencia
→ navegación y espacios del asesor
→ accesibilidad, rendimiento y persistencia
```

Cada etapa debe cerrar lint, build, pruebas de componentes, axe y revisión responsive antes de comenzar la siguiente.

## 15. Definición de terminado del sistema v1

El sistema v1 se considera terminado cuando:

1. No existe blur directo nuevo fuera de los componentes autorizados.
2. Prospecto y asesor consumen los mismos tokens con densidades diferentes.
3. Todos los componentes base cubren sus nueve estados.
4. El fallback sin blur conserva la jerarquía y pasa contraste AA.
5. Las navegaciones objetivo funcionan con mouse, tacto y teclado.
6. Los presupuestos de blur se cumplen en escritorio y móvil.
7. No se reintroducen rutas, estilos o variantes exclusivas de marketing y administración.
8. Lint, build, axe y los recorridos E2E del MVP pasan.
9. La identidad gráfica se obtiene del recurso oficial versionado y no de símbolos dibujados localmente.
10. La documentación de rutas y comportamiento coincide con el árbol activo de `app/`.

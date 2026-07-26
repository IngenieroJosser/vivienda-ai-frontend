# Pitch de Vivienda Match AI

Guion de producción para una presentación de dos minutos que combina
HyperFrames con recorridos reales del producto.

## Decisión narrativa

Al terminar, el jurado debe creer que Vivienda Match AI puede convertir un clic
pagado en una oportunidad comercial entendida y accionable, porque aprovecha el
contexto disponible, conversa para completar únicamente lo necesario y separa
con claridad a quien está listo de quien necesita acompañamiento.

La demostración no debe intentar recorrer todas las variantes en vivo. Debe
mostrar un caso principal completo y utilizar animación para explicar las demás
rutas. Las pantallas reales prueban el producto; HyperFrames explica el sistema.

## Guion maestro de dos minutos

### 1. Hook y problema — 20 segundos

**Narración**

> Cada clic en una pauta de vivienda cuesta, pero muchas veces llega al asesor
> apenas como un nombre y un teléfono. El equipo comercial debe volver a
> descubrir quién es esa persona, qué busca y si realmente puede avanzar. El
> problema no es conseguir más leads. Es convertir el contexto que ya existe en
> oportunidades preparadas para una conversación de cierre.

**Visual**

Un anuncio de vivienda ocupa la pantalla. Al hacer clic, viajan únicamente un
nombre y un teléfono hacia una bandeja saturada. El resto del contexto aparece
disperso alrededor: campaña, proyecto consultado, afiliación, intención,
capacidad, beneficios y momento de compra. Las piezas no desaparecen; quedan
fuera del alcance del asesor.

**Transición**

Las piezas dispersas convergen en una sola línea: `Vivienda Match AI`.

### 2. Qué construimos — 20 segundos

**Narración**

> Construimos un asesor digital de Vivienda Colsubsidio que conserva el contexto
> del anuncio, aprovecha la información conocida con autorización y conversa en
> lenguaje natural para descubrir lo que falta. Luego valida capacidad,
> beneficios y proyectos reales, y entrega una oportunidad al asesor o activa
> una ruta de preparación.

**Visual**

Una sola composición, no una cuadrícula de funcionalidades:

```text
Clic de pauta
→ contexto conocido
→ conversación natural
→ evaluación explicable
→ oportunidad o acompañamiento
```

Debajo de cada etapa aparecen brevemente ejemplos reales:

- Pauta: campaña, anuncio, ubicación y proyecto de interés.
- Contexto: afiliación y relación previa, cuando una fuente autorizada los
  suministra.
- Conversación: sueño, motivación, horizonte y barrera.
- Evaluación: margen de cuota, beneficios por validar y proyectos compatibles.
- Salida: próxima acción comercial o meta concreta de preparación.

### 3. Demostración — 50 segundos

**Narración**

> Jonathan llega desde un anuncio de vivienda. El sistema conserva de qué
> campaña, anuncio y proyecto viene. Con su autorización, inicia una conversación
> sin obligarlo a llenar otro formulario. Jonathan cuenta con sus palabras qué
> vivienda imagina, para quién es y qué le preocupa.
>
> Vivienda Match interpreta el mensaje completo, solicita solo la información
> que todavía falta y aplica reglas verificables para estimar un rango
> responsable. Después contrasta su situación con el catálogo vigente y explica
> por qué cada proyecto puede encajar.
>
> Cuando existe una oportunidad real, Jonathan autoriza el contacto. El asesor
> recibe la misma evaluación, el contexto de la pauta, la conversación, los
> proyectos y una siguiente acción clara. Si aún no puede avanzar, el sistema no
> lo descarta: activa un plan de acompañamiento y una fecha de reevaluación.

**Recorrido visual**

1. **0–6 s — Animación:** anuncio de Meta → parámetros permitidos → sesión.
2. **6–14 s — Producto real:** consentimiento e inicio personalizado.
3. **14–25 s — Producto real:** Jonathan escribe libremente; respuesta
   contextual del orientador.
4. **25–33 s — Animación:** ingreso disponible → margen responsable de vivienda
   → validación de beneficios → catálogo verificable.
5. **33–41 s — Producto real:** resultado con máximo tres proyectos, razones,
   información vigente y recorrido 360.
6. **41–50 s — Producto real:** solicitud de contacto → oportunidad visible →
   asesor toma el caso y ve la próxima acción.

La navegación real debe grabarse sin esperas. El indicador de escritura puede
recortarse, pero no deben alterarse los estados ni las respuestas.

### 4. Tecnología y por qué importa — 10 segundos

**Narración**

> Next.js entrega una experiencia móvil rápida; FastAPI conserva sesiones,
> evaluación y operación comercial; y un agente conversacional extrae señales
> estructuradas sin decidir la elegibilidad. Las reglas financieras, el control
> regulatorio y el catálogo siguen siendo verificables y auditables.

**Visual**

No mostrar una nube de logotipos. Mostrar tres capas:

```text
Experiencia conversacional
Reglas y recomendación explicable
Persistencia y operación comercial
```

En una esquina, en cuerpo secundario:

`Next.js · FastAPI · SQLite/PostgreSQL-ready · OpenAPI · agente con fallback`

### 5. Equipo, siguiente paso y cierre — 20 segundos

**Narración**

> Somos un equipo que conectó experiencia, datos y operación comercial en un
> solo recorrido. El siguiente paso es un piloto controlado con campañas y
> fuentes autorizadas de Colsubsidio para medir cuánto contexto recuperamos,
> cuántas conversaciones se completan y cuánto mejora el primer contacto.
>
> Vivienda Match no busca preguntarle más al cliente. Busca entender mejor su
> sueño y entregar al asesor una oportunidad preparada para hacerlo posible.

**Visual**

Primero aparece el equipo con una responsabilidad concreta por persona. Después
se transforma en el objetivo del piloto:

```text
Menos preguntas repetidas
Más contexto útil
Mejor primer contacto
```

Último cuadro:

> El clic inicia la conversación. El contexto acerca el cierre.

## Storyboard de HyperFrames

### HF-01 — El contexto se pierde

**Duración:** 8 segundos.

**Composición:** 1920 × 1080, 30 fps. Fondo claro institucional. Un anuncio
residencial real entra desde la izquierda. Al recibir el clic, una tarjeta
pequeña con `Nombre + teléfono` llega al asesor, mientras seis señales quedan
flotando y fuera de alcance.

**Señales visibles:** campaña, proyecto consultado, afiliación conocida,
motivación, capacidad y horizonte.

**Movimiento:** traslaciones de 12–24 px, opacidad y escala entre 0,98 y 1.
Nada de rebotes, partículas, circuitos, robots ni iconografía de IA.

**Texto en pantalla:** `Un clic puede traer interés sin traer contexto.`

### HF-02 — El contexto acompaña el clic

**Duración:** 7 segundos.

**Composición:** el anuncio se convierte en una línea continua que recoge:

```text
Campaña → anuncio → ubicación → proyecto → referencia del clic
```

Luego incorpora, bajo consentimiento:

```text
Relación conocida → conversación → evaluación
```

**Texto en pantalla:** `Conservamos lo útil. Preguntamos solo lo necesario.`

No mostrar que el navegador conoce afiliación, salario, estado civil o consumos.
Esos datos solo pueden aparecer como respuesta de una fuente autorizada después
de una identificación segura.

### HF-03 — Una conversación, varias señales

**Duración:** 8 segundos.

**Composición:** una única burbuja escrita por el prospecto:

> Busco un lugar para vivir con mi hija. Quiero dejar de pagar arriendo este año,
> pero todavía me preocupa la cuota inicial.

Sin separar la frase, aparecen al costado cinco señales:

- Hogar de dos personas.
- Motivación: dejar el arriendo.
- Horizonte cercano.
- Objetivo: vivienda propia.
- Barrera: cuota inicial.

**Texto en pantalla:** `Una respuesta natural puede evitar cinco preguntas.`

### HF-04 — Evaluación verificable

**Duración:** 8 segundos.

**Composición:** el ingreso disponible entra a una banda. El margen máximo de
vivienda se delimita visualmente sin mostrar una aprobación crediticia. Después
se cruzan ubicación, hogar, horizonte, capacidad y preferencias con el catálogo.

**Texto en pantalla:** `La conversación aporta señales. Las reglas toman la
decisión.`

Mostrar `Estimación orientativa` de forma permanente.

### HF-05 — Todos los desenlaces

**Duración:** 12 segundos.

La línea central se abre en ramas, una por vez:

1. **Preparación alta:** proyectos compatibles → autoriza contacto →
   oportunidad.
2. **En desarrollo:** barrera concreta → meta → hitos → reevaluación.
3. **Etapa inicial:** orientación realista → contenidos → horizonte futuro.
4. **Información incompleta:** una pregunta aclaratoria → nueva evaluación sin
   duplicados.
5. **Comprador anterior / nueva compra:** vuelve al perfilamiento comercial.
6. **Mejoramiento:** orientación de beneficios, sin crear oportunidad de venta.
7. **Beneficios:** ruta informativa, sin crear oportunidad de venta.
8. **Postventa:** ruta de servicio, sin crear oportunidad de venta.

**Texto en pantalla:** `Cada persona avanza por la ruta que corresponde.`

Las ramas de servicio no deben terminar en el dashboard comercial.

### HF-06 — La oportunidad llega preparada

**Duración:** 7 segundos.

**Composición:** el resultado del prospecto se transforma en la vista de
oportunidad del asesor. Los mismos identificadores de proyecto y razones viajan
sin cambiar.

**Orden visual:**

1. Por qué atender ahora.
2. Qué sabemos.
3. Qué descubrió la conversación.
4. Capacidad y beneficios.
5. Proyectos y evidencia.
6. Próxima acción.

**Texto en pantalla:** `El asesor recibe contexto, no un lead crudo.`

## Matriz de flujos para grabación y animación

| Flujo | HyperFrames | Producto real | Desenlace visible |
| --- | --- | --- | --- |
| Preparación alta | Resumen de señales y evaluación | Conversación, resultado y dashboard | Oportunidad para contacto |
| En desarrollo | Brecha, meta y reevaluación | Resultado y acompañamiento | Plan activo |
| Etapa inicial | Horizonte y ruta gradual | Resultado orientativo | Preparación de largo plazo |
| Información incompleta | Campo faltante y nueva versión | Pregunta aclaratoria | Continúa la conversación |
| No afiliado | Validación 90/10 sin penalización | Resultado coherente | Oportunidad o espera regulatoria |
| Comprador anterior: nueva vivienda | Derivación al flujo comercial | Conversación | Evaluación de nueva compra |
| Comprador anterior: mejoramiento | Desvío de servicio | Resultado específico | Orientación de mejoramiento |
| Comprador anterior: beneficios | Desvío de servicio | Resultado específico | Información de beneficios |
| Comprador anterior: postventa | Desvío de servicio | Resultado específico | Ruta de servicio |
| Servicio temporalmente caído | Fallback y resincronización | Estado recuperable | Una sola sesión canónica |

## Capturas reales necesarias

Grabar cada pieza por separado para poder ajustar el ritmo:

1. Entrada `/orientacion` con parámetros de campaña permitidos.
2. Consentimiento.
3. Mensaje libre de una persona preparada.
4. Pregunta aclaratoria de información faltante.
5. Resultado de preparación alta.
6. Resultado en desarrollo con meta y fecha.
7. Proyecto recomendado, plano y recorrido 360.
8. Solicitud de contacto.
9. Oportunidad en bandeja.
10. Reclamo de oportunidad y siguiente acción.
11. Acompañamiento y progreso persistido.
12. Una ruta de servicio de comprador anterior.

Todas las capturas deben usar la misma resolución, datos sintéticos coherentes y
el reloj del sistema oculto cuando no aporte valor.

## Datos de pauta para la demostración

URL sugerida:

```text
http://localhost:3000/orientacion
?utm_source=meta
&utm_medium=paid-social
&utm_campaign=vivienda_familias_bogota
&utm_content=video_hogar_03
&utm_term=vivienda_vis
&campaign_id=12021001
&adset_id=12021002
&adset_name=familias_bogota
&ad_id=12021003
&ad_name=video_hogar_03
&placement=instagram_stories
&site_source_name=ig
&project_id=abeto
&fbclid=IwZXh0bgNhZW0CMTEAAR_demo-30x
&leadId=vm_Jonathan30X1
```

La URL es un fixture de demostración. No debe presentarse como una integración
real con Meta ni como información real de una persona.

## Dirección visual y de movimiento

- Paleta clara de Colsubsidio; evitar fondos negros.
- Fotografía y planos reales de los proyectos como material protagonista.
- Manrope para mantener continuidad con el producto.
- Una idea principal por cuadro.
- Animar principalmente opacidad y transformaciones.
- Curva recomendada: `cubic-bezier(0.22, 1, 0.36, 1)`.
- Entrada rápida: 160–220 ms.
- Cambio de escena: 280–420 ms.
- Movimiento ambiental: máximo 12–16 px.
- Mantener una versión sin movimiento para respaldo y accesibilidad.
- No animar texto letra por letra.
- No simular respuestas, aprobaciones, integraciones o resultados que el
  producto real no pueda reproducir.

## Plan de respaldo

Preparar tres entregables:

1. Demo en vivo del recorrido principal.
2. Video continuo de dos minutos con narración.
3. Clips independientes por flujo para responder preguntas del jurado.

Si falla la red, utilizar el video continuo. Si el jurado pregunta por una rama,
mostrar el clip correspondiente y después abrir la vista real que sustenta ese
resultado.

## Métricas para el piloto

No prometer mejoras porcentuales sin datos. Proponer medir:

- Porcentaje de clics con atribución completa.
- Porcentaje de información conocida reutilizada con autorización.
- Preguntas evitadas por sesión.
- Conversaciones iniciadas y completadas.
- Abandono por momento de la conversación.
- Oportunidades entregadas con siguiente acción.
- Tiempo hasta el primer contacto.
- Prospectos que avanzan después del acompañamiento.
- Consistencia entre resultado público y portal comercial.

## Frases que no deben aparecer

- “La IA predice quién comprará”.
- “Aprobación automática”.
- “Beneficio garantizado”.
- “Proyecto disponible” sin vigencia.
- “Lead descartado”.
- “La campaña aumenta el puntaje”.
- “Conocemos todos tus datos”.

La propuesta se defiende mejor como una combinación de contexto autorizado,
conversación natural, reglas verificables y operación comercial consistente.

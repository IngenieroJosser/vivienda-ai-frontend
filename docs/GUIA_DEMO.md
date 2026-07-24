# Guía de demostración

## Narrativa de seis minutos

### 1. Problema — 40 segundos

Los leads pagos llegan con intención, pero sin la profundidad de perfil que tienen los orgánicos. La solución no reemplaza al asesor: evita que tenga que descubrir todo desde cero.

### 2. Captación y personalización — 90 segundos

- Abrir `/demo` o `/orientacion`.
- Elegir un origen/campaña.
- Mostrar que la conversación cambia según lo conocido.
- Aclarar que el sistema pregunta solo el siguiente dato con mayor impacto.

### 3. Decisión y proyectos — 70 segundos

- Mostrar score, ruta y razones.
- Explicar la separación entre capacidad y regla 90/10.
- Mostrar máximo tres proyectos, brochure y recorrido cuando existan.

### 4. Asesor — 70 segundos

- Abrir `/asesor/leads`.
- Mostrar perfil, bloqueos, proyecto y siguiente acción.
- Explicar que el asesor conserva el cierre, la validación y la relación humana.

### 5. Simulación — 40 segundos

- Abrir `/asesor/simulador`.
- Cambiar ahorro, obligaciones u horizonte.
- Mostrar cómo cambia la ruta sin alterar el lead real.

### 6. Inteligencia — 50 segundos

- Abrir `/asesor/inteligencia`.
- Mostrar 4.142 registros, calidad, latencia y métricas del recomendador.
- Mostrar Search Console como integración agregada.
- Explicar que Apify es consentido y opcional.

## Escenarios

1. Afiliado listo: cierre/agendamiento.
2. No afiliado con capacidad: revisión 90/10, no descarte.
3. Afiliado con brecha de ahorro: nutrición y reevaluación.

## Contingencia

- Si FastAPI falla, el frontend mantiene el flujo local.
- Si el LLM falla, se usa proveedor mock/plantillas.
- Si Apify o Search Console no están configurados, se muestra estado pendiente sin afectar el caso.

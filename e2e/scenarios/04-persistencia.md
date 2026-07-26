# Escenario 4 — Persistencia tras recarga

> **Crítico para la demo.** Demuestra que el recorrido sobrevive a recargas, cierres de pestaña y caídas del backend.

## Perfil usado

**Jonathan** (cualquier prospecto del escenario 1 o 3).

## Precondiciones

- Backend activo en `:3001`.
- Frontend activo en `:3000`.
- Token vigente.
- Jonathan en estado `ASSIGNED` (tras escenario 3) o `PENDING` (tras escenario 1).

## Pasos

### 1. Estado inicial conocido

1. Abrir el detalle de Jonathan.
2. Anotar: estado, asesor asignado, próxima acción, fecha de seguimiento.
3. Registrar el `workflow_version`.

### 2. Recarga dura

1. Cerrar la pestaña completamente.
2. Volver a abrir `http://localhost:3000/asesor/leads/{id}` directamente (sin pasar por la bandeja).
3. Confirmar que la página carga con los mismos valores que el paso 1.

### 3. Recarga en otra pestaña

1. Abrir el mismo detalle en dos pestañas.
2. Hacer un cambio de estado en la pestaña A.
3. Recargar la pestaña B.
4. Confirmar que B refleja el cambio hecho en A.

### 4. Caída simulada del backend

1. Detener el backend (`Ctrl+C`).
2. Intentar navegar a `/asesor/leads/{id}`.
3. Confirmar que la UI muestra un estado de error legible (no pantalla en blanco).
4. Volver a arrancar el backend.
5. Confirmar que la página recupera los datos al reintentar.

### 5. Persistencia de la actividad

1. Registrar una actividad nueva (ej. "Llamada de seguimiento").
2. Cerrar y reabrir el detalle.
3. Confirmar que la actividad sigue visible con su timestamp.

## Resultado esperado

| Punto de verificación | Esperado |
|---|---|
| Recarga dura | mismos valores visibles |
| Cambio en pestaña A → recarga en pestaña B | B refleja el cambio |
| Backend caído | UI muestra error legible, no crash |
| Backend recuperado | UI recarga correctamente |
| Actividad registrada | persiste tras recarga |

## Evidencia para la demo

- Captura antes de recargar.
- Captura después de recargar (deben coincidir).
- Captura del estado de error legible cuando el backend está caído.

## Mensaje para el jurado

> "El sistema no depende del estado del navegador. La fuente de verdad es el backend; la UI solo renderiza y captura eventos."

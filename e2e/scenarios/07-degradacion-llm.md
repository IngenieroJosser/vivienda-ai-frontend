# Escenario 7 — Degradación del LLM y fallback

> **Importante para la demo.** Demuestra que el flujo NO se rompe cuando el proveedor LLM falla, expira o devuelve respuestas vacías.

## Perfil usado

**Jonathan** o cualquier prospecto activo.

## Precondiciones

- Backend activo.
- Frontend activo.

## Pasos

### 1. Verificar el proveedor configurado

```bash
cd vivienda-ai-backend
source .venv/bin/activate
grep LLM_PROVIDER .env
```

Si está en `mock`, los siguientes pasos requieren simular un fallo.

### 2. Simular fallo del proveedor

Opción A — Apuntar a un endpoint inválido:

```bash
# Editar .env y reiniciar el backend
LLM_PROVIDER=openai_compatible
OPENAI_BASE_URL=https://endpoint-inexistente.example.com
OPENAI_API_KEY=fake-key
LLM_TIMEOUT_SECONDS=2
```

Opción B — Cambiar a `mock` y modificar el orquestador para devolver vacío:

```python
# En app/intelligence/ai/providers.py, método MockLLMProvider.generate:
def generate(self, ...):
    raise TimeoutError("simulated timeout")
```

### 3. Recorrer el flujo de orientación

1. Abrir `/orientacion` en el navegador.
2. Aceptar consentimiento.
3. Responder al menos 3 mensajes del chat.
4. Completar la conversación.

### 4. Verificar el comportamiento degradado

1. El chat debe seguir respondiendo (no debe quedarse colgado).
2. La respuesta del asistente debe provenir del **fallback determinístico**, no del LLM.
3. El `response_source` en los logs del backend debe ser `DETERMINISTIC_FALLBACK`.
4. La orientación debe completarse normalmente y el resultado debe mostrarse.

### 5. Restaurar el proveedor original

1. Revertir los cambios en `.env` o en el orquestador.
2. Reiniciar el backend.
3. Confirmar que el chat vuelve a usar el proveedor configurado.

## Resultado esperado

| Punto de verificación | Esperado |
|---|---|
| `response_source` en logs | `DETERMINISTIC_FALLBACK` |
| `assistant_text` | sigue llegando al frontend |
| `route` y `recommendations` | calculados por reglas (no por LLM) |
| `audit_events` | nuevo evento registrado indicando fallback |
| Tiempo de respuesta | ≤ 2 segundos por mensaje |

## Evidencia para la demo

- Captura del log del backend mostrando `DETERMINISTIC_FALLBACK`.
- Captura del chat funcionando con respuestas del fallback.
- Captura del resultado final (igual de completo que con LLM real).

## Mensaje para el jurado

> "El LLM es una **ayuda**, no una dependencia. Si falla, el flujo sigue funcionando con lógica determinística. Esto es lo que hace que la demo no se rompa en vivo."

## Riesgos conocidos

- Si el fallback determinístico está incompleto para algún tipo de pregunta, el chat puede dar respuestas rígidas.
- Si el tiempo de espera del fallback supera los 5 segundos, el usuario percibe la app como caída.

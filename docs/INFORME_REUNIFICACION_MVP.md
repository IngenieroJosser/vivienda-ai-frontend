# Informe de reunificación y cierre del MVP

> Vivienda Match AI · Colsubsidio × 30X  
> Auditoría realizada el 26 de julio de 2026  
> Fuente de verdad analizada: Git, código, OpenAPI y suites automatizadas

## 1. Resumen ejecutivo

La auditoría inicial de `origin/main` situó el producto aproximadamente en un
**55–60 % de la Definition of Done**. La parte comercial construida en la línea
de Erick estaba cerca del **85 %**, pero no había sido incorporada a `main`.

La reunificación local corrige los tres bloqueadores técnicos de `main`,
recupera la bandeja backend-first y conserva el agente conversacional nuevo. El
estado técnico posterior a estas correcciones se estima en **75–80 %**. Lo que
falta ya no es otra funcionalidad estructural: es completar la validación E2E,
registrar evidencia, probar recuperación real y grabar el video.

### Qué tan lejos estábamos al iniciar

| Dimensión | Estado en `origin/main` | Avance estimado | Brecha principal |
|---|---|---:|---|
| Flujo del prospecto | Parcial | 65 % | Chat sin credencial de sesión y respuestas sugeridas visibles |
| Reglas y matching | Parcial | 60 % | Campaña y canal alteraban recomendación |
| Integración comercial | Parcial | 55 % | Se perdió el cliente A4.7 completo y la bandeja backend-first |
| Seguridad | Insuficiente | 35 % | Endpoints internos y chat expuestos |
| Resiliencia | Parcial | 60 % | Fallback disponible, pero contrato y recuperación incompletos |
| UX del asesor | Avanzada en `Erick`, regresada en `main` | 65 % | `main` volvió a priorizar estado local y módulos de inteligencia |
| Pruebas automatizadas | Parcial | 70 % | Suite verde después de corregir una prueba obsoleta; faltaban casos A4.7 |
| E2E y evidencia | Sin ejecutar | 15 % | Escenarios escritos, no ejecutados dos veces |
| Presentación final | Sin cerrar | 20 % | Sin video ni commit final identificado |
| **Estimado global inicial** | **MVP no demostrable con confianza** | **55–60 %** | **Tres NO-GO y ramas divergentes** |

## 2. Evidencia de ramas

El hecho central es verificable:

```text
cc6a024 no pertenece a origin/main
```

Resultados de Git al iniciar la reunificación:

```text
merge-base(origin/main, origin/Erick)
afbca1c3b9ad2db03b90f67bba8938ed05e78be0

rev-list --left-right --count origin/main...origin/Erick
6  12
```

Interpretación:

- `origin/main` tenía 6 commits que `Erick` no tenía.
- `origin/Erick` tenía 12 commits que `main` no tenía.
- Ninguna de las dos ramas era un superconjunto de la otra.
- `cc6a024` solo estaba contenido en `origin/Erick` y
  `origin/feature/Alejandro`.
- El commit `d8c9dab`, que introdujo chatbot y dashboard en la otra línea, fue
  creado después desde una base que no contenía `cc6a024`.

Por tanto, el problema no era un conflicto atribuible al código de Erick. Era
la consecuencia normal de continuar el desarrollo desde dos líneas que
divergieron en `afbca1c`.

## 3. Qué tenía cada línea

### Línea `Erick`

Contenido exclusivo valioso:

- Cliente A4.7 para `claim`, workflow, actividades y filtros.
- Traducción de errores comerciales `403/409`.
- Reutilización de `Idempotency-Key` al reintentar.
- Refresco del snapshot canónico después de mutaciones.
- Dashboard A2 backend-first:
  - Por reclamar.
  - Asignadas a mí.
  - SLA o seguimiento vencido.
- Selección maestro–detalle estable.
- Compatibilidad con IDs reales del backend.
- Siete recorridos E2E documentados.
- Pruebas de integración comercial.
- Eliminación posterior del seeder SQLite directo.

Si se hubiera adoptado `main` sin reunificación se habría perdido o debilitado
esa capa operativa.

### Línea `main`

Contenido nuevo que debía conservarse:

- Agente conversacional y fallback determinístico.
- Persistencia de turnos y registros de conversación.
- Endpoint `/conversations`.
- Integración del chat en la experiencia pública.
- Resumen del agente para el asesor.
- Contratos OpenAPI ampliados.
- Configuración de despliegue.

Contenido agregado fuera del alcance del MVP:

- Vista pública de “Inteligencia”.
- Analítica del modelo dentro del flujo principal del asesor.
- Aprendizaje y exportación visibles como módulo de producto.
- Enriquecimiento y scraping configurables.
- Documentación duplicada de implementación.

La reunificación conserva el agente y retira de navegación los módulos que no
ayudan a demostrar el recorrido central.

## 4. Tres bloqueadores NO-GO encontrados en `main`

| Bloqueador | Evidencia inicial | Riesgo | Estado en reunificación |
|---|---|---|---|
| Endpoints internos públicos | `/admin/*`, parte de `/analytics/*` y `/ai/*` no exigían actor | Exposición de información y funciones internas | Corregido con `ADVISOR`/`SUPERVISOR` |
| Sesgo de campaña | `campaign_bonus = 0.15` y `channel` en `MODEL_FEATURES` | Una pauta podía alterar el ranking sin compatibilidad real | Corregido; campaña y canal son solo trazabilidad |
| Chat controlado por `session_id` | Mensajes, recuperación y rechazo no exigían token de prospecto | Acceso horizontal si se conoce otro identificador | Corregido con token firmado ligado a la sesión |

Estos bloqueadores estaban vivos en `origin/main`. No deben confundirse con el
estado corregido de `feature/Reunification`.

## 5. Cumplimiento real por tarea

| Tarea | Estado inicial verificado | Estado en reunificación | Evidencia |
|---|---|---|---|
| J1 — Configuración y endpoints seguros | Parcial | Completado técnico | RBAC interno, CORS configurable y token de prospecto |
| J2 — Integridad del scoring | Sin terminar | Completado técnico | Sin `campaign_bonus`; `channel` fuera del modelo |
| J3 — Chat con fallback | Parcial e inseguro | Completado técnico | Endpoint, persistencia, fallback y sesión autorizada |
| J4 — Contrato final backend | Sin congelar | Parcial alto | OpenAPI regenerado; falta declarar commit de congelamiento |
| E1 — Tipos, mapper y estados | Completado en `Erick`, ausente parcialmente en `main` | Integrado | Tipos canónicos y mappers conservados |
| E2 — Cliente A4.7 | Completado en `Erick` | Integrado | Filtros, claim, actividad, workflow y errores |
| E3 — Cliente del chat | Parcial en `main` | Completado técnico | Token de sesión enviado en cada operación |
| E4 — Pruebas frontend | Parcial | Parcial alto | Suite automatizada verde; falta evidencia de navegador |
| A1 — Detalle operativo | Completado en `Erick` | Integrado | Acción visible, actividad y snapshot canónico |
| A2 — Dashboard mínimo | Regresado en `main` | Integrado | Tres secciones backend-first |
| A3 — Experiencia del chat | Parcial | Completado técnico | Texto libre, sin chips, estados humanos y fallback |
| A4 — E2E y presentación | Documentado | En proceso | Siete guías presentes; falta ejecución, video y evidencia |

## 6. Gap frente a la Definition of Done

### Estado inicial de `origin/main`

La evaluación conservadora fue:

```text
4 de 17 cumplidos con confianza
8 de 17 parciales
5 de 17 sin cumplir
```

### Estado posterior a la reunificación técnica

| Criterio | Estado |
|---|---|
| Prospecto completa el flujo en navegador | Parcial: falta ejecución documentada |
| Conversación persiste sin duplicarse | Cumplido por pruebas |
| LLM no decide negocio | Cumplido |
| Fallback mantiene el flujo | Cumplido |
| Solo proyectos compatibles | Cumplido por reglas y pruebas |
| Prospecto no preparado recibe acompañamiento | Cumplido |
| UI no muestra probabilidad ni aprobación | Cumplido |
| Lead aparece con contexto en bandeja | Cumplido técnicamente |
| Asesor reclama y registra actividad | Cumplido técnicamente |
| Acceso horizontal bloqueado | Cumplido por pruebas backend |
| Recarga conserva conversación, workflow y actividad | Parcial: falta E2E |
| Endpoints internos protegidos | Cumplido |
| Pruebas backend y frontend verdes | Cumplido |
| Build de producción verde | Cumplido |
| E2E ejecutado dos veces | Pendiente |
| Video de respaldo | Pendiente |
| Commit exacto de demo identificado | Parcial hasta congelar la rama |

Balance actual estimado:

```text
11 cumplidos
3 parciales
3 pendientes
```

## 7. Qué falta para cerrar, en orden

1. Terminar la reunificación y dejar frontend y backend sin cambios sueltos.
2. Regenerar OpenAPI y tipos una última vez.
3. Ejecutar todas las suites y build de producción.
4. Iniciar frontend y backend con una base limpia de demostración.
5. Ejecutar los siete escenarios E2E documentados.
6. Repetir el recorrido crítico completo una segunda vez.
7. Verificar recarga, token expirado, fallback y actividad idempotente.
8. Registrar capturas, resultados y errores de consola.
9. Grabar un video de respaldo de dos minutos.
10. Identificar los SHAs exactos de frontend y backend.
11. Congelar código.
12. Solo entonces decidir merge y push.

No debe agregarse:

- RAG.
- Otro proveedor LLM.
- CRM.
- Analítica gerencial.
- Scraping.
- MLOps.
- Nuevas pantallas.
- Más diseño.

## 8. Decisiones de reunificación

- Rama local utilizada: `feature/Reunification`.
- Base: `origin/main`.
- Se conservaron el chatbot y los contratos nuevos.
- Se recuperaron selectivamente los commits útiles de `Erick`.
- No se incorporó el seeder SQLite directo.
- No se mezcló `feature/implement`.
- Se eliminaron respuestas rápidas visibles.
- Se retiró “Inteligencia” de la navegación del asesor.
- No se realizó `push`.

## 9. Validación técnica de la reunificación

Resultados obtenidos sobre `feature/Reunification`:

| Verificación | Resultado |
|---|---|
| Backend | 54 pruebas aprobadas |
| Calidad backend modificada | Ruff limpio en todos los archivos intervenidos |
| Deuda backend heredada | El lint global aún reporta incidencias en módulos de inteligencia y datos ajenos a esta reunificación |
| Frontend | 167 pruebas aprobadas en 34 archivos |
| ESLint frontend | Limpio |
| Build de producción | 39 páginas compiladas |
| Integridad del diff | Sin errores de espacios mediante `git diff --check` |

Estas comprobaciones validan compilación, contratos y comportamiento cubierto
por pruebas. No reemplazan la ejecución E2E pendiente en navegador.

## 10. Anexo: comandos de solo lectura utilizados

```bash
git status --short --branch
git remote -v
git branch --show-current
git for-each-ref refs/remotes/origin --sort=-committerdate
git log --graph --decorate --oneline --all
git log --oneline origin/main..origin/Erick
git log --oneline origin/Erick..origin/main
git rev-list --left-right --count origin/main...origin/Erick
git merge-base origin/main origin/Erick
git branch -r --contains cc6a024
git diff --stat origin/Erick..origin/main
git diff --name-status origin/main..origin/Erick
git show --stat <commit>
git show origin/Erick:<ruta>
git ls-tree -r --name-only <rama>
git diff --check
rg -n "<patrón>" <rutas>
```

Los comandos de pruebas y build no se clasifican como solo lectura porque
pueden generar cachés, bases temporales o artefactos locales.

## 11. Lo esencial en tres frases

1. La parte comercial de `Erick` estaba muy avanzada; lo que faltaba era
   reunificarla con el chat seguro, la integridad del recomendador y la
   evidencia E2E.
2. `origin/main` no estaba listo para demo porque mantenía tres NO-GO y módulos
   fuera del alcance; esos NO-GO ya están corregidos localmente.
3. La divergencia no fue causada por un defecto del trabajo de Erick, sino por
   continuar desde ramas que no compartían los commits más recientes.

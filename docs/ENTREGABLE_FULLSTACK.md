# Entregable full-stack

## Cambios aditivos sobre el frontend recibido

No se retiraron rutas, textos, escenarios ni lógica local. Se agregaron:

- Cliente FastAPI en `lib/backend-api.ts`.
- Sincronización no bloqueante en `features/prospect/backend-sync.ts`.
- Simulador para asesor en `/asesor/simulador`.
- Centro de inteligencia en `/asesor/inteligencia`.
- Navegación hacia ambos módulos.
- Variables de entorno y despliegue Docker.

## Backend agregado

- FastAPI modular.
- SQLite por defecto y PostgreSQL con Docker.
- Persistencia de sesiones, turnos, evaluaciones, proyectos, enriquecimientos, auditoría y simulaciones.
- EDA reproducible.
- Pipeline de los tres insumos.
- CatBoost entrenado con `project_id`.
- Regla 90/10 separada del score de capacidad.
- API de simulaciones.
- Abstracción LLM real/mock.
- Adaptadores Apify/Search Console opcionales.
- Registro externo deliberadamente deshabilitado.

## Validaciones ejecutadas

- 4.142 registros procesados.
- 18 proyectos cargados.
- 22 diapositivas de buyer personas extraídas.
- Modelo entrenado y metadata generada.
- 5 pruebas backend aprobadas.
- Smoke tests de health, proyectos, analytics, calidad, scope, Search Console y simulación.
- 123 archivos TS/TSX analizados sintácticamente.
- Imports locales verificados.
- Nombres de iconos verificados.
- Enlaces internos literales verificados.
- CSS con llaves balanceadas.
- Los 207 archivos originales del ZIP permanecen presentes.

## Pendiente para ambiente con acceso a npm

```bash
yarn install --immutable
yarn lint
yarn test
yarn build
```

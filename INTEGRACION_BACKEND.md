# Integración Frontend–Backend

## Configuración

Crear `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

Backend `.env`:

```env
CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
```

## Flujo conectado

1. El prospecto inicia una orientación.
2. Cada cambio de sesión se conserva localmente para tolerancia a fallos.
3. La sesión se sincroniza con `POST /api/v1/leads/sync`.
4. FastAPI persiste el lead, la conversación y el perfil consolidado.
5. El motor de reglas define ruta, prioridad, capacidad y bloqueadores.
6. El recomendador entrega hasta tres proyectos.
7. El resultado local se actualiza con la evaluación del backend.
8. La bandeja `/asesor/leads` consulta leads reales desde FastAPI.
9. El detalle `/asesor/leads/{id}` muestra expediente, conversación y recomendaciones persistidas.

## Ejecución

Backend:

```powershell
python -m app.cli db-init
python -m app.cli seed-projects
python -m uvicorn app.main:app --reload
```

Frontend:

```powershell
Copy-Item .env.example .env.local
npm install
npm run dev
```

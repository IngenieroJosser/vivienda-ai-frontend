# Cambios implementados

## Backend

- OpenAI Agents SDK con salida Pydantic y herramientas controladas.
- Prompt contextualizado al reto de Vivienda Colsubsidio.
- Fallback determinístico si el LLM no está disponible.
- API `/api/v1/conversations` para iniciar, continuar y recuperar sesiones.
- Persistencia transaccional del lead, turnos, perfil, evaluación y journey.
- Recomendación de máximo tres proyectos con referencia de presupuesto.
- Motor 90/10 demostrativo y ruta `REGULATORY_WAITLIST`.
- Acompañamiento automatizado para ahorro, obligaciones, datos faltantes y
  reevaluación.
- Handoff estructurado al asesor para perfiles listos.
- Tabla `chat_leads` con feedback, correcciones y resultado observado.
- Exportación supervisada y entrenamiento de router local de próxima acción.
- JWT temporal para las vistas internas del asesor.
- 41 pruebas automatizadas aprobadas.

## Frontend

- Chatbot conectado a la Conversations API.
- Estado local recuperable y fallback visual.
- Visualización del modo `OPENAI_AGENTS` o `DETERMINISTIC_FALLBACK`.
- Resultado oficial del backend como fuente de verdad.
- Proyectos recomendados y plan de acompañamiento.
- Bandeja y detalle de leads consumidos desde FastAPI.
- Panel ChatLead para revisión del asesor.
- Página `/asesor/inteligencia` para métricas y exportación supervisada.
- Navegación del asesor actualizada.
- 151 archivos TypeScript/TSX verificados sin errores de sintaxis.

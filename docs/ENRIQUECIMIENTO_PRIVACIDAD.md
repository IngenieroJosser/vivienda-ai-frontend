# Enriquecimiento, fuentes externas y privacidad

## Decisión de producto

El diferenciador no es “scrapear más personas”. Es hacer mejores preguntas, reutilizar datos autorizados, explicar la decisión y entregar un caso accionable al asesor.

## Apify

El adaptador admite únicamente:

- URL pública aportada por la persona.
- Consentimiento explícito.
- Finalidad de personalización de la orientación.
- Campos permitidos: ciudad, país, industria, cargo, empresa, educación y titular profesional cuando el Actor los devuelve.

No se admiten búsquedas por nombre, cédula, teléfono o correo. Los datos enriquecidos no se incorporan al score financiero ni a la política 90/10.

## Google Search Console

Se utiliza para conocer intención orgánica agregada:

- consultas,
- páginas,
- dispositivo,
- clics,
- impresiones,
- CTR,
- posición.

No identifica por sí sola a una persona ni reemplaza CRM, UTM o atribución de campañas.

## Croma / fuentes de gobierno

Croma existe como proveedor de acceso tipado a fuentes públicas de gobierno. No se habilita la consulta por documento en este MVP porque casos judiciales, quejas, insolvencias o datos semejantes no son necesarios para recomendar vivienda y pueden generar decisiones desproporcionadas.

El contrato `ExternalRegistryAdapter` falla cerrado. Antes de implementarlo se requiere:

1. proveedor y endpoint contratados,
2. finalidad legítima documentada,
3. autorización previa, expresa e informada cuando corresponda,
4. minimización y retención,
5. análisis jurídico y de impacto,
6. revisión humana,
7. prohibición de usarlo como aprobación crediticia o exclusión automática.

## Datos prohibidos en scoring

- género,
- estrato como criterio de rechazo,
- procesos o denuncias obtenidos por scraping,
- información sensible,
- datos no confirmados,
- inferencias de deuda o historial crediticio no autorizadas.

## Auditoría

Cada enriquecimiento guarda proveedor, URL, finalidad, consentimiento, campos recolectados, advertencias, estado y fecha. La evaluación principal funciona incluso si el proveedor externo falla.

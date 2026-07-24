# Datos, EDA, modelo e IA

## Datos históricos

La base entregada tiene 4.142 registros y 27 columnas de origen. El pipeline agrega campos normalizados, entre ellos:

- `project_id`
- `fec_opcion_date`
- `fecha_desistimiento_date`
- `event_desistimiento`
- `vlr_vivienda_cop`

Resultados del procesamiento incluido:

- 4.142 filas de origen.
- 3.692 filas mapeadas a 18 proyectos del catálogo actual.
- 450 filas correspondientes a proyectos históricos no presentes en los recursos actuales.
- 550 registros con desistimiento observado.
- Rango de fecha de opción: 05/01/2024 a 16/07/2026.

## Advertencias

1. La unidad se trata como opción de compra hasta que un mentor confirme si equivale a persona única.
2. La ausencia de desistimiento combina procesos vigentes y procesos exitosos.
3. `MEDIO` no separa de forma confiable pagado y orgánico.
4. El divisor 10.000 del valor de vivienda está parametrizado según la guía y requiere confirmación.
5. Las variables posteriores a la elección se excluyen del recomendador.

## Variable operacional

`lead_route` es una salida determinística:

- `READY_TO_CLOSE`
- `NEEDS_VALIDATION`
- `NON_AFFILIATE_REVIEW`
- `NURTURE`
- `FINANCIAL_PREPARATION`

No se entrena con la base porque faltan los leads que no llegaron a opción y el resultado final de todo el embudo.

## Recomendador

Target: `project_id`.

Features actuales:

- estado de afiliación,
- segmento,
- categoría,
- rango salarial,
- rango de edad,
- grupo familiar,
- personas a cargo,
- pirámide empresarial,
- medio.

Exclusiones por fuga:

- código de plan,
- plan de vivienda,
- inmueble,
- valor final del proyecto elegido,
- entidad financiera final,
- fecha de desistimiento,
- nombre del proyecto como feature.

### Serving híbrido

1. Filtros del catálogo.
2. Afinidad estructurada y explicable.
3. Challenger CatBoost cuando existe información suficiente.
4. Top 3 con razones.

## IA conversacional

El orquestador tiene tres responsabilidades:

- extraer datos normalizados de respuestas libres,
- redactar la siguiente pregunta definida por el dominio,
- generar el resumen para el asesor desde un snapshot.

Toda salida se valida con Pydantic. La IA no cambia score, pesos, rutas, 90/10 o proyectos disponibles.

## EDA reproducible

```bash
cd backend
python -m app.cli ingest
python -m app.cli eda
```

Artefactos:

- `reports/eda_summary.json`
- `reports/project_distribution.csv`
- `data/processed/pipeline_summary.json`
- `notebooks/01_eda_hackathon.ipynb`

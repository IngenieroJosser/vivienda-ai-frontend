# Rendimiento — Vivienda Match AI

## Cambios estructurales

1. Layout persistente para `/asesor`, `/marketing` y `/admin`.
2. Layout persistente para todo `/vivienda`.
3. Precarga selectiva de la siguiente ruta durante tiempo ocioso, desactivada en ahorro de datos y redes lentas.
4. Loading UI por segmento del App Router.
5. Rutas dinámicas conocidas prerenderizadas en build.
6. Fondo animado sin JavaScript, con una sola capa ambiental en layouts persistentes y reducción adaptativa en móvil.
7. Logo SVG inline, iconos PNG optimizados y tipografía nativa sin descarga de fuente global.
8. Menor uso de `backdrop-filter`, desenfoques y animaciones de filtros.

## Verificación local

```bash
yarn install --frozen-lockfile
yarn lint
yarn build
yarn start
```

Ejecuta Lighthouse contra el servidor de producción local, no contra `yarn dev`.

```bash
yarn start
```

Revisa especialmente LCP, INP, CLS, tamaño del JavaScript inicial y tiempos de navegación entre rutas.

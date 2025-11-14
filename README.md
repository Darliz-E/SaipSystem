# Saiph

Aplicación Angular para gestión interna de Saiph.

## Desarrollo

- Arrancar servidor: `yarn start` (por defecto en `http://localhost:4200/`).
- Compilar producción: `yarn build`.

## Deploy a GitHub Pages (CI/CD)

Se incluye un workflow que despliega automáticamente a GitHub Pages al hacer push a `main`.

Pasos:
- Configurar la rama de publicación `gh-pages` en el repositorio (se crea automáticamente en el primer deploy).
- Asegurarse de que la página está habilitada en GitHub Pages y apunta a `gh-pages`.

Detalles:
- Archivo: `.github/workflows/deploy.yml`.
- Construye con `--base-href "/<repo>/"` para que el enrutamiento funcione bajo GitHub Pages.
- Copia `404.html` desde `index.html` para soportar SPA.

## Deploy manual con Yarn

También puedes desplegar manualmente con Yarn:

1. Establecer el nombre del repositorio en una variable de entorno (solo el nombre, sin usuario). Ejemplo:
   - macOS/Linux: `export GH_REPO=SaipSystem`
2. Ejecutar: `yarn deploy:gh`

Qué hace:
- Compila con `--base-href "/$GH_REPO/"`.
- Copia `404.html`.
- Publica `dist/saiph` en la rama `gh-pages` con `gh-pages`.

## Notas

- Si tu repositorio se llama distinto, actualiza `GH_REPO` antes de desplegar.
- Si usas una página de usuario/organización (`<usuario>.github.io`), cambia `--base-href "/"` en los pasos de build.
- El deploy por Actions usa `yarn` y Node 18.

# Grasp It — Legal Pages

Privacy Statement and Terms of Service for Grasp It.

## Editing

Edit the markdown in `docs/` — the source of truth. The title comes from the filename, so don't add an H1 inside the file.

## Build

```
npm install
npm run build
```

Generates `dist/`. Not committed; regenerated on deploy.

## Deploy

Pushing to `main` triggers `.github/workflows/deploy.yml`, which builds and publishes to GitHub Pages.
# Deploy to Cloudflare Pages

## Build settings

- Framework preset: `Astro`
- Build command: `npm run build`
- Output directory: `dist`
- Node version: `20` or newer

## First-time setup

1. Create a Cloudflare Pages project connected to the repository.
2. Configure the build settings above.
3. Enable Web Analytics in Cloudflare Pages.
4. Replace `REPLACE_WITH_TOKEN` in `/Users/pauloserodio/Documents/projects/ai_compute-feature/src/layouts/Base.astro` with the analytics token Cloudflare provides.
5. Push to `main` to trigger deployment.

## Ongoing workflow

Run these locally before shipping:

- `npm run validate`
- `npm test`
- `npm run build`
- `npm run test:e2e`

## Notes

- The site is fully static and does not require a custom runtime.
- Facility pages are generated at build time from the JSON files under `src/data/facilities/`.
- The basemap is served from `public/tiles/uk.pmtiles`, so Cloudflare Pages only needs to host the generated static files and the bundled PMTiles asset.

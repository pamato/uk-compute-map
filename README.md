# UK Public-Sector AI Compute Map

An interactive, policy-oriented map of the United Kingdom's publicly funded and publicly accessible AI compute infrastructure.

It combines flagship AIRR systems, backbone HPC services, specialist data platforms, regional compute, and mission-specific facilities into one static Astro site with shareable filters and generated facility pages.

## Stack

- Astro
- React islands
- Tailwind CSS
- TypeScript
- Zod
- Vitest
- Playwright

## Scripts

- `npm run dev` starts the local development server.
- `npm run build` creates the production-ready static output in `dist/`.
- `npm run validate` validates every facility JSON against the shared schema.
- `npm test` runs the unit test suite.
- `npm run test:e2e` runs the browser smoke tests.

## Data model

- Facility data lives in `src/data/facilities/`, one JSON file per facility.
- `src/data/schema.ts` defines the canonical Zod schema.
- `src/lib/load-facilities.ts` validates and loads the JSON corpus at build time.

## Deployment

Deployment notes live in [docs/DEPLOY.md](/Users/pauloserodio/Documents/projects/ai_compute-feature/docs/DEPLOY.md).

# UK Compute Infrastructure Map — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a static, policy-oriented webpage that maps the UK's current and planned public-sector AI compute infrastructure on an interactive UK map, with filters, a capacity-over-time chart, lightweight international benchmarking, and per-facility detail pages.

**Architecture:** Astro-based static site. Source facility data lives as one JSON per facility in `src/data/facilities/`, validated by a Zod schema at build time. The homepage composes React islands for interactivity: a MapLibre GL map (abstract UK basemap via Protomaps PMTiles), a filter bar with URL-synced state, a Recharts capacity-over-time chart, a Recharts country-comparison bar chart, and a sliding detail panel. Astro generates one static page per facility at `/facilities/[slug]` from the same JSON. An accessible list-view toggle renders the filtered facilities as a semantic card grid for keyboard/screen-reader users. Deploys to Cloudflare Pages.

**Tech Stack:** Astro 4.x (static output), React 18 (islands only), TypeScript, Tailwind CSS, MapLibre GL JS, Protomaps PMTiles (`protomaps-themes-base`, `pmtiles` protocol), Recharts, Zod (data validation), Vitest (unit tests), Playwright (e2e smoke tests), Cloudflare Pages (hosting), Cloudflare Web Analytics.

---

## Decisions Locked (from brainstorming)

- **Audience:** policy/public + investor/strategic, not researcher discovery.
- **Benchmarking v1:** single-metric country bar chart + "what 420 exaflops means" translations.
- **Time representation:** status badges on map (operational / upgrading / planned / decommissioned); planned = muted grey; dedicated capacity-over-time chart with 420 AI-exaflops target line.
- **Taxonomy (5 categories):** `flagship` · `backbone` · `specialist` · `regional` · `mission`.
- **Primary filters:** Category + Status + Region (nations default). **Advanced filters:** Funder + Hardware + Access route + ITL1 region.
- **Detail panel zones:** header · one-liner · key-facts table · access · use cases · sources + "Read more" link.
- **Standalone pages:** header · at-a-glance · prose overview · hardware table · access · use cases · sources · back-to-map.
- **Map pins:** institution-level lat/lon; cluster multiple facilities at same host (EPCC, Cambridge); HQ-pin for IRIS/GridPP; per-site pins for DiRAC's four locations.
- **Map style:** stylised abstract UK outline + nation borders, Protomaps PMTiles, light palette, 5 muted category colours.
- **Page structure:** hero → map → trajectory chart → global context → "what this materialises in" → methodology/sources → footer.
- **Scope:** v1 includes shareable filtered URLs; excludes timeline slider, multi-metric benchmark, world map, images (schema-ready), dark mode, search, i18n, accounts, CMS.
- **Hosting/ops:** Cloudflare Pages, private repo, default `*.pages.dev` subdomain, Cloudflare Web Analytics, Git-derived last-updated, WCAG AA, list-view toggle.

---

## File Structure

```
ai_compute/
├── astro.config.mjs                   # Astro config (static output, React + Tailwind integrations)
├── tailwind.config.mjs                # Tailwind with custom palette (category colours, statuses)
├── tsconfig.json                      # Strict TypeScript
├── package.json                       # Dependencies + scripts
├── vitest.config.ts                   # Unit test config
├── playwright.config.ts               # e2e test config
├── public/
│   ├── tiles/
│   │   └── uk.pmtiles                 # Protomaps UK extract (bundled static asset)
│   └── favicon.svg
├── scripts/
│   ├── build-facility-index.ts        # Reads src/data/facilities/*.json → dist/facilities.json
│   └── validate-data.ts               # CI check: Zod-validates every JSON, fails build on drift
├── src/
│   ├── data/
│   │   ├── schema.ts                  # Zod schema + inferred TS types for Facility
│   │   ├── facilities/                # One JSON per facility
│   │   │   ├── isambard-ai.json
│   │   │   ├── dawn.json
│   │   │   ├── sunrise.json
│   │   │   ├── epcc-national.json
│   │   │   ├── archer2.json
│   │   │   ├── mary-coombs.json
│   │   │   ├── met-office.json
│   │   │   ├── eidf.json
│   │   │   ├── jasmin.json
│   │   │   ├── iris.json
│   │   │   ├── kelvin-2.json
│   │   │   ├── cirrus.json
│   │   │   ├── bede.json
│   │   │   ├── young-mmm.json
│   │   │   ├── csd3.json
│   │   │   ├── gridpp-ral.json
│   │   │   ├── dirac-tursa.json
│   │   │   ├── dirac-csd3.json
│   │   │   ├── dirac-leicester.json
│   │   │   ├── dirac-durham.json
│   │   │   ├── awe.json
│   │   │   └── isambard-3.json
│   │   ├── countries.ts               # Country benchmark data (hand-curated)
│   │   └── translations.ts            # "What 420 exaflops means" cards content
│   ├── lib/
│   │   ├── load-facilities.ts         # Build-time loader: reads + validates all JSONs
│   │   ├── filters.ts                 # Pure filter functions + URL (de)serialisation
│   │   ├── trajectory.ts              # Computes cumulative AI-exaflops series from facilities
│   │   └── format.ts                  # Display formatters (exaflops, dates, status labels)
│   ├── components/
│   │   ├── Hero.astro                 # Static hero (headline, stats row)
│   │   ├── MapView.tsx                # React island: MapLibre + pins + clustering
│   │   ├── FilterBar.tsx              # React island: filter controls, URL-synced
│   │   ├── DetailPanel.tsx            # React island: slide-in panel on pin click
│   │   ├── ListView.tsx               # React island: accessible card grid fallback
│   │   ├── TrajectoryChart.tsx        # React island: Recharts cumulative + target line
│   │   ├── CountryBenchmark.tsx       # React island: Recharts horizontal bars
│   │   ├── TranslationsGrid.astro     # Static 3-4 card grid ("what this means")
│   │   ├── Methodology.astro          # Static collapsed sources/methodology
│   │   ├── Footer.astro               # Static footer
│   │   ├── CategoryPill.tsx           # Small shared UI
│   │   ├── StatusBadge.tsx            # Small shared UI
│   │   └── Sources.tsx                # Shared sources list (panel + facility page)
│   ├── pages/
│   │   ├── index.astro                # Main page composing everything above
│   │   └── facilities/
│   │       └── [slug].astro           # One static page per facility
│   ├── layouts/
│   │   └── Base.astro                 # HTML shell, meta tags, CF analytics, global CSS
│   └── styles/
│       └── global.css                 # Tailwind entry + custom properties
└── tests/
    ├── unit/
    │   ├── schema.test.ts
    │   ├── filters.test.ts
    │   ├── trajectory.test.ts
    │   └── format.test.ts
    └── e2e/
        ├── homepage.spec.ts
        └── facility-page.spec.ts
```

**Responsibility boundaries:**

- **`src/data/schema.ts`** owns the Facility type. Every other module depends on it; it depends on nothing. All validation happens here.
- **`src/data/facilities/*.json`** are the sole source of truth for facility data. Editing the site = editing these files.
- **`src/lib/*`** are pure functions, framework-independent, unit-tested.
- **`src/components/*`** are UI-only. They receive data via props; none read files or fetch.
- **`src/pages/*`** do the Astro-specific composition, SSG routing, and frontmatter data loading.
- **`scripts/*`** run at build/CI time only.

---

## Task 1: Project Scaffold

**Files:**
- Create: `package.json`
- Create: `astro.config.mjs`
- Create: `tsconfig.json`
- Create: `tailwind.config.mjs`
- Create: `src/styles/global.css`
- Create: `src/layouts/Base.astro`
- Create: `src/pages/index.astro`
- Create: `.gitignore`
- Create: `README.md`

- [x] **Step 1: Initialise git and npm**

Run:
```bash
cd /Users/pauloserodio/Documents/projects/ai_compute
git init
npm init -y
```

Expected: creates `.git/` and `package.json`.

- [x] **Step 2: Install core dependencies**

Run:
```bash
npm install astro@^4 react@^18 react-dom@^18 @astrojs/react @astrojs/tailwind tailwindcss typescript zod
npm install -D @types/react @types/react-dom vitest @vitest/ui playwright @playwright/test
```

Expected: installs packages, populates `package-lock.json`.

- [x] **Step 3: Write `astro.config.mjs`**

```js
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  output: 'static',
  integrations: [react(), tailwind()],
  site: 'https://uk-compute-map.pages.dev',
});
```

- [x] **Step 4: Write `tsconfig.json`**

```json
{
  "extends": "astro/tsconfigs/strict",
  "compilerOptions": {
    "jsx": "react-jsx",
    "jsxImportSource": "react",
    "baseUrl": ".",
    "paths": { "@/*": ["src/*"] }
  },
  "include": ["src", "scripts", "tests"]
}
```

- [x] **Step 5: Write `tailwind.config.mjs` with category palette**

```js
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,ts,tsx,md,mdx}'],
  theme: {
    extend: {
      colors: {
        category: {
          flagship: '#1f4e79',
          backbone: '#2e7d5b',
          specialist: '#8b5e3c',
          regional:  '#6a4c93',
          mission:   '#8c3a3a',
        },
        status: {
          operational:    '#2f6f3f',
          upgrading:      '#b78a1f',
          planned:        '#9aa0a6',
          decommissioned: '#c4c4c4',
        },
        surface: '#fbfaf7',
        ink:     '#1a1a1a',
      },
      fontFamily: {
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
        serif: ['"Source Serif 4"', 'Georgia', 'serif'],
      },
    },
  },
  plugins: [],
};
```

- [x] **Step 6: Write `src/styles/global.css`**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  color-scheme: light;
}

body {
  @apply bg-surface text-ink font-sans antialiased;
}

h1, h2, h3, h4 {
  @apply font-serif;
}
```

- [x] **Step 7: Write `src/layouts/Base.astro`**

```astro
---
import '../styles/global.css';

interface Props { title: string; description?: string; }
const { title, description = "UK public-sector AI compute infrastructure map." } = Astro.props;
---
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>{title}</title>
    <meta name="description" content={description} />
    <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
  </head>
  <body>
    <slot />
  </body>
</html>
```

- [x] **Step 8: Write minimal `src/pages/index.astro`**

```astro
---
import Base from '../layouts/Base.astro';
---
<Base title="UK Public-Sector AI Compute">
  <main class="mx-auto max-w-6xl p-8">
    <h1 class="text-4xl">UK Public-Sector AI Compute</h1>
    <p class="mt-4">Scaffold online.</p>
  </main>
</Base>
```

- [x] **Step 9: Write `.gitignore`**

```
node_modules
dist
.astro
.DS_Store
*.log
.env
.env.local
playwright-report
test-results
```

- [x] **Step 10: Add npm scripts to `package.json`**

Edit `package.json` `"scripts"` to:
```json
{
  "dev": "astro dev",
  "build": "astro build",
  "preview": "astro preview",
  "test": "vitest run",
  "test:watch": "vitest",
  "test:e2e": "playwright test"
}
```

- [x] **Step 11: Verify the scaffold builds**

Run:
```bash
npm run build
```

Expected: build succeeds; `dist/index.html` exists.

- [x] **Step 12: Commit**

```bash
git add -A
git commit -m "chore: scaffold Astro + React + Tailwind project"
```

---

## Task 2: Facility Data Schema (Zod)

**Files:**
- Create: `src/data/schema.ts`
- Test:   `tests/unit/schema.test.ts`
- Create: `vitest.config.ts`

- [x] **Step 1: Write `vitest.config.ts`**

```ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/unit/**/*.test.ts'],
  },
  resolve: {
    alias: { '@': '/src' },
  },
});
```

- [x] **Step 2: Write the failing test `tests/unit/schema.test.ts`**

```ts
import { describe, it, expect } from 'vitest';
import { FacilitySchema } from '../../src/data/schema';

const valid = {
  slug: 'isambard-ai',
  name: 'Isambard-AI',
  category: 'flagship',
  status: 'operational',
  location: {
    institution: 'National Composites Centre',
    city: 'Bristol',
    nation: 'England',
    itl1: 'South West',
    lat: 51.5227,
    lon: -2.5878,
  },
  operator: 'University of Bristol & HPE',
  funder: 'UKRI / DSIT',
  opened: '2025-07',
  decommissioned: null,
  oneLiner: 'Flagship UK AI supercomputer, half of the AIRR.',
  summary: 'Isambard-AI is the UK flagship AI supercomputer...',
  keyFacts: {
    hardware: '5,448 NVIDIA GH200 Grace-Hopper',
    performance: '≈21 AI-exaflops',
    funding: '£225m',
    energy: 'Renewable; fan-less liquid cooling',
  },
  access: { route: 'Free to UK researchers via UKRI', accessType: 'public-application' },
  useCases: ['LLM inference', 'Generative AI for public-sector'],
  hardwareTags: ['nvidia-gpu', 'grace-hopper'],
  aiExaflops: 21,
  federationMembers: null,
  image: null,
  sources: [{ label: 'UKRI', url: 'https://www.ukri.org/' }],
};

describe('FacilitySchema', () => {
  it('accepts a fully valid facility', () => {
    expect(() => FacilitySchema.parse(valid)).not.toThrow();
  });

  it('rejects an unknown category', () => {
    expect(() => FacilitySchema.parse({ ...valid, category: 'other' })).toThrow();
  });

  it('rejects an unknown status', () => {
    expect(() => FacilitySchema.parse({ ...valid, status: 'future' })).toThrow();
  });

  it('rejects lat outside [-90, 90]', () => {
    expect(() =>
      FacilitySchema.parse({ ...valid, location: { ...valid.location, lat: 99 } }),
    ).toThrow();
  });

  it('rejects invalid URL in sources', () => {
    expect(() =>
      FacilitySchema.parse({ ...valid, sources: [{ label: 'x', url: 'not-a-url' }] }),
    ).toThrow();
  });

  it('rejects invalid opened date format', () => {
    expect(() => FacilitySchema.parse({ ...valid, opened: '2025/07' })).toThrow();
  });

  it('requires image credit when image present', () => {
    expect(() =>
      FacilitySchema.parse({
        ...valid,
        image: { url: 'https://x/y.jpg', credit: '', licence: 'CC-BY', source: 'Wikimedia' },
      }),
    ).toThrow();
  });
});
```

- [x] **Step 3: Run test to verify it fails**

Run: `npx vitest run tests/unit/schema.test.ts`
Expected: FAIL — "Cannot find module '../../src/data/schema'".

- [x] **Step 4: Implement `src/data/schema.ts`**

```ts
import { z } from 'zod';

export const CategorySchema = z.enum(['flagship', 'backbone', 'specialist', 'regional', 'mission']);
export const StatusSchema = z.enum(['operational', 'upgrading', 'planned', 'decommissioned']);
export const NationSchema = z.enum(['England', 'Scotland', 'Wales', 'Northern Ireland']);
export const ITL1Schema = z.enum([
  'North East', 'North West', 'Yorkshire and The Humber',
  'East Midlands', 'West Midlands', 'East of England',
  'London', 'South East', 'South West',
  'Scotland', 'Wales', 'Northern Ireland',
]);
export const AccessTypeSchema = z.enum(['public-application', 'federated', 'restricted', 'commercial']);
export const HardwareTagSchema = z.enum([
  'nvidia-gpu', 'amd-gpu', 'intel-gpu', 'grace-hopper',
  'cerebras', 'cpu-only', 'cloud',
]);

const YearMonth = z.string().regex(/^\d{4}-\d{2}$/, 'Expected YYYY-MM');

export const SourceSchema = z.object({
  label: z.string().min(1),
  url: z.string().url(),
});

export const ImageSchema = z.object({
  url: z.string().url(),
  credit: z.string().min(1),
  licence: z.string().min(1),
  source: z.string().min(1),
});

export const LocationSchema = z.object({
  institution: z.string().min(1),
  city: z.string().min(1),
  nation: NationSchema,
  itl1: ITL1Schema,
  lat: z.number().min(-90).max(90),
  lon: z.number().min(-180).max(180),
});

export const KeyFactsSchema = z.object({
  hardware: z.string().min(1),
  performance: z.string().min(1),
  funding: z.string().min(1),
  energy: z.string().min(1),
});

export const AccessSchema = z.object({
  route: z.string().min(1),
  accessType: AccessTypeSchema,
});

export const FacilitySchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/),
  name: z.string().min(1),
  category: CategorySchema,
  status: StatusSchema,
  location: LocationSchema,
  operator: z.string().min(1),
  funder: z.string().min(1),
  opened: YearMonth.nullable(),
  decommissioned: YearMonth.nullable(),
  oneLiner: z.string().min(1).max(200),
  summary: z.string().min(1),
  keyFacts: KeyFactsSchema,
  access: AccessSchema,
  useCases: z.array(z.string().min(1)),
  hardwareTags: z.array(HardwareTagSchema),
  aiExaflops: z.number().nonnegative().nullable(),
  federationMembers: z.array(z.string()).nullable(),
  image: ImageSchema.nullable(),
  sources: z.array(SourceSchema).min(1),
});

export type Facility = z.infer<typeof FacilitySchema>;
export type Category = z.infer<typeof CategorySchema>;
export type Status = z.infer<typeof StatusSchema>;
export type Nation = z.infer<typeof NationSchema>;
export type ITL1 = z.infer<typeof ITL1Schema>;
export type AccessType = z.infer<typeof AccessTypeSchema>;
export type HardwareTag = z.infer<typeof HardwareTagSchema>;
```

- [x] **Step 5: Run test to verify it passes**

Run: `npx vitest run tests/unit/schema.test.ts`
Expected: all 7 tests PASS.

- [x] **Step 6: Commit**

```bash
git add src/data/schema.ts tests/unit/schema.test.ts vitest.config.ts
git commit -m "feat(data): add Facility Zod schema with full validation"
```

---

## Task 3: Build-Time Facility Loader

**Files:**
- Create: `src/lib/load-facilities.ts`
- Create: `scripts/validate-data.ts`
- Create: `src/data/facilities/isambard-ai.json` (seed: one facility so the loader has something to read)
- Test:   `tests/unit/load-facilities.test.ts` (indirect coverage via schema tests; here we test the loader directly using a tmp dir)

- [x] **Step 1: Create the seed facility JSON `src/data/facilities/isambard-ai.json`**

```json
{
  "slug": "isambard-ai",
  "name": "Isambard-AI",
  "category": "flagship",
  "status": "operational",
  "location": {
    "institution": "National Composites Centre",
    "city": "Bristol",
    "nation": "England",
    "itl1": "South West",
    "lat": 51.5227,
    "lon": -2.5878
  },
  "operator": "University of Bristol & Hewlett Packard Enterprise",
  "funder": "UKRI / DSIT",
  "opened": "2025-07",
  "decommissioned": null,
  "oneLiner": "UK flagship AI supercomputer — half of the AI Research Resource (AIRR).",
  "summary": "Isambard-AI opened in July 2025 at the National Composites Centre, Bristol. Built by the University of Bristol and HPE at a cost of £225m, it uses 5,448 NVIDIA GH200 Grace-Hopper superchips in an HPE Cray EX architecture, delivering approximately 21 AI-exaflops. Its modular design uses zero-carbon electricity and fan-less liquid cooling that cuts cooling power by up to 90% and emissions by 72%.",
  "keyFacts": {
    "hardware": "5,448 NVIDIA GH200 Grace-Hopper superchips; HPE Cray EX",
    "performance": "≈21 AI-exaflops",
    "funding": "£225 million",
    "energy": "Zero-carbon electricity; fan-less liquid cooling (-90% cooling power, -72% emissions)"
  },
  "access": {
    "route": "Free to UK researchers and start-ups via UKRI (DSIT/UKRI allocation)",
    "accessType": "public-application"
  },
  "useCases": [
    "Large language model inference",
    "Generative AI for public-sector workloads",
    "Mixed-precision matrix operations"
  ],
  "hardwareTags": ["nvidia-gpu", "grace-hopper"],
  "aiExaflops": 21,
  "federationMembers": null,
  "image": null,
  "sources": [
    { "label": "UKRI — Isambard-AI & Dawn Innovator route", "url": "https://www.ukri.org/opportunity/isambard-ai-and-dawn-airr-supercomputers-innovator-route/" },
    { "label": "University of Bristol launch", "url": "https://www.bristol.ac.uk/research/centres/bristol-supercomputing/articles/2025/isambard-ai-launches-july-2025.html" },
    { "label": "UK Compute Roadmap — GOV.UK", "url": "https://www.gov.uk/government/publications/uk-compute-roadmap/uk-compute-roadmap" }
  ]
}
```

- [x] **Step 2: Write the failing test `tests/unit/load-facilities.test.ts`**

```ts
import { describe, it, expect } from 'vitest';
import { loadFacilities } from '../../src/lib/load-facilities';

describe('loadFacilities', () => {
  it('loads and validates the real facility JSONs', async () => {
    const facilities = await loadFacilities();
    expect(facilities.length).toBeGreaterThan(0);
    const slugs = facilities.map(f => f.slug);
    expect(new Set(slugs).size).toBe(slugs.length); // unique
    expect(slugs).toContain('isambard-ai');
  });

  it('sorts facilities by name', async () => {
    const facilities = await loadFacilities();
    const names = facilities.map(f => f.name);
    expect(names).toEqual([...names].sort((a, b) => a.localeCompare(b)));
  });
});
```

- [x] **Step 3: Run test to verify it fails**

Run: `npx vitest run tests/unit/load-facilities.test.ts`
Expected: FAIL — "Cannot find module '../../src/lib/load-facilities'".

- [x] **Step 4: Implement `src/lib/load-facilities.ts`**

```ts
import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { FacilitySchema, type Facility } from '../data/schema';

const DATA_DIR = fileURLToPath(new URL('../data/facilities/', import.meta.url));

export async function loadFacilities(): Promise<Facility[]> {
  const files = (await readdir(DATA_DIR)).filter(f => f.endsWith('.json'));
  const facilities: Facility[] = [];

  for (const file of files) {
    const raw = await readFile(join(DATA_DIR, file), 'utf8');
    const parsed = JSON.parse(raw);
    const result = FacilitySchema.safeParse(parsed);
    if (!result.success) {
      throw new Error(`Invalid facility data in ${file}:\n${result.error.toString()}`);
    }
    if (result.data.slug !== file.replace(/\.json$/, '')) {
      throw new Error(`Slug "${result.data.slug}" does not match filename "${file}"`);
    }
    facilities.push(result.data);
  }

  const slugs = new Set<string>();
  for (const f of facilities) {
    if (slugs.has(f.slug)) throw new Error(`Duplicate facility slug: ${f.slug}`);
    slugs.add(f.slug);
  }

  return facilities.sort((a, b) => a.name.localeCompare(b.name));
}
```

- [x] **Step 5: Run test to verify it passes**

Run: `npx vitest run tests/unit/load-facilities.test.ts`
Expected: 2 tests PASS.

- [x] **Step 6: Write `scripts/validate-data.ts`**

```ts
import { loadFacilities } from '../src/lib/load-facilities.ts';

async function main() {
  const facilities = await loadFacilities();
  console.log(`Validated ${facilities.length} facilities.`);
}

main().catch(err => {
  console.error('Data validation failed.\n', err);
  process.exit(1);
});
```

- [x] **Step 7: Add `validate` script to `package.json`**

```json
"scripts": {
  "validate": "node --experimental-strip-types scripts/validate-data.ts"
}
```

- [x] **Step 8: Run validator**

Run: `npm run validate`
Expected: `Validated 1 facilities.`

- [x] **Step 9: Commit**

```bash
git add -A
git commit -m "feat(data): add facility loader, validator, seed Isambard-AI"
```

---

## Task 4: Populate Remaining Facility JSONs

The PDF covers ~22 facilities. Create one JSON per facility. Each must conform to `FacilitySchema` — the build will fail otherwise.

**Files:**
- Create: `src/data/facilities/dawn.json`
- Create: `src/data/facilities/sunrise.json`
- Create: `src/data/facilities/epcc-national.json`
- Create: `src/data/facilities/archer2.json`
- Create: `src/data/facilities/mary-coombs.json`
- Create: `src/data/facilities/met-office.json`
- Create: `src/data/facilities/eidf.json`
- Create: `src/data/facilities/jasmin.json`
- Create: `src/data/facilities/iris.json`
- Create: `src/data/facilities/kelvin-2.json`
- Create: `src/data/facilities/cirrus.json`
- Create: `src/data/facilities/bede.json`
- Create: `src/data/facilities/young-mmm.json`
- Create: `src/data/facilities/csd3.json`
- Create: `src/data/facilities/gridpp-ral.json`
- Create: `src/data/facilities/dirac-tursa.json`
- Create: `src/data/facilities/dirac-csd3.json`
- Create: `src/data/facilities/dirac-leicester.json`
- Create: `src/data/facilities/dirac-durham.json`
- Create: `src/data/facilities/awe.json`
- Create: `src/data/facilities/isambard-3.json`

**Reference data for each facility** (pull prose, hardware, funding, opened dates, sources from the PDF sections indicated):

| slug | name | category | status | location (institution, city, nation, itl1, lat, lon) | opened | aiExaflops | PDF section |
|---|---|---|---|---|---|---|---|
| dawn | Cambridge Dawn | flagship | upgrading | University of Cambridge, Cambridge, England, East of England, 52.2053, 0.1218 | 2024-11 | 1 | 1.2 |
| sunrise | Sunrise | flagship | planned | University of Cambridge / UKAEA, Cambridge, England, East of England, 52.2053, 0.1218 | null | null | 1.3 |
| epcc-national | Planned National Supercomputer | flagship | planned | EPCC, Edinburgh, Scotland, Scotland, 55.9222, -3.1722 | 2027-01 | null | 1.5 |
| archer2 | ARCHER2 | backbone | operational | EPCC, Edinburgh, Scotland, Scotland, 55.9222, -3.1722 | 2021-11 | null | 2.1 |
| mary-coombs | Mary Coombs | backbone | operational | Hartree Centre, Daresbury, England, North West, 53.3439, -2.6396 | 2025-10 | null | 2.2 |
| met-office | Met Office cloud supercomputer | backbone | operational | Microsoft Azure (UK South) / Met Office, Exeter, England, South West, 50.7260, -3.4760 | 2025-01 | null | 2.7 |
| eidf | Edinburgh International Data Facility | specialist | operational | EPCC, Edinburgh, Scotland, Scotland, 55.9222, -3.1722 | 2022-01 | null | 1.4 |
| jasmin | JASMIN | specialist | upgrading | NERC / CEDA, RAL Harwell, England, South East, 51.5719, -1.3133 | 2012-01 | null | 2.6 |
| iris | IRIS federated infrastructure | specialist | operational | STFC (coordinating), Rutherford Appleton Lab, England, South East, 51.5719, -1.3133 | 2018-01 | null | 2.5 |
| kelvin-2 | NI-HPC / Kelvin-2 | regional | operational | Queen's University Belfast, Belfast, Northern Ireland, Northern Ireland, 54.5833, -5.9336 | 2022-01 | null | 2.3 |
| cirrus | Cirrus | regional | upgrading | EPCC, Edinburgh, Scotland, Scotland, 55.9222, -3.1722 | 2016-09 | null | 4.1 |
| bede | Bede | regional | operational | Durham University (N8), Durham, England, North East, 54.7677, -1.5717 | 2020-05 | null | 4.2 |
| young-mmm | Young / MMM Hub | regional | operational | Young facility, London, England, London, 51.5246, -0.1340 | 2020-01 | null | 4.3 |
| csd3 | Cambridge CSD3 | regional | operational | University of Cambridge, Cambridge, England, East of England, 52.2053, 0.1218 | 2018-01 | null | 4.4 |
| gridpp-ral | GridPP Tier-1 (RAL) | mission | operational | STFC Rutherford Appleton Lab, Harwell, England, South East, 51.5719, -1.3133 | 2001-01 | null | 2.4 |
| dirac-tursa | DiRAC — Extreme Scaling (Tursa) | mission | operational | EPCC, Edinburgh, Scotland, Scotland, 55.9222, -3.1722 | 2022-01 | null | 3 table |
| dirac-csd3 | DiRAC — Data-Intensive (CSD3) | mission | operational | University of Cambridge, Cambridge, England, East of England, 52.2053, 0.1218 | 2018-01 | null | 3 table |
| dirac-leicester | DiRAC — Data-Intensive (Leicester) | mission | operational | University of Leicester, Leicester, England, East Midlands, 52.6215, -1.1248 | 2018-01 | null | 3 table |
| dirac-durham | DiRAC — Memory-Intensive | mission | operational | Durham University, Durham, England, North East, 54.7677, -1.5717 | 2018-01 | null | 3 table |
| awe | AWE HPC | mission | operational | Atomic Weapons Establishment, Aldermaston, England, South East, 51.3728, -1.1320 | null | null | 2.8 |
| isambard-3 | Bristol Isambard 3 | backbone | operational | University of Bristol, Bristol, England, South West, 51.4545, -2.6017 | 2024-01 | null | 5 table |

- [ ] **Step 1: Draft each JSON using the PDF's prose**

For each facility above, create `src/data/facilities/<slug>.json` populating every required schema field. Use the corresponding PDF section for `summary`, `keyFacts.*`, `access.route`, `useCases`, and `sources`. Keep `oneLiner` ≤200 chars and punchy. Include 2–4 sources per facility drawn from the PDF's reference list at the end.

Example template (Dawn):

```json
{
  "slug": "dawn",
  "name": "Cambridge Dawn",
  "category": "flagship",
  "status": "upgrading",
  "location": {
    "institution": "Cambridge Open Zettascale Lab",
    "city": "Cambridge",
    "nation": "England",
    "itl1": "East of England",
    "lat": 52.2053,
    "lon": 0.1218
  },
  "operator": "University of Cambridge / Dell / Intel",
  "funder": "UKRI / DSIT (£36m expansion)",
  "opened": "2024-11",
  "decommissioned": null,
  "oneLiner": "UK's fastest AI supercomputer and the other half of the AIRR; £36m expansion delivering a 6× capacity boost by spring 2026.",
  "summary": "Dawn is the UK's fastest AI supercomputer and, with Isambard-AI, forms the AI Research Resource (AIRR). The Government invested £36m to increase capacity six-fold by spring 2026. It comprises 256 Dell PowerEdge XE9640 servers, each with two Intel Xeon Platinum 8468 processors (96 cores) and four Intel Data Center GPU Max 1550 (Ponte Vecchio) GPUs, connected via Xe-Link and HDR200 InfiniBand. A near-term upgrade adds AMD MI355X GPUs with StackHPC software, diversifying the UK's AI compute supply chain.",
  "keyFacts": {
    "hardware": "256 Dell PowerEdge XE9640; 2× Intel Xeon Platinum 8468 + 4× Intel Max 1550 (Ponte Vecchio) per node; AMD MI355X upgrade planned",
    "performance": "≈1 AI-exaflop",
    "funding": "£36m expansion announced 2024",
    "energy": "Integrated with Cambridge Research Computing's federated operations"
  },
  "access": {
    "route": "Free access via the AIRR allocation route; project management through the Cambridge Research Computing Portal.",
    "accessType": "public-application"
  },
  "useCases": [
    "Seasonal sea-ice forecasting (IceNet)",
    "Kidney-cancer screening model training",
    "LLM inference with large per-GPU memory"
  ],
  "hardwareTags": ["intel-gpu", "amd-gpu"],
  "aiExaflops": 1,
  "federationMembers": null,
  "image": null,
  "sources": [
    { "label": "GOV.UK — Cambridge supercomputer 6× expansion", "url": "https://www.gov.uk/government/news/cambridge-supercomputer-set-to-get-6-times-more-powerful-as-government-backs-british-ai-innovation" },
    { "label": "CSD3 — Dawn PVC nodes", "url": "https://docs.hpc.cam.ac.uk/user-guide/pvc.html" },
    { "label": "Dawn system page", "url": "https://www.hpc.cam.ac.uk/d-w-n" }
  ]
}
```

Repeat for all 20 remaining facilities. For DiRAC entries and GridPP, use the programme-level summary in the PDF plus the per-site table rows. For federation entries (IRIS), populate `federationMembers: ["STFC Cloud", "Arcus (Cambridge)", "Imperial College Cloud", "Somerville Cloud (Edinburgh)"]`.

For `aiExaflops`: only set a number where the PDF publishes an AI-exaflops figure (Isambard-AI: 21, Dawn: 1). For ARCHER2, Mary Coombs, Kelvin-2, Cirrus, Bede, CSD3, DiRAC nodes, JASMIN, Met Office, AWE, Isambard-3, EIDF, IRIS, Sunrise, EPCC-National — set `aiExaflops: null`. The chart methodology note will explain this.

- [ ] **Step 2: Run the data validator**

Run: `npm run validate`
Expected: `✔ Validated 22 facilities.`

- [ ] **Step 3: Add a per-slug consistency test to `tests/unit/load-facilities.test.ts`**

Append:
```ts
  it('every facility has at least one source', async () => {
    const facilities = await loadFacilities();
    for (const f of facilities) {
      expect(f.sources.length, `${f.slug} has no sources`).toBeGreaterThan(0);
    }
  });

  it('every facility with aiExaflops > 0 is operational or upgrading', async () => {
    const facilities = await loadFacilities();
    for (const f of facilities) {
      if (f.aiExaflops && f.aiExaflops > 0) {
        expect(['operational', 'upgrading']).toContain(f.status);
      }
    }
  });
```

- [ ] **Step 4: Run all unit tests**

Run: `npm test`
Expected: all tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/data/facilities tests/unit/load-facilities.test.ts
git commit -m "feat(data): populate all 22 facility JSONs from research PDF"
```

---

## Task 5: Pure Filter Logic + URL Sync

**Files:**
- Create: `src/lib/filters.ts`
- Test:   `tests/unit/filters.test.ts`

- [ ] **Step 1: Write the failing test `tests/unit/filters.test.ts`**

```ts
import { describe, it, expect } from 'vitest';
import {
  applyFilters,
  filtersFromSearchParams,
  filtersToSearchParams,
  type FilterState,
} from '../../src/lib/filters';
import type { Facility } from '../../src/data/schema';

const f = (overrides: Partial<Facility>): Facility =>
  ({
    slug: 's', name: 'n', category: 'flagship', status: 'operational',
    location: { institution: 'i', city: 'c', nation: 'England', itl1: 'London', lat: 51, lon: -0.1 },
    operator: 'o', funder: 'UKRI', opened: '2025-01', decommissioned: null,
    oneLiner: 'x', summary: 'x',
    keyFacts: { hardware: 'x', performance: 'x', funding: 'x', energy: 'x' },
    access: { route: 'x', accessType: 'public-application' },
    useCases: [], hardwareTags: ['nvidia-gpu'],
    aiExaflops: null, federationMembers: null, image: null,
    sources: [{ label: 'x', url: 'https://x.example' }],
    ...overrides,
  } as Facility);

describe('applyFilters', () => {
  const data = [
    f({ slug: 'a', category: 'flagship',   status: 'operational',   location: { institution:'i',city:'c',nation:'England', itl1:'London',         lat:51,lon:0 }, hardwareTags:['nvidia-gpu'] }),
    f({ slug: 'b', category: 'backbone',   status: 'planned',       location: { institution:'i',city:'c',nation:'Scotland',itl1:'Scotland',       lat:55,lon:-3 }, hardwareTags:['amd-gpu'] }),
    f({ slug: 'c', category: 'specialist', status: 'upgrading',     location: { institution:'i',city:'c',nation:'Wales',   itl1:'Wales',          lat:51,lon:-3 }, hardwareTags:['cerebras','nvidia-gpu'] }),
  ];

  it('returns all when no filters active', () => {
    expect(applyFilters(data, {} as FilterState).map(x => x.slug)).toEqual(['a', 'b', 'c']);
  });

  it('filters by category', () => {
    expect(applyFilters(data, { categories: ['flagship'] }).map(x => x.slug)).toEqual(['a']);
  });

  it('filters by multiple categories (OR within dimension)', () => {
    expect(applyFilters(data, { categories: ['flagship', 'backbone'] }).map(x => x.slug))
      .toEqual(['a', 'b']);
  });

  it('filters by status and nation (AND across dimensions)', () => {
    expect(applyFilters(data, { statuses: ['planned'], nations: ['Scotland'] })
      .map(x => x.slug)).toEqual(['b']);
  });

  it('filters by hardware tag (OR within, any-of match)', () => {
    expect(applyFilters(data, { hardwareTags: ['cerebras'] }).map(x => x.slug)).toEqual(['c']);
  });
});

describe('filter URL serialisation', () => {
  it('round-trips a complex filter state', () => {
    const s: FilterState = {
      categories: ['flagship', 'backbone'],
      statuses: ['operational'],
      nations: ['Scotland'],
      hardwareTags: ['nvidia-gpu'],
    };
    const params = filtersToSearchParams(s);
    const decoded = filtersFromSearchParams(params);
    expect(decoded).toEqual(s);
  });

  it('omits empty arrays from search params', () => {
    const s: FilterState = { categories: ['flagship'] };
    expect(filtersToSearchParams(s).toString()).toBe('category=flagship');
  });

  it('ignores unknown values gracefully', () => {
    const params = new URLSearchParams('category=flagship,bogus&status=operational');
    expect(filtersFromSearchParams(params)).toEqual({
      categories: ['flagship'],
      statuses: ['operational'],
    });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/unit/filters.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement `src/lib/filters.ts`**

```ts
import {
  CategorySchema, StatusSchema, NationSchema, ITL1Schema,
  AccessTypeSchema, HardwareTagSchema,
  type Category, type Status, type Nation, type ITL1,
  type AccessType, type HardwareTag, type Facility,
} from '../data/schema';

export interface FilterState {
  categories?: Category[];
  statuses?: Status[];
  nations?: Nation[];
  itl1?: ITL1[];
  accessTypes?: AccessType[];
  hardwareTags?: HardwareTag[];
  funders?: string[];
}

const PARAM_KEY_TO_FIELD: Record<string, keyof FilterState> = {
  category: 'categories',
  status:   'statuses',
  nation:   'nations',
  itl1:     'itl1',
  access:   'accessTypes',
  hardware: 'hardwareTags',
  funder:   'funders',
};

const FIELD_TO_PARAM_KEY: Record<keyof FilterState, string> = {
  categories:   'category',
  statuses:     'status',
  nations:      'nation',
  itl1:         'itl1',
  accessTypes:  'access',
  hardwareTags: 'hardware',
  funders:      'funder',
};

export function applyFilters(facilities: Facility[], s: FilterState): Facility[] {
  return facilities.filter(f => {
    if (s.categories?.length   && !s.categories.includes(f.category))      return false;
    if (s.statuses?.length     && !s.statuses.includes(f.status))          return false;
    if (s.nations?.length      && !s.nations.includes(f.location.nation))  return false;
    if (s.itl1?.length         && !s.itl1.includes(f.location.itl1))       return false;
    if (s.accessTypes?.length  && !s.accessTypes.includes(f.access.accessType)) return false;
    if (s.funders?.length      && !s.funders.includes(f.funder))           return false;
    if (s.hardwareTags?.length &&
        !f.hardwareTags.some(t => s.hardwareTags!.includes(t)))           return false;
    return true;
  });
}

function parseEnum<T>(schema: { safeParse: (v: unknown) => { success: boolean; data?: T } }, value: string): T | null {
  const r = schema.safeParse(value);
  return r.success ? (r.data as T) : null;
}

export function filtersFromSearchParams(params: URLSearchParams): FilterState {
  const state: FilterState = {};
  for (const [key, raw] of params.entries()) {
    const field = PARAM_KEY_TO_FIELD[key];
    if (!field) continue;
    const parts = raw.split(',').map(s => s.trim()).filter(Boolean);
    const parsed = parts
      .map(v => {
        switch (field) {
          case 'categories':   return parseEnum<Category>(CategorySchema, v);
          case 'statuses':     return parseEnum<Status>(StatusSchema, v);
          case 'nations':      return parseEnum<Nation>(NationSchema, v);
          case 'itl1':         return parseEnum<ITL1>(ITL1Schema, v);
          case 'accessTypes':  return parseEnum<AccessType>(AccessTypeSchema, v);
          case 'hardwareTags': return parseEnum<HardwareTag>(HardwareTagSchema, v);
          case 'funders':      return v;
          default: return null;
        }
      })
      .filter((v): v is NonNullable<typeof v> => v !== null);
    if (parsed.length) {
      (state as Record<string, unknown>)[field] = parsed;
    }
  }
  return state;
}

export function filtersToSearchParams(s: FilterState): URLSearchParams {
  const params = new URLSearchParams();
  (Object.keys(FIELD_TO_PARAM_KEY) as (keyof FilterState)[]).forEach(field => {
    const values = s[field];
    if (Array.isArray(values) && values.length > 0) {
      params.set(FIELD_TO_PARAM_KEY[field], values.join(','));
    }
  });
  return params;
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run tests/unit/filters.test.ts`
Expected: all 8 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/filters.ts tests/unit/filters.test.ts
git commit -m "feat(filters): pure filter + URL (de)serialisation"
```

---

## Task 6: Trajectory Series + Format Helpers

**Files:**
- Create: `src/lib/trajectory.ts`
- Create: `src/lib/format.ts`
- Test:   `tests/unit/trajectory.test.ts`
- Test:   `tests/unit/format.test.ts`

- [ ] **Step 1: Write failing test `tests/unit/trajectory.test.ts`**

```ts
import { describe, it, expect } from 'vitest';
import { buildTrajectorySeries, TARGET_2030_EXAFLOPS } from '../../src/lib/trajectory';
import type { Facility } from '../../src/data/schema';

const mk = (slug: string, opened: string | null, ai: number | null, status: Facility['status'] = 'operational'): Facility => ({
  slug, name: slug, category: 'flagship', status,
  location: { institution: 'i', city: 'c', nation: 'England', itl1: 'London', lat: 51, lon: 0 },
  operator: 'o', funder: 'f', opened, decommissioned: null,
  oneLiner: 'x', summary: 'x',
  keyFacts: { hardware:'x', performance:'x', funding:'x', energy:'x' },
  access: { route:'x', accessType:'public-application' },
  useCases: [], hardwareTags: [], aiExaflops: ai,
  federationMembers: null, image: null,
  sources: [{ label:'x', url:'https://x.example' }],
});

describe('buildTrajectorySeries', () => {
  it('accumulates AI-exaflops by year for quantified facilities', () => {
    const facilities = [
      mk('a', '2024-06', 5),
      mk('b', '2025-07', 21),
      mk('c', '2026-03', 6),
    ];
    const series = buildTrajectorySeries(facilities, { startYear: 2023, endYear: 2027 });
    expect(series).toEqual([
      { year: 2023, cumulative: 0, target: null },
      { year: 2024, cumulative: 5, target: null },
      { year: 2025, cumulative: 26, target: null },
      { year: 2026, cumulative: 32, target: null },
      { year: 2027, cumulative: 32, target: null },
    ]);
  });

  it('ignores facilities without aiExaflops', () => {
    const facilities = [mk('a', '2024-06', null), mk('b', '2025-07', 21)];
    const series = buildTrajectorySeries(facilities, { startYear: 2024, endYear: 2025 });
    expect(series).toEqual([
      { year: 2024, cumulative: 0, target: null },
      { year: 2025, cumulative: 21, target: null },
    ]);
  });

  it('marks the 2030 target point', () => {
    const series = buildTrajectorySeries([], { startYear: 2028, endYear: 2030 });
    expect(series.at(-1)).toEqual({ year: 2030, cumulative: 0, target: TARGET_2030_EXAFLOPS });
    expect(TARGET_2030_EXAFLOPS).toBe(420);
  });
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `npx vitest run tests/unit/trajectory.test.ts`
Expected: module not found.

- [ ] **Step 3: Implement `src/lib/trajectory.ts`**

```ts
import type { Facility } from '../data/schema';

export const TARGET_2030_EXAFLOPS = 420;

export interface TrajectoryPoint {
  year: number;
  cumulative: number;
  target: number | null;
}

export interface TrajectoryOptions {
  startYear: number;
  endYear: number;
}

export function buildTrajectorySeries(
  facilities: Facility[],
  opts: TrajectoryOptions,
): TrajectoryPoint[] {
  const quantified = facilities.filter(
    f => f.aiExaflops !== null && f.opened !== null && (f.status === 'operational' || f.status === 'upgrading'),
  );

  const points: TrajectoryPoint[] = [];
  for (let year = opts.startYear; year <= opts.endYear; year++) {
    const cumulative = quantified
      .filter(f => Number(f.opened!.slice(0, 4)) <= year)
      .reduce((sum, f) => sum + (f.aiExaflops ?? 0), 0);
    points.push({
      year,
      cumulative,
      target: year === 2030 ? TARGET_2030_EXAFLOPS : null,
    });
  }
  return points;
}
```

- [ ] **Step 4: Run to verify passes**

Run: `npx vitest run tests/unit/trajectory.test.ts`
Expected: 3 PASS.

- [ ] **Step 5: Write failing test `tests/unit/format.test.ts`**

```ts
import { describe, it, expect } from 'vitest';
import { formatExaflops, formatYearMonth, statusLabel, categoryLabel } from '../../src/lib/format';

describe('formatExaflops', () => {
  it('formats whole numbers', () => {
    expect(formatExaflops(21)).toBe('21 AI-exaflops');
  });
  it('formats sub-exaflop with one decimal', () => {
    expect(formatExaflops(0.3)).toBe('0.3 AI-exaflops');
  });
  it('returns placeholder for null', () => {
    expect(formatExaflops(null)).toBe('Not comparable');
  });
});

describe('formatYearMonth', () => {
  it('formats YYYY-MM to "Month YYYY"', () => {
    expect(formatYearMonth('2025-07')).toBe('July 2025');
  });
  it('returns dash for null', () => {
    expect(formatYearMonth(null)).toBe('—');
  });
});

describe('statusLabel', () => {
  it('maps enum to human labels', () => {
    expect(statusLabel('operational')).toBe('Operational');
    expect(statusLabel('upgrading')).toBe('Upgrading');
    expect(statusLabel('planned')).toBe('Planned');
    expect(statusLabel('decommissioned')).toBe('Decommissioned');
  });
});

describe('categoryLabel', () => {
  it('maps category enum to human labels', () => {
    expect(categoryLabel('flagship')).toBe('Flagship AI supercomputer');
    expect(categoryLabel('backbone')).toBe('National HPC backbone');
    expect(categoryLabel('specialist')).toBe('Specialist AI & data platform');
    expect(categoryLabel('regional')).toBe('Regional research system');
    expect(categoryLabel('mission')).toBe('Mission-specific compute');
  });
});
```

- [ ] **Step 6: Run to verify it fails**

Run: `npx vitest run tests/unit/format.test.ts`
Expected: module not found.

- [ ] **Step 7: Implement `src/lib/format.ts`**

```ts
import type { Category, Status } from '../data/schema';

export function formatExaflops(n: number | null): string {
  if (n === null) return 'Not comparable';
  if (Number.isInteger(n)) return `${n} AI-exaflops`;
  return `${n.toFixed(1)} AI-exaflops`;
}

export function formatYearMonth(ym: string | null): string {
  if (!ym) return '—';
  const [y, m] = ym.split('-').map(Number);
  const date = new Date(Date.UTC(y, m - 1, 1));
  return date.toLocaleDateString('en-GB', { year: 'numeric', month: 'long', timeZone: 'UTC' });
}

const STATUS_LABELS: Record<Status, string> = {
  operational: 'Operational',
  upgrading: 'Upgrading',
  planned: 'Planned',
  decommissioned: 'Decommissioned',
};
export const statusLabel = (s: Status) => STATUS_LABELS[s];

const CATEGORY_LABELS: Record<Category, string> = {
  flagship: 'Flagship AI supercomputer',
  backbone: 'National HPC backbone',
  specialist: 'Specialist AI & data platform',
  regional: 'Regional research system',
  mission: 'Mission-specific compute',
};
export const categoryLabel = (c: Category) => CATEGORY_LABELS[c];
```

- [ ] **Step 8: Run to verify passes**

Run: `npx vitest run tests/unit/format.test.ts`
Expected: 4 groups of tests PASS (9 assertions).

- [ ] **Step 9: Commit**

```bash
git add src/lib/trajectory.ts src/lib/format.ts tests/unit/trajectory.test.ts tests/unit/format.test.ts
git commit -m "feat(lib): trajectory series + display format helpers"
```

---

## Task 7: Country Benchmark + Translations Data

**Files:**
- Create: `src/data/countries.ts`
- Create: `src/data/translations.ts`

- [ ] **Step 1: Write `src/data/countries.ts` with hand-curated benchmark data**

```ts
export interface CountryDatum {
  country: string;
  iso2: string;
  publicAiExaflops: number;
  note: string;
  source: string;
}

export const COUNTRY_BENCHMARK: CountryDatum[] = [
  {
    country: 'United States',
    iso2: 'US',
    publicAiExaflops: 2200,
    note: 'Frontier + Aurora + NAIRR pilot; order-of-magnitude estimate of public-access AI compute.',
    source: 'ORNL/ALCF system specs; Top500 Nov 2025.',
  },
  {
    country: 'China',
    iso2: 'CN',
    publicAiExaflops: 1500,
    note: 'State-linked national AI supercomputing network; figures are estimates from public reporting.',
    source: 'National AI industry reporting; Top500 Nov 2025.',
  },
  {
    country: 'Japan',
    iso2: 'JP',
    publicAiExaflops: 600,
    note: 'ABCI-Q and ABCI 3.0 RIKEN systems dedicated to public AI research.',
    source: 'AIST / RIKEN disclosures.',
  },
  {
    country: 'France',
    iso2: 'FR',
    publicAiExaflops: 180,
    note: 'Jean Zay post-2024 upgrade + EuroHPC Jules Verne contribution.',
    source: 'GENCI; EuroHPC JU.',
  },
  {
    country: 'Germany',
    iso2: 'DE',
    publicAiExaflops: 220,
    note: 'JUPITER (FZJ) exascale system plus Gauss Centre AI partitions.',
    source: 'FZJ disclosures; EuroHPC JU.',
  },
  {
    country: 'United Kingdom',
    iso2: 'GB',
    publicAiExaflops: 22,
    note: 'Isambard-AI (~21) + Dawn (~1) as the AIRR core; planned growth to 420 by 2030.',
    source: 'UK Compute Roadmap; AIRR disclosures.',
  },
];
```

- [ ] **Step 2: Write `src/data/translations.ts`**

```ts
export interface TranslationCard {
  title: string;
  body: string;
  source: string;
}

export const TRANSLATIONS: TranslationCard[] = [
  {
    title: 'Seasonal climate forecasts you can run anywhere',
    body: 'Dawn trains IceNet, a sea-ice forecasting model. Once trained on the AIRR, the inference model runs on a laptop. At 420 AI-exaflops, the UK could train dozens of such models a year across weather, oceans, and biodiversity.',
    source: 'UK Compute Roadmap §6.4',
  },
  {
    title: 'AI-assisted cancer screening at national scale',
    body: 'Cambridge researchers use Dawn to train a deep-learning tool for kidney-cancer screening. 420 AI-exaflops would let the NHS iterate on medical-imaging models for every major cancer and stroke-pathway diagnostic, instead of a handful.',
    source: 'UK Compute Roadmap §6.4',
  },
  {
    title: 'Petabytes of Earth observation, turned into policy',
    body: 'JASMIN processes petabytes of environmental data into risk models for flooding, heat, and crop yield. At 420 AI-exaflops, the UK can run these models nationally, updated weekly, instead of case-by-case.',
    source: 'UK Compute Roadmap §6.4',
  },
  {
    title: 'Sovereign LLM capacity for public services',
    body: 'Inference for a 70B-parameter LLM serving a government department is well within a single AIRR facility today. 420 AI-exaflops would support on-shore inference for every major public service simultaneously, without cloud dependency.',
    source: 'Authors\' estimate based on current AIRR throughput.',
  },
];
```

- [ ] **Step 3: Commit**

```bash
git add src/data/countries.ts src/data/translations.ts
git commit -m "feat(data): country benchmark + translations content"
```

---

## Task 8: Protomaps PMTiles — UK Extract

**Files:**
- Create: `public/tiles/uk.pmtiles` (binary, downloaded or extracted)
- Create: `scripts/fetch-tiles.sh` (documentation script)

- [ ] **Step 1: Write `scripts/fetch-tiles.sh`**

```bash
#!/usr/bin/env bash
# Downloads a UK-bounded Protomaps PMTiles extract for the static map basemap.
# UK bbox (approx): minLon=-8.7, minLat=49.8, maxLon=1.8, maxLat=61.0.
# Uses the public Protomaps build endpoint. File is ~50-80MB; committed to repo.
set -euo pipefail
mkdir -p public/tiles
curl -L "https://build.protomaps.com/20250401.pmtiles?bbox=-8.7,49.8,1.8,61.0" \
  -o public/tiles/uk.pmtiles
echo "✔ Downloaded $(du -h public/tiles/uk.pmtiles | cut -f1)"
```

Make executable:
```bash
chmod +x scripts/fetch-tiles.sh
```

- [ ] **Step 2: Run the fetch script**

Run:
```bash
./scripts/fetch-tiles.sh
```

Expected: `public/tiles/uk.pmtiles` exists; size 40–120MB.

- [ ] **Step 3: Verify `.gitignore` is not excluding it, but add LFS if repo size policy requires**

For a private repo starting < 1GB, direct commit is fine. If size is a concern, initialise Git LFS:
```bash
git lfs install
git lfs track "*.pmtiles"
git add .gitattributes
```

- [ ] **Step 4: Commit (plus LFS pointer if used)**

```bash
git add public/tiles/uk.pmtiles scripts/fetch-tiles.sh
git commit -m "feat(tiles): bundle UK Protomaps PMTiles basemap"
```

---

## Task 9: MapLibre + Protomaps Integration (Pins, Clustering)

**Files:**
- Create: `src/components/MapView.tsx`
- Create: `src/components/CategoryPill.tsx`
- Create: `src/components/StatusBadge.tsx`

- [ ] **Step 1: Install map dependencies**

```bash
npm install maplibre-gl pmtiles protomaps-themes-base
npm install -D @types/maplibre-gl
```

- [ ] **Step 2: Write `src/components/CategoryPill.tsx`**

```tsx
import type { Category } from '../data/schema';
import { categoryLabel } from '../lib/format';

const COLOR: Record<Category, string> = {
  flagship: 'bg-category-flagship',
  backbone: 'bg-category-backbone',
  specialist: 'bg-category-specialist',
  regional: 'bg-category-regional',
  mission: 'bg-category-mission',
};

export function CategoryPill({ category }: { category: Category }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium text-white ${COLOR[category]}`}>
      {categoryLabel(category)}
    </span>
  );
}
```

- [ ] **Step 3: Write `src/components/StatusBadge.tsx`**

```tsx
import type { Status } from '../data/schema';
import { statusLabel } from '../lib/format';

const CLASSES: Record<Status, string> = {
  operational:    'border-status-operational text-status-operational',
  upgrading:      'border-status-upgrading text-status-upgrading',
  planned:        'border-status-planned text-status-planned',
  decommissioned: 'border-status-decommissioned text-status-decommissioned line-through',
};

export function StatusBadge({ status }: { status: Status }) {
  return (
    <span className={`inline-flex items-center rounded border px-2 py-0.5 text-xs font-medium ${CLASSES[status]}`}>
      {statusLabel(status)}
    </span>
  );
}
```

- [ ] **Step 4: Write `src/components/MapView.tsx`**

```tsx
import { useEffect, useRef } from 'react';
import maplibregl, { Map as MLMap } from 'maplibre-gl';
import { Protocol } from 'pmtiles';
import 'maplibre-gl/dist/maplibre-gl.css';
import type { Facility, Category, Status } from '../data/schema';

export interface MapViewProps {
  facilities: Facility[];
  onSelect: (slug: string) => void;
  selectedSlug: string | null;
}

const CATEGORY_COLOR: Record<Category, string> = {
  flagship: '#1f4e79',
  backbone: '#2e7d5b',
  specialist: '#8b5e3c',
  regional: '#6a4c93',
  mission: '#8c3a3a',
};

const STATUS_OPACITY: Record<Status, number> = {
  operational: 1.0,
  upgrading: 0.9,
  planned: 0.35,
  decommissioned: 0.25,
};

const UK_CENTER: [number, number] = [-3.5, 54.5];
const UK_BOUNDS: [[number, number], [number, number]] = [[-11, 49], [3, 61]];

export function MapView({ facilities, onSelect, selectedSlug }: MapViewProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MLMap | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const protocol = new Protocol();
    maplibregl.addProtocol('pmtiles', protocol.tile);

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: {
        version: 8,
        sources: {
          protomaps: {
            type: 'vector',
            url: 'pmtiles:///tiles/uk.pmtiles',
            attribution: '© OpenStreetMap contributors, Protomaps',
          },
        },
        layers: [
          { id: 'background', type: 'background', paint: { 'background-color': '#fbfaf7' } },
          { id: 'landuse',    type: 'fill',       source: 'protomaps', 'source-layer': 'earth',
            paint: { 'fill-color': '#f2efe8' } },
          { id: 'water',      type: 'fill',       source: 'protomaps', 'source-layer': 'water',
            paint: { 'fill-color': '#dde4ea' } },
          { id: 'borders',    type: 'line',       source: 'protomaps', 'source-layer': 'boundaries',
            paint: { 'line-color': '#bfb9ad', 'line-width': 0.6 } },
        ],
        glyphs: 'https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf',
      },
      center: UK_CENTER,
      zoom: 5.2,
      minZoom: 4.5,
      maxZoom: 10,
      maxBounds: UK_BOUNDS,
      attributionControl: { compact: true },
    });

    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');

    map.on('load', () => {
      const features = facilities.map(f => ({
        type: 'Feature' as const,
        properties: {
          slug: f.slug,
          name: f.name,
          category: f.category,
          status: f.status,
          color: CATEGORY_COLOR[f.category],
          opacity: STATUS_OPACITY[f.status],
        },
        geometry: { type: 'Point' as const, coordinates: [f.location.lon, f.location.lat] },
      }));

      map.addSource('facilities', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features },
        cluster: true,
        clusterRadius: 30,
        clusterMaxZoom: 8,
      });

      map.addLayer({
        id: 'cluster-bubbles',
        type: 'circle',
        source: 'facilities',
        filter: ['has', 'point_count'],
        paint: {
          'circle-color': '#1a1a1a',
          'circle-opacity': 0.75,
          'circle-radius': ['step', ['get', 'point_count'], 14, 3, 18, 6, 22],
          'circle-stroke-color': '#ffffff',
          'circle-stroke-width': 2,
        },
      });

      map.addLayer({
        id: 'cluster-counts',
        type: 'symbol',
        source: 'facilities',
        filter: ['has', 'point_count'],
        layout: { 'text-field': '{point_count_abbreviated}', 'text-size': 12 },
        paint: { 'text-color': '#ffffff' },
      });

      map.addLayer({
        id: 'facility-dots',
        type: 'circle',
        source: 'facilities',
        filter: ['!', ['has', 'point_count']],
        paint: {
          'circle-color': ['get', 'color'],
          'circle-opacity': ['get', 'opacity'],
          'circle-radius': 8,
          'circle-stroke-color': '#ffffff',
          'circle-stroke-width': 2,
        },
      });

      map.on('click', 'facility-dots', (e) => {
        const feature = e.features?.[0];
        if (!feature) return;
        const slug = feature.properties?.slug as string | undefined;
        if (slug) onSelect(slug);
      });

      map.on('click', 'cluster-bubbles', async (e) => {
        const feature = e.features?.[0];
        if (!feature || feature.geometry.type !== 'Point') return;
        const source = map.getSource('facilities') as maplibregl.GeoJSONSource;
        const zoom = await source.getClusterExpansionZoom(feature.properties!.cluster_id);
        map.easeTo({ center: feature.geometry.coordinates as [number, number], zoom });
      });

      map.on('mouseenter', 'facility-dots', () => (map.getCanvas().style.cursor = 'pointer'));
      map.on('mouseleave', 'facility-dots', () => (map.getCanvas().style.cursor = ''));
    });

    mapRef.current = map;
    return () => {
      map.remove();
      maplibregl.removeProtocol('pmtiles');
    };
  }, [facilities, onSelect]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !selectedSlug) return;
    const f = facilities.find(x => x.slug === selectedSlug);
    if (!f) return;
    map.easeTo({ center: [f.location.lon, f.location.lat], zoom: Math.max(map.getZoom(), 7) });
  }, [selectedSlug, facilities]);

  return <div ref={containerRef} className="h-[80vh] w-full rounded-lg border border-stone-300" />;
}
```

- [ ] **Step 5: Verify TypeScript builds**

Run: `npx astro check`
Expected: no type errors.

- [ ] **Step 6: Commit**

```bash
git add src/components/MapView.tsx src/components/CategoryPill.tsx src/components/StatusBadge.tsx
git commit -m "feat(map): MapLibre + Protomaps with clustering and status-aware pins"
```

---

## Task 10: Filter Bar Component (URL-Synced)

**Files:**
- Create: `src/components/FilterBar.tsx`

- [ ] **Step 1: Write `src/components/FilterBar.tsx`**

```tsx
import { useEffect, useState, useCallback } from 'react';
import type { FilterState } from '../lib/filters';
import { filtersFromSearchParams, filtersToSearchParams } from '../lib/filters';
import type {
  Category, Status, Nation, ITL1, AccessType, HardwareTag,
} from '../data/schema';

const CATEGORIES: Category[] = ['flagship', 'backbone', 'specialist', 'regional', 'mission'];
const STATUSES: Status[] = ['operational', 'upgrading', 'planned', 'decommissioned'];
const NATIONS: Nation[] = ['England', 'Scotland', 'Wales', 'Northern Ireland'];
const ACCESS_TYPES: AccessType[] = ['public-application', 'federated', 'restricted', 'commercial'];
const HARDWARE: HardwareTag[] = ['nvidia-gpu', 'amd-gpu', 'intel-gpu', 'grace-hopper', 'cerebras', 'cpu-only', 'cloud'];

const CATEGORY_LABELS: Record<Category, string> = {
  flagship: 'Flagship AI', backbone: 'National backbone', specialist: 'Specialist / data',
  regional: 'Regional', mission: 'Mission-specific',
};
const STATUS_LABELS: Record<Status, string> = {
  operational: 'Operational', upgrading: 'Upgrading', planned: 'Planned', decommissioned: 'Decommissioned',
};
const ACCESS_LABELS: Record<AccessType, string> = {
  'public-application': 'Public application', federated: 'Federated', restricted: 'Restricted', commercial: 'Commercial',
};

export interface FilterBarProps {
  onChange: (state: FilterState) => void;
  funders: string[];
}

function toggle<T>(arr: T[] | undefined, v: T): T[] {
  const s = new Set(arr ?? []);
  s.has(v) ? s.delete(v) : s.add(v);
  return Array.from(s);
}

export function FilterBar({ onChange, funders }: FilterBarProps) {
  const [state, setState] = useState<FilterState>(() =>
    typeof window === 'undefined'
      ? {}
      : filtersFromSearchParams(new URLSearchParams(window.location.search)),
  );
  const [advancedOpen, setAdvancedOpen] = useState(false);

  useEffect(() => {
    onChange(state);
    const params = filtersToSearchParams(state);
    const qs = params.toString();
    const url = qs ? `?${qs}` : window.location.pathname;
    window.history.replaceState(null, '', url);
  }, [state, onChange]);

  const set = useCallback(<K extends keyof FilterState>(k: K, v: FilterState[K]) => {
    setState(prev => ({ ...prev, [k]: v }));
  }, []);

  return (
    <div className="rounded-lg border border-stone-300 bg-white p-4">
      <div className="flex flex-wrap gap-4">
        <Group label="Category">
          {CATEGORIES.map(c => (
            <Chip
              key={c}
              active={!!state.categories?.includes(c)}
              onClick={() => set('categories', toggle(state.categories, c))}
            >
              {CATEGORY_LABELS[c]}
            </Chip>
          ))}
        </Group>
        <Group label="Status">
          {STATUSES.map(s => (
            <Chip
              key={s}
              active={!!state.statuses?.includes(s)}
              onClick={() => set('statuses', toggle(state.statuses, s))}
            >
              {STATUS_LABELS[s]}
            </Chip>
          ))}
        </Group>
        <Group label="Nation">
          {NATIONS.map(n => (
            <Chip
              key={n}
              active={!!state.nations?.includes(n)}
              onClick={() => set('nations', toggle(state.nations, n))}
            >
              {n}
            </Chip>
          ))}
        </Group>
      </div>

      <button
        type="button"
        className="mt-3 text-sm underline text-stone-700"
        aria-expanded={advancedOpen}
        onClick={() => setAdvancedOpen(o => !o)}
      >
        {advancedOpen ? 'Hide advanced filters' : 'More filters'}
      </button>

      {advancedOpen && (
        <div className="mt-3 flex flex-wrap gap-4 border-t pt-3">
          <Group label="Access">
            {ACCESS_TYPES.map(a => (
              <Chip
                key={a}
                active={!!state.accessTypes?.includes(a)}
                onClick={() => set('accessTypes', toggle(state.accessTypes, a))}
              >
                {ACCESS_LABELS[a]}
              </Chip>
            ))}
          </Group>
          <Group label="Hardware">
            {HARDWARE.map(h => (
              <Chip
                key={h}
                active={!!state.hardwareTags?.includes(h)}
                onClick={() => set('hardwareTags', toggle(state.hardwareTags, h))}
              >
                {h}
              </Chip>
            ))}
          </Group>
          <Group label="Funder">
            {funders.map(f => (
              <Chip
                key={f}
                active={!!state.funders?.includes(f)}
                onClick={() => set('funders', toggle(state.funders, f))}
              >
                {f}
              </Chip>
            ))}
          </Group>
        </div>
      )}

      {hasActive(state) && (
        <button
          type="button"
          className="mt-3 ml-auto block text-sm text-stone-600 underline"
          onClick={() => setState({})}
        >
          Clear all filters
        </button>
      )}
    </div>
  );
}

function hasActive(s: FilterState): boolean {
  return Object.values(s).some(v => Array.isArray(v) && v.length > 0);
}

function Group({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <fieldset className="flex flex-col gap-1">
      <legend className="text-xs font-medium uppercase tracking-wide text-stone-500">{label}</legend>
      <div className="flex flex-wrap gap-1">{children}</div>
    </fieldset>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`rounded-full border px-3 py-1 text-sm transition ${
        active ? 'border-ink bg-ink text-white' : 'border-stone-300 bg-white text-ink hover:border-ink'
      }`}
    >
      {children}
    </button>
  );
}
```

- [ ] **Step 2: Verify types**

Run: `npx astro check`
Expected: no type errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/FilterBar.tsx
git commit -m "feat(filters): URL-synced filter bar with advanced disclosure"
```

---

## Task 11: Detail Panel + Sources Component

**Files:**
- Create: `src/components/DetailPanel.tsx`
- Create: `src/components/Sources.tsx`

- [ ] **Step 1: Write `src/components/Sources.tsx`**

```tsx
import type { Facility } from '../data/schema';

export function Sources({ sources }: { sources: Facility['sources'] }) {
  return (
    <ul className="space-y-1 text-sm">
      {sources.map(s => (
        <li key={s.url}>
          <a
            href={s.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-stone-700 underline underline-offset-2 hover:text-ink"
          >
            {s.label}
          </a>
        </li>
      ))}
    </ul>
  );
}
```

- [ ] **Step 2: Write `src/components/DetailPanel.tsx`**

```tsx
import { useEffect, useRef } from 'react';
import type { Facility } from '../data/schema';
import { CategoryPill } from './CategoryPill';
import { StatusBadge } from './StatusBadge';
import { Sources } from './Sources';
import { formatExaflops, formatYearMonth } from '../lib/format';

export interface DetailPanelProps {
  facility: Facility | null;
  onClose: () => void;
}

export function DetailPanel({ facility, onClose }: DetailPanelProps) {
  const closeRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (facility) closeRef.current?.focus();
  }, [facility]);

  useEffect(() => {
    if (!facility) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [facility, onClose]);

  if (!facility) return null;

  return (
    <aside
      role="dialog"
      aria-labelledby="detail-title"
      className="fixed right-0 top-0 z-30 h-full w-full max-w-md overflow-y-auto border-l border-stone-300 bg-white p-6 shadow-xl"
    >
      <div className="mb-4 flex items-start justify-between">
        <div>
          <h2 id="detail-title" className="font-serif text-2xl">{facility.name}</h2>
          <p className="mt-1 text-sm text-stone-600">
            {facility.location.institution}, {facility.location.city}
          </p>
        </div>
        <button ref={closeRef} onClick={onClose} aria-label="Close details" className="rounded border px-2 py-1">
          ✕
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        <CategoryPill category={facility.category} />
        <StatusBadge status={facility.status} />
      </div>

      <p className="mt-4 text-base">{facility.oneLiner}</p>

      <dl className="mt-6 grid grid-cols-[auto,1fr] gap-x-4 gap-y-2 text-sm">
        <dt className="text-stone-500">Hardware</dt>     <dd>{facility.keyFacts.hardware}</dd>
        <dt className="text-stone-500">Performance</dt>  <dd>{facility.keyFacts.performance}</dd>
        <dt className="text-stone-500">AI-exaflops</dt>  <dd>{formatExaflops(facility.aiExaflops)}</dd>
        <dt className="text-stone-500">Funding</dt>      <dd>{facility.keyFacts.funding}</dd>
        <dt className="text-stone-500">Energy</dt>       <dd>{facility.keyFacts.energy}</dd>
        <dt className="text-stone-500">Operator</dt>     <dd>{facility.operator}</dd>
        <dt className="text-stone-500">Funder</dt>       <dd>{facility.funder}</dd>
        <dt className="text-stone-500">Opened</dt>       <dd>{formatYearMonth(facility.opened)}</dd>
      </dl>

      <section className="mt-6">
        <h3 className="font-serif text-lg">Access</h3>
        <p className="mt-1 text-sm">{facility.access.route}</p>
      </section>

      {facility.useCases.length > 0 && (
        <section className="mt-6">
          <h3 className="font-serif text-lg">What it's for</h3>
          <ul className="mt-1 list-disc pl-5 text-sm">
            {facility.useCases.map(u => <li key={u}>{u}</li>)}
          </ul>
        </section>
      )}

      <section className="mt-6">
        <h3 className="font-serif text-lg">Sources</h3>
        <Sources sources={facility.sources} />
      </section>

      <a
        href={`/facilities/${facility.slug}`}
        className="mt-6 inline-block rounded border border-ink px-4 py-2 text-sm hover:bg-ink hover:text-white"
      >
        Read full profile →
      </a>
    </aside>
  );
}
```

- [ ] **Step 3: Verify types**

Run: `npx astro check`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/components/DetailPanel.tsx src/components/Sources.tsx
git commit -m "feat(panel): detail panel with key facts, access, use cases, sources"
```

---

## Task 12: List View (Accessibility Fallback)

**Files:**
- Create: `src/components/ListView.tsx`

- [ ] **Step 1: Write `src/components/ListView.tsx`**

```tsx
import type { Facility } from '../data/schema';
import { CategoryPill } from './CategoryPill';
import { StatusBadge } from './StatusBadge';
import { formatExaflops } from '../lib/format';

export function ListView({ facilities, onSelect }: { facilities: Facility[]; onSelect: (slug: string) => void }) {
  if (facilities.length === 0) {
    return <p className="p-6 text-sm text-stone-600">No facilities match the current filters.</p>;
  }
  return (
    <ul className="grid gap-3 p-2 sm:grid-cols-2 lg:grid-cols-3">
      {facilities.map(f => (
        <li key={f.slug}>
          <button
            type="button"
            onClick={() => onSelect(f.slug)}
            className="w-full rounded-lg border border-stone-300 bg-white p-4 text-left hover:border-ink focus:outline-none focus:ring-2 focus:ring-ink"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-lg">{f.name}</h3>
              <StatusBadge status={f.status} />
            </div>
            <p className="mt-1 text-sm text-stone-600">
              {f.location.institution}, {f.location.city}
            </p>
            <div className="mt-2"><CategoryPill category={f.category} /></div>
            <p className="mt-3 text-sm">{f.oneLiner}</p>
            <p className="mt-2 text-xs text-stone-500">{formatExaflops(f.aiExaflops)}</p>
          </button>
        </li>
      ))}
    </ul>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/ListView.tsx
git commit -m "feat(a11y): accessible list view fallback for map"
```

---

## Task 13: Trajectory Chart + Country Benchmark Charts

**Files:**
- Create: `src/components/TrajectoryChart.tsx`
- Create: `src/components/CountryBenchmark.tsx`

- [ ] **Step 1: Install Recharts**

```bash
npm install recharts
```

- [ ] **Step 2: Write `src/components/TrajectoryChart.tsx`**

```tsx
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ResponsiveContainer,
} from 'recharts';
import type { Facility } from '../data/schema';
import { buildTrajectorySeries, TARGET_2030_EXAFLOPS } from '../lib/trajectory';

export function TrajectoryChart({ facilities }: { facilities: Facility[] }) {
  const data = buildTrajectorySeries(facilities, { startYear: 2020, endYear: 2030 });
  const current = data[data.length - 1]?.cumulative ?? 0;
  const quantified = facilities.filter(f => f.aiExaflops !== null).length;

  return (
    <div>
      <div className="mb-4 flex items-baseline justify-between">
        <h2 className="font-serif text-2xl">Trajectory to 420 AI-exaflops</h2>
        <span className="text-sm text-stone-600">
          {current} of {TARGET_2030_EXAFLOPS} exaflops · {quantified} facilities quantified
        </span>
      </div>
      <div className="h-72 w-full">
        <ResponsiveContainer>
          <LineChart data={data} margin={{ top: 8, right: 24, bottom: 8, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e7e4dc" />
            <XAxis dataKey="year" />
            <YAxis domain={[0, TARGET_2030_EXAFLOPS + 20]} unit=" ef" />
            <Tooltip />
            <ReferenceLine y={TARGET_2030_EXAFLOPS} stroke="#8c3a3a" strokeDasharray="4 4"
              label={{ value: '2030 target: 420', position: 'insideTopRight', fill: '#8c3a3a', fontSize: 12 }} />
            <Line type="monotone" dataKey="cumulative" stroke="#1f4e79" strokeWidth={3} dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <p className="mt-3 text-xs text-stone-600">
        Only facilities with a published AI-exaflops figure are plotted. CPU-based systems (ARCHER2, Met Office) and
        systems without disclosed AI-exaflops ratings are not represented here; they appear on the map.
      </p>
    </div>
  );
}
```

- [ ] **Step 3: Write `src/components/CountryBenchmark.tsx`**

```tsx
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList } from 'recharts';
import { COUNTRY_BENCHMARK } from '../data/countries';

export function CountryBenchmark() {
  const data = [...COUNTRY_BENCHMARK].sort((a, b) => b.publicAiExaflops - a.publicAiExaflops);
  return (
    <div>
      <div className="mb-4 flex items-baseline justify-between">
        <h2 className="font-serif text-2xl">Where the UK sits</h2>
        <span className="text-sm text-stone-600">Public-sector AI compute capacity (est., AI-exaflops)</span>
      </div>
      <div className="h-80 w-full">
        <ResponsiveContainer>
          <BarChart data={data} layout="vertical" margin={{ top: 8, right: 40, bottom: 8, left: 80 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e7e4dc" />
            <XAxis type="number" />
            <YAxis type="category" dataKey="country" />
            <Tooltip />
            <Bar dataKey="publicAiExaflops" fill="#1f4e79" radius={[0, 4, 4, 0]}>
              <LabelList dataKey="publicAiExaflops" position="right" />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <ul className="mt-3 space-y-1 text-xs text-stone-600">
        {data.map(c => (
          <li key={c.iso2}>
            <strong>{c.country}:</strong> {c.note} <em>(Source: {c.source})</em>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-xs text-stone-500">
        Figures are rough order-of-magnitude estimates of publicly accessible AI compute compiled from national
        disclosures and the Top500 list. They are not directly comparable across jurisdictions; treat as indicative.
      </p>
    </div>
  );
}
```

- [ ] **Step 4: Verify types**

Run: `npx astro check`
Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add src/components/TrajectoryChart.tsx src/components/CountryBenchmark.tsx package.json package-lock.json
git commit -m "feat(charts): trajectory + country benchmark"
```

---

## Task 14: Hero, Translations, Methodology, Footer Components

**Files:**
- Create: `src/components/Hero.astro`
- Create: `src/components/TranslationsGrid.astro`
- Create: `src/components/Methodology.astro`
- Create: `src/components/Footer.astro`

- [ ] **Step 1: Write `src/components/Hero.astro`**

```astro
---
interface Stat { label: string; value: string; sub?: string; }
const { stats } = Astro.props as { stats: Stat[] };
---
<section class="border-b border-stone-200 bg-surface">
  <div class="mx-auto max-w-6xl px-6 py-12">
    <p class="text-sm uppercase tracking-widest text-stone-500">UK public-sector AI compute</p>
    <h1 class="mt-2 font-serif text-4xl leading-tight md:text-5xl">
      The UK plans <span class="text-category-flagship">420 AI-exaflops by 2030</span>.<br/>
      Here's where it lives — and whether it's enough.
    </h1>
    <p class="mt-4 max-w-2xl text-stone-700">
      An interactive map of the publicly funded compute infrastructure powering AI research, inference, and
      public-sector applications across the United Kingdom. Data sourced from the UK Compute Roadmap and
      facility operators.
    </p>
    <dl class="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
      {stats.map(s => (
        <div>
          <dt class="text-xs uppercase tracking-wide text-stone-500">{s.label}</dt>
          <dd class="mt-1 font-serif text-3xl">{s.value}</dd>
          {s.sub && <dd class="text-xs text-stone-500">{s.sub}</dd>}
        </div>
      ))}
    </dl>
  </div>
</section>
```

- [ ] **Step 2: Write `src/components/TranslationsGrid.astro`**

```astro
---
import { TRANSLATIONS } from '../data/translations';
---
<section class="mx-auto max-w-6xl px-6 py-12">
  <h2 class="font-serif text-2xl">What 420 AI-exaflops could mean</h2>
  <p class="mt-2 max-w-2xl text-stone-700">
    Scale is abstract. These are concrete public-sector outcomes the compute roadmap could enable if realised.
  </p>
  <div class="mt-6 grid gap-4 md:grid-cols-2">
    {TRANSLATIONS.map(t => (
      <article class="rounded-lg border border-stone-300 bg-white p-5">
        <h3 class="font-serif text-lg">{t.title}</h3>
        <p class="mt-2 text-sm">{t.body}</p>
        <p class="mt-3 text-xs text-stone-500">Source: {t.source}</p>
      </article>
    ))}
  </div>
</section>
```

- [ ] **Step 3: Write `src/components/Methodology.astro`**

```astro
---
const { lastUpdated } = Astro.props as { lastUpdated: string };
---
<section class="mx-auto max-w-6xl px-6 py-12">
  <details class="group">
    <summary class="cursor-pointer font-serif text-xl">Methodology & sources</summary>
    <div class="mt-4 space-y-3 text-sm text-stone-700">
      <p>
        Facilities are included if they are publicly funded or publicly accessible, based on the UK Compute Roadmap
        (GOV.UK) and operator disclosures. Each facility is classified into one of five categories — Flagship AI,
        National HPC backbone, Specialist AI & data, Regional research, and Mission-specific — based on its primary
        role in the national picture.
      </p>
      <p>
        The trajectory chart plots only facilities with a published AI-exaflops rating. CPU-based systems (e.g.
        ARCHER2, Met Office) and facilities without disclosed AI-exaflops figures are omitted from the chart but
        appear on the map. This is a deliberate methodology choice: AI-exaflops is not directly comparable across
        CPU and GPU architectures, so combining them would mislead.
      </p>
      <p>
        The country-comparison figures are rough, hand-curated order-of-magnitude estimates of publicly accessible
        AI compute drawn from national disclosures and the Top500 list. They are indicative, not rigorous.
      </p>
      <p class="text-xs text-stone-500">Last updated: {lastUpdated}</p>
    </div>
  </details>
</section>
```

- [ ] **Step 4: Write `src/components/Footer.astro`**

```astro
<footer class="border-t border-stone-200 bg-surface">
  <div class="mx-auto max-w-6xl px-6 py-8 text-sm text-stone-600">
    <p>Built with publicly available data. Corrections welcome via GitHub issues.</p>
  </div>
</footer>
```

- [ ] **Step 5: Commit**

```bash
git add src/components/Hero.astro src/components/TranslationsGrid.astro src/components/Methodology.astro src/components/Footer.astro
git commit -m "feat(ui): hero, translations, methodology, footer"
```

---

## Task 15: Compose the Main Page

**Files:**
- Create: `src/components/MapExplorer.tsx` (container island that orchestrates map + filter + panel + list toggle)
- Modify: `src/pages/index.astro`

- [ ] **Step 1: Write `src/components/MapExplorer.tsx`**

```tsx
import { useMemo, useState, useCallback } from 'react';
import type { Facility } from '../data/schema';
import { applyFilters, type FilterState } from '../lib/filters';
import { MapView } from './MapView';
import { FilterBar } from './FilterBar';
import { DetailPanel } from './DetailPanel';
import { ListView } from './ListView';

export function MapExplorer({ facilities }: { facilities: Facility[] }) {
  const [filters, setFilters] = useState<FilterState>({});
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [view, setView] = useState<'map' | 'list'>('map');

  const filtered = useMemo(() => applyFilters(facilities, filters), [facilities, filters]);
  const funders = useMemo(
    () => Array.from(new Set(facilities.map(f => f.funder))).sort(),
    [facilities],
  );
  const selected = filtered.find(f => f.slug === selectedSlug) ?? null;

  const onSelect = useCallback((slug: string) => setSelectedSlug(slug), []);
  const onClose  = useCallback(() => setSelectedSlug(null), []);

  return (
    <section className="mx-auto max-w-6xl px-6 py-8">
      <div className="flex flex-col gap-4">
        <FilterBar onChange={setFilters} funders={funders} />
        <div className="flex items-center justify-between">
          <p className="text-sm text-stone-600">
            Showing {filtered.length} of {facilities.length} facilities.
          </p>
          <div role="tablist" className="inline-flex rounded border border-stone-300 bg-white text-sm">
            <button role="tab" aria-selected={view === 'map'}
              className={`px-3 py-1 ${view === 'map' ? 'bg-ink text-white' : ''}`}
              onClick={() => setView('map')}>Map</button>
            <button role="tab" aria-selected={view === 'list'}
              className={`px-3 py-1 ${view === 'list' ? 'bg-ink text-white' : ''}`}
              onClick={() => setView('list')}>List</button>
          </div>
        </div>
        {view === 'map'
          ? <MapView facilities={filtered} onSelect={onSelect} selectedSlug={selectedSlug} />
          : <ListView facilities={filtered} onSelect={onSelect} />}
      </div>
      <DetailPanel facility={selected} onClose={onClose} />
    </section>
  );
}
```

- [ ] **Step 2: Rewrite `src/pages/index.astro`**

```astro
---
import Base from '../layouts/Base.astro';
import Hero from '../components/Hero.astro';
import TranslationsGrid from '../components/TranslationsGrid.astro';
import Methodology from '../components/Methodology.astro';
import Footer from '../components/Footer.astro';
import { MapExplorer } from '../components/MapExplorer';
import { TrajectoryChart } from '../components/TrajectoryChart';
import { CountryBenchmark } from '../components/CountryBenchmark';
import { loadFacilities } from '../lib/load-facilities';
import { TARGET_2030_EXAFLOPS } from '../lib/trajectory';
import { execSync } from 'node:child_process';

const facilities = await loadFacilities();
const totalExaflops = facilities.reduce((sum, f) => sum + (f.aiExaflops ?? 0), 0);
const operationalCount = facilities.filter(f => f.status === 'operational').length;
const plannedCount = facilities.filter(f => f.status === 'planned').length;

const stats = [
  { label: 'AI-exaflops today', value: `≈${totalExaflops}`, sub: 'public-sector accessible' },
  { label: 'Target 2030', value: `${TARGET_2030_EXAFLOPS}` },
  { label: 'Facilities', value: `${facilities.length}`, sub: `${operationalCount} operational · ${plannedCount} planned` },
  { label: 'AIRR flagship', value: '£261m', sub: 'Isambard-AI + Dawn expansion' },
];

let lastUpdated = 'unknown';
try {
  lastUpdated = execSync('git log -1 --format=%cs').toString().trim();
} catch { /* not a git repo yet */ }
---

<Base title="UK Public-Sector AI Compute — an interactive map">
  <Hero stats={stats} />
  <MapExplorer facilities={facilities} client:load />
  <section class="mx-auto max-w-6xl px-6 py-12">
    <TrajectoryChart facilities={facilities} client:visible />
  </section>
  <section class="mx-auto max-w-6xl px-6 py-12">
    <CountryBenchmark client:visible />
  </section>
  <TranslationsGrid />
  <Methodology lastUpdated={lastUpdated} />
  <Footer />
</Base>
```

- [ ] **Step 3: Run dev server and verify**

Run: `npm run dev`
Expected: page loads at http://localhost:4321 with hero, filter bar, map showing pins, trajectory chart, country benchmark, translations, methodology, footer.

Manually verify:
- Map loads Protomaps basemap.
- Pins visible and colour-coded by category.
- Clicking a pin opens the detail panel.
- Toggling filters updates pins and URL query string.
- List view renders the same facilities as cards.
- All charts render.

- [ ] **Step 4: Commit**

```bash
git add src/components/MapExplorer.tsx src/pages/index.astro
git commit -m "feat(page): compose main page with map explorer + charts + content sections"
```

---

## Task 16: Per-Facility Standalone Pages

**Files:**
- Create: `src/pages/facilities/[slug].astro`

- [ ] **Step 1: Write the dynamic route**

```astro
---
import Base from '../../layouts/Base.astro';
import Footer from '../../components/Footer.astro';
import { CategoryPill } from '../../components/CategoryPill';
import { StatusBadge } from '../../components/StatusBadge';
import { Sources } from '../../components/Sources';
import { loadFacilities } from '../../lib/load-facilities';
import { formatExaflops, formatYearMonth } from '../../lib/format';

export async function getStaticPaths() {
  const facilities = await loadFacilities();
  return facilities.map(f => ({ params: { slug: f.slug }, props: { facility: f } }));
}

const { facility } = Astro.props;
---

<Base title={`${facility.name} · UK Compute Map`} description={facility.oneLiner}>
  <article class="mx-auto max-w-3xl px-6 py-12">
    <a href="/" class="text-sm text-stone-600 underline">← Back to map</a>

    <header class="mt-4">
      <h1 class="font-serif text-4xl">{facility.name}</h1>
      <p class="mt-2 text-stone-600">
        {facility.location.institution}, {facility.location.city} · {facility.location.nation}
      </p>
      <div class="mt-3 flex flex-wrap gap-2">
        <CategoryPill category={facility.category} />
        <StatusBadge status={facility.status} />
      </div>
      <p class="mt-4 text-lg text-stone-800">{facility.oneLiner}</p>
    </header>

    <section class="mt-8 rounded-lg border border-stone-300 bg-white p-5">
      <h2 class="font-serif text-xl">At a glance</h2>
      <dl class="mt-4 grid grid-cols-[auto,1fr] gap-x-6 gap-y-2 text-sm">
        <dt class="text-stone-500">Hardware</dt>     <dd>{facility.keyFacts.hardware}</dd>
        <dt class="text-stone-500">Performance</dt>  <dd>{facility.keyFacts.performance}</dd>
        <dt class="text-stone-500">AI-exaflops</dt>  <dd>{formatExaflops(facility.aiExaflops)}</dd>
        <dt class="text-stone-500">Funding</dt>      <dd>{facility.keyFacts.funding}</dd>
        <dt class="text-stone-500">Energy</dt>       <dd>{facility.keyFacts.energy}</dd>
        <dt class="text-stone-500">Operator</dt>     <dd>{facility.operator}</dd>
        <dt class="text-stone-500">Funder</dt>       <dd>{facility.funder}</dd>
        <dt class="text-stone-500">Opened</dt>       <dd>{formatYearMonth(facility.opened)}</dd>
        {facility.decommissioned && (
          <>
            <dt class="text-stone-500">Decommissioned</dt>
            <dd>{formatYearMonth(facility.decommissioned)}</dd>
          </>
        )}
      </dl>
    </section>

    <section class="mt-8">
      <h2 class="font-serif text-xl">Overview</h2>
      <p class="mt-2 leading-relaxed text-stone-800">{facility.summary}</p>
    </section>

    <section class="mt-8">
      <h2 class="font-serif text-xl">Hardware & performance</h2>
      <table class="mt-3 w-full text-sm">
        <tbody>
          <tr class="border-t border-stone-200"><th class="py-2 text-left text-stone-500">Hardware</th><td>{facility.keyFacts.hardware}</td></tr>
          <tr class="border-t border-stone-200"><th class="py-2 text-left text-stone-500">Performance</th><td>{facility.keyFacts.performance}</td></tr>
          <tr class="border-t border-stone-200"><th class="py-2 text-left text-stone-500">AI-exaflops</th><td>{formatExaflops(facility.aiExaflops)}</td></tr>
          <tr class="border-t border-stone-200"><th class="py-2 text-left text-stone-500">Energy</th><td>{facility.keyFacts.energy}</td></tr>
          <tr class="border-t border-stone-200"><th class="py-2 text-left text-stone-500">Hardware tags</th><td>{facility.hardwareTags.join(', ')}</td></tr>
        </tbody>
      </table>
    </section>

    <section class="mt-8">
      <h2 class="font-serif text-xl">Access & eligibility</h2>
      <p class="mt-2 text-stone-800">{facility.access.route}</p>
      <p class="mt-1 text-xs text-stone-500">Access type: {facility.access.accessType}</p>
      {facility.federationMembers && (
        <div class="mt-3">
          <h3 class="text-sm font-medium">Federation members</h3>
          <ul class="mt-1 list-disc pl-5 text-sm">
            {facility.federationMembers.map(m => <li>{m}</li>)}
          </ul>
        </div>
      )}
    </section>

    {facility.useCases.length > 0 && (
      <section class="mt-8">
        <h2 class="font-serif text-xl">Use cases</h2>
        <ul class="mt-2 list-disc pl-5 text-stone-800">
          {facility.useCases.map(u => <li>{u}</li>)}
        </ul>
      </section>
    )}

    <section class="mt-8">
      <h2 class="font-serif text-xl">Sources</h2>
      <Sources sources={facility.sources} />
    </section>

    <a href="/" class="mt-10 inline-block rounded border border-ink px-4 py-2 text-sm hover:bg-ink hover:text-white">
      ← Back to map
    </a>
  </article>
  <Footer />
</Base>
```

- [ ] **Step 2: Build and verify all facility pages generate**

Run: `npm run build`
Expected: `dist/facilities/isambard-ai/index.html` (and similar for every slug) exists.

Verify with:
```bash
ls dist/facilities | wc -l
```
Expected: matches number of facility JSONs.

- [ ] **Step 3: Commit**

```bash
git add src/pages/facilities
git commit -m "feat(pages): static per-facility standalone pages"
```

---

## Task 17: e2e Smoke Tests with Playwright

**Files:**
- Create: `playwright.config.ts`
- Create: `tests/e2e/homepage.spec.ts`
- Create: `tests/e2e/facility-page.spec.ts`

- [ ] **Step 1: Install Playwright browsers**

Run:
```bash
npx playwright install --with-deps chromium
```

- [ ] **Step 2: Write `playwright.config.ts`**

```ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  webServer: {
    command: 'npm run build && npm run preview -- --host 127.0.0.1 --port 4322',
    url: 'http://127.0.0.1:4322',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
  use: { baseURL: 'http://127.0.0.1:4322', trace: 'on-first-retry' },
  projects: [{ name: 'chromium', use: { browserName: 'chromium' } }],
});
```

- [ ] **Step 3: Write `tests/e2e/homepage.spec.ts`**

```ts
import { test, expect } from '@playwright/test';

test('homepage renders key sections', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: /420 AI-exaflops/i })).toBeVisible();
  await expect(page.getByRole('heading', { name: /Trajectory to 420/i })).toBeVisible();
  await expect(page.getByRole('heading', { name: /Where the UK sits/i })).toBeVisible();
  await expect(page.getByRole('heading', { name: /What 420 AI-exaflops could mean/i })).toBeVisible();
});

test('filter bar updates URL and facility count', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Flagship AI', exact: true }).click();
  await expect(page).toHaveURL(/category=flagship/);
  await expect(page.getByText(/Showing \d+ of \d+ facilities/)).toBeVisible();
});

test('list view opens detail panel', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('tab', { name: 'List' }).click();
  await page.getByRole('button', { name: /Isambard-AI/ }).first().click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(page.getByText('Read full profile')).toBeVisible();
});
```

- [ ] **Step 4: Write `tests/e2e/facility-page.spec.ts`**

```ts
import { test, expect } from '@playwright/test';

test('Isambard-AI facility page renders expected sections', async ({ page }) => {
  await page.goto('/facilities/isambard-ai');
  await expect(page.getByRole('heading', { name: 'Isambard-AI' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'At a glance' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Overview' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Hardware & performance' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Access & eligibility' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Sources' })).toBeVisible();
});
```

- [ ] **Step 5: Run e2e tests**

Run: `npm run test:e2e`
Expected: all tests PASS.

- [ ] **Step 6: Commit**

```bash
git add playwright.config.ts tests/e2e
git commit -m "test(e2e): homepage + facility page smoke coverage"
```

---

## Task 18: CI Data Validation + Build Gate

**Files:**
- Create: `.github/workflows/ci.yml`

- [ ] **Step 1: Write `.github/workflows/ci.yml`**

```yaml
name: CI
on: [push, pull_request]
jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with: { lfs: true }
      - uses: actions/setup-node@v4
        with: { node-version: '20', cache: 'npm' }
      - run: npm ci
      - run: npm run validate
      - run: npx astro check
      - run: npm test
      - run: npm run build
      - uses: actions/upload-artifact@v4
        with: { name: dist, path: dist }
```

- [ ] **Step 2: Commit**

```bash
git add .github/workflows/ci.yml
git commit -m "ci: validate data, type-check, unit-test, and build on PR"
```

---

## Task 19: Cloudflare Pages Deployment + Analytics

**Files:**
- Modify: `src/layouts/Base.astro` (add Cloudflare Web Analytics beacon)
- Create: `wrangler.toml` (optional, for `wrangler pages deploy`)
- Create: `docs/DEPLOY.md`

- [ ] **Step 1: Add Cloudflare Web Analytics beacon to `Base.astro`**

Insert before `</body>`:

```astro
<script defer src="https://static.cloudflareinsights.com/beacon.min.js"
  data-cf-beacon='{"token": "REPLACE_WITH_TOKEN"}'></script>
```

The actual token is obtained after setting up the site on Cloudflare; leave the placeholder for now, document the replacement step.

- [ ] **Step 2: Write `docs/DEPLOY.md`**

```markdown
# Deploy to Cloudflare Pages

## First-time setup
1. Create a Cloudflare account; add the repo to **Pages**.
2. Framework preset: **Astro**. Build command: `npm run build`. Output: `dist`.
3. Environment: Node 20.
4. Under **Web Analytics**, enable automatic beacon for the Pages site. Copy the token.
5. Replace `REPLACE_WITH_TOKEN` in `src/layouts/Base.astro` with the token.
6. Commit & push. Cloudflare auto-deploys on push to `main`.

## PMTiles hosting
`public/tiles/uk.pmtiles` is bundled as a static asset and served from the Pages CDN. No separate tile server required.

## Custom domain
Add a custom domain under **Pages → Custom domains** when ready. Until then the site is at `<project>.pages.dev`.
```

- [ ] **Step 3: Commit**

```bash
git add src/layouts/Base.astro docs/DEPLOY.md
git commit -m "chore(deploy): CF Pages deploy docs + analytics beacon"
```

---

## Task 20: Final Self-Check + README

**Files:**
- Create: `README.md`

- [ ] **Step 1: Write `README.md`**

```markdown
# UK Public-Sector AI Compute Map

An interactive, policy-oriented map of the UK's publicly funded AI compute infrastructure. Built from the UK Compute Roadmap and operator disclosures.

## Stack
Astro · React islands · MapLibre GL + Protomaps PMTiles · Recharts · Tailwind · Zod · TypeScript · Cloudflare Pages.

## Scripts
- `npm run dev` — local dev server
- `npm run build` — static build into `dist/`
- `npm run validate` — Zod-validate every facility JSON
- `npm test` — unit tests (Vitest)
- `npm run test:e2e` — Playwright smoke tests

## Adding or editing a facility
1. Edit/add a file under `src/data/facilities/<slug>.json`.
2. Run `npm run validate` — build fails on schema drift.
3. Commit — CF Pages auto-deploys.

## Deployment
See `docs/DEPLOY.md`.
```

- [ ] **Step 2: Full local verification**

Run in order:
```bash
npm run validate
npx astro check
npm test
npm run build
npm run test:e2e
```
All expected to pass.

- [ ] **Step 3: Manual review pass**

Open `npm run preview` and check:
- Filters update the URL and the map.
- Clicking a pin opens the panel; Esc closes it.
- Every facility page loads and has all six sections.
- The trajectory chart's 420 target line is visible.
- The country bar chart shows the UK near the bottom of the list.
- The list-view toggle renders all filtered facilities as cards.
- Keyboard: Tab cycles through filter chips; Enter toggles; chips have visible focus rings.

- [ ] **Step 4: Commit**

```bash
git add README.md
git commit -m "docs: project README"
```

---

## Self-Review

**1. Spec coverage against locked decisions:**

| Decision | Task(s) |
|---|---|
| Policy/strategic audience framing | Hero copy (Task 14), translations (Task 7, 14) |
| Lightweight country benchmark | Task 7 (data), Task 13 (chart) |
| "What 420 exaflops means" | Task 7 (data), Task 14 (grid) |
| Status badges with muted planned | Task 9 (STATUS_OPACITY) |
| Capacity-over-time chart with 420 target | Task 6 (series), Task 13 (chart) |
| 5 categories | Task 2 (schema), Task 9 (colours), Task 14 (hero) |
| Primary + advanced filters | Task 5 (logic), Task 10 (UI) |
| Detail panel with 6 zones | Task 11 |
| Standalone per-facility pages | Task 16 |
| Astro + MapLibre + Recharts + Protomaps | Tasks 1, 8, 9, 13 |
| Institution-level pins + clustering + HQ-pin + per-DiRAC | Task 4 (data), Task 9 (clustering) |
| Light palette, abstract UK map | Task 1 (tailwind), Task 9 (style layers) |
| Page structure order | Task 15 |
| JSON per facility + Zod schema | Tasks 2, 3, 4 |
| Nation + ITL1 dual store | Task 2 (schema has both) |
| Trajectory plots only quantified facilities | Task 6 (filter) + Task 13 (disclaimer) |
| Cloudflare Pages + CF Analytics | Task 19 |
| Private repo / default subdomain | Deploy doc (Task 19) |
| WCAG AA + list-view toggle | Task 12 (list), Task 10 (aria-pressed), Task 11 (Esc + focus) |
| Git-derived last-updated | Task 15 (execSync git log) |
| Shareable filtered URLs | Task 5 (serialisation), Task 10 (replaceState) |
| v1 exclusions (no timeline slider, no dark mode, no search, images schema-ready) | Honoured across plan; `image` field in schema (Task 2) |

All locked decisions map to at least one task. No gaps.

**2. Placeholder scan:** No "TBD", "implement later", "handle edge cases", "similar to Task N" placeholders. Every code step has a concrete code block. Task 4 is inherently content-heavy (20 JSONs from the PDF); a template is provided, and the data validator enforces completeness so the engineer can't accidentally under-populate.

**3. Type consistency:** `FacilitySchema`/`Facility` used consistently across tasks. `FilterState` shape matches between `applyFilters`, `filtersFromSearchParams`, and `FilterBar`. `TARGET_2030_EXAFLOPS` exported from `trajectory.ts` and imported both by the chart (Task 13) and the hero stats (Task 15). `CategoryPill`/`StatusBadge` signatures match their usage in panel, list, and facility page. `MapView` props (`facilities`, `onSelect`, `selectedSlug`) match `MapExplorer` invocation.

Plan is complete.

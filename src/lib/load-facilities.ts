import { readdir, readFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';

import { FacilitySchema, type Facility } from '../data/schema.ts';

const DATA_DIR = resolve(process.cwd(), 'src/data/facilities');

export async function loadFacilities(dataDir = DATA_DIR): Promise<Facility[]> {
  const files = (await readdir(dataDir))
    .filter((file) => file.endsWith('.json'))
    .sort((left, right) => left.localeCompare(right));

  const facilities: Facility[] = [];

  for (const file of files) {
    const raw = await readFile(join(dataDir, file), 'utf8');
    const parsed = JSON.parse(raw) as unknown;
    const result = FacilitySchema.safeParse(parsed);

    if (!result.success) {
      throw new Error(`Invalid facility data in ${file}:\n${result.error.toString()}`);
    }

    const expectedSlug = file.replace(/\.json$/, '');
    if (result.data.slug !== expectedSlug) {
      throw new Error(
        `Slug "${result.data.slug}" does not match filename "${file}"`,
      );
    }

    facilities.push(result.data);
  }

  const uniqueSlugs = new Set<string>();
  for (const facility of facilities) {
    if (uniqueSlugs.has(facility.slug)) {
      throw new Error(`Duplicate facility slug: ${facility.slug}`);
    }

    uniqueSlugs.add(facility.slug);
  }

  return facilities.sort((left, right) => left.name.localeCompare(right.name));
}

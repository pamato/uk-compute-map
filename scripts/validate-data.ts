import { loadFacilities } from '../src/lib/load-facilities.ts';

async function main() {
  const facilities = await loadFacilities();
  console.log(`Validated ${facilities.length} facilities.`);
}

main().catch((error) => {
  console.error('Data validation failed.\n', error);
  process.exit(1);
});

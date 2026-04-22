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
    note: 'Frontier, Aurora, and NAIRR-linked public compute put the US at a much larger public AI scale.',
    source: 'ORNL, ALCF, and national programme disclosures',
  },
  {
    country: 'China',
    iso2: 'CN',
    publicAiExaflops: 1500,
    note: 'Indicative estimate based on public national AI-supercomputing reporting and large state-backed systems.',
    source: 'Public national reporting and Top500-era disclosures',
  },
  {
    country: 'Japan',
    iso2: 'JP',
    publicAiExaflops: 600,
    note: 'Driven by ABCI-era public AI systems and national research facilities.',
    source: 'AIST and related public research disclosures',
  },
  {
    country: 'Germany',
    iso2: 'DE',
    publicAiExaflops: 220,
    note: 'Includes EuroHPC-linked and Gauss Centre AI capacity at public institutions.',
    source: 'EuroHPC JU and national lab announcements',
  },
  {
    country: 'France',
    iso2: 'FR',
    publicAiExaflops: 180,
    note: 'Public AI compute led by Jean Zay upgrades and wider EuroHPC contributions.',
    source: 'GENCI and EuroHPC JU disclosures',
  },
  {
    country: 'United Kingdom',
    iso2: 'GB',
    publicAiExaflops: 22,
    note: 'Current quantified core is Isambard-AI (~21) plus Dawn (~1), with a 420 target for 2030.',
    source: 'UK Compute Roadmap and AIRR facility disclosures',
  },
];

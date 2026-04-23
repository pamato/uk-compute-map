export interface CountryDatum {
  country: string;
  iso2: string;
  publicAiExaflops: number;
  scope: string;
  method: string;
  note: string;
  source: string;
  sourceUrl?: string;
  caveat?: string;
}

// Methodology notes:
// - UK current values use published facility AI-exaflops figures from the AIRR
//   disclosures already represented in the facility data.
// - US / China frontier data-centre values use Epoch AI's "Current H100
//   equivalents" field from its Frontier Data Centers dataset. We convert H100
//   equivalents to peak FP8 AI-exaflops using NVIDIA's H100 SXM FP8 Tensor Core
//   specification: 3,958 teraFLOPS per H100 SXM (with sparsity).
// - These are peak-equivalent hardware estimates, not achieved utilisation, not
//   public-access allocations, and not directly comparable with the UK's public
//   research-compute number. The point is order-of-magnitude context.
export const H100_SXM_FP8_TFLOPS_WITH_SPARSITY = 3_958;
export const US_EPOCH_FRONTIER_H100_EQUIVALENTS = 4_146_373.2306463514;
export const CHINA_EPOCH_FRONTIER_H100_EQUIVALENTS = 132_895.40171803941;

function h100EquivalentsToAiExaflops(h100Equivalents: number): number {
  return Math.round(
    (h100Equivalents * H100_SXM_FP8_TFLOPS_WITH_SPARSITY) / 1_000_000,
  );
}

export const COUNTRY_BENCHMARK: CountryDatum[] = [
  {
    country: 'United States',
    iso2: 'US',
    publicAiExaflops: h100EquivalentsToAiExaflops(
      US_EPOCH_FRONTIER_H100_EQUIVALENTS,
    ),
    scope: 'Epoch-tracked frontier data centres',
    method:
      '4.146m current H100-equivalents × 3,958 TFLOPS FP8 per H100 SXM ÷ 1e6',
    note:
      'This is a frontier data-centre hardware estimate, dominated by hyperscale and frontier-lab infrastructure. It is not a public-access research-compute allocation.',
    source: 'Epoch AI Frontier Data Centers dataset; NVIDIA H100 specifications',
    sourceUrl: 'https://epoch.ai/data/data-centers',
    caveat:
      'Not directly comparable with UK public AIRR access; useful as an order-of-magnitude strategic capacity contrast.',
  },
  {
    country: 'China',
    iso2: 'CN',
    publicAiExaflops: h100EquivalentsToAiExaflops(
      CHINA_EPOCH_FRONTIER_H100_EQUIVALENTS,
    ),
    scope: 'Epoch-tracked frontier data centres',
    method:
      '132,895 current H100-equivalents × 3,958 TFLOPS FP8 per H100 SXM ÷ 1e6',
    note:
      'Epoch currently tracks Alibaba Zhangbei in China in the local dataset; this should not be read as a comprehensive national total.',
    source: 'Epoch AI Frontier Data Centers dataset; NVIDIA H100 specifications',
    sourceUrl: 'https://epoch.ai/data/data-centers',
    caveat: 'Likely incomplete as a national estimate.',
  },
  {
    country: 'United Kingdom',
    iso2: 'GB',
    publicAiExaflops: 22,
    scope: 'Published public AI research compute',
    method: 'Isambard-AI (~21 AI-exaflops) + Dawn (~1 AI-exaflop)',
    note:
      'This is the currently quantified public AI compute core represented in AIRR disclosures. Other UK systems appear on the map but are not assigned AI-exaflops without published figures.',
    source: 'UK Compute Roadmap; UKRI/AIRR facility disclosures',
    sourceUrl:
      'https://www.gov.uk/government/publications/uk-compute-roadmap/uk-compute-roadmap',
    caveat:
      'Public-access research compute, not total private or hyperscale UK AI infrastructure.',
  },
  {
    country: 'United Kingdom 2030 target',
    iso2: 'GB-2030',
    publicAiExaflops: 420,
    scope: 'Government target, not current capacity',
    method: 'UK Compute Roadmap target for AI research and innovation compute',
    note:
      'Included to show the scale of the stated UK ambition against current quantified public capacity and frontier data-centre estimates elsewhere.',
    source: 'UK Compute Roadmap',
    sourceUrl:
      'https://www.gov.uk/government/publications/uk-compute-roadmap/uk-compute-roadmap',
    caveat: 'Future target, not deployed capacity.',
  },
];

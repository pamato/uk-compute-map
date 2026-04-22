export interface TranslationCard {
  title: string;
  body: string;
  source: string;
}

export const TRANSLATIONS: TranslationCard[] = [
  {
    title: 'Forecasts trained once, then used everywhere',
    body: 'Dawn already supports IceNet, a sea-ice forecasting model that can run on a laptop after training. At 420 AI-exaflops, the UK could train many more national forecasting models for weather, oceans, and biodiversity instead of treating each as a one-off.',
    source: 'UK AI compute mapping PDF, section 6.4',
  },
  {
    title: 'Medical imaging models can move from pilot to service',
    body: 'Cambridge researchers use Dawn to train a kidney-cancer screening model. More sovereign AI compute means more room to iterate, validate, and serve models across multiple NHS pathways rather than only a small number of pilots.',
    source: 'UK AI compute mapping PDF, section 6.4',
  },
  {
    title: 'Petabyte-scale environmental policy becomes routine',
    body: 'JASMIN combines storage, high-memory nodes, and GPU partitions to analyse huge environmental datasets. More national AI capacity would make weekly risk modelling for flood, heat, crop, and ecosystem policy easier to sustain.',
    source: 'UK AI compute mapping PDF, sections 2.6 and 6.4',
  },
  {
    title: 'Public services can keep inference on shore',
    body: 'The AIRR already gives the UK a sovereign inference base for public research and start-ups. Reaching 420 AI-exaflops would make it more realistic to run multiple major departmental and public-service models domestically instead of leaning on foreign cloud capacity.',
    source: 'UK AI compute mapping PDF, introduction and conclusion',
  },
];

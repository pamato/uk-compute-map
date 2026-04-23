import type { Category, Facility, Status } from '../data/schema';

interface FacilityDisplayConfig {
  institution?: string;
  title?: string;
  variant?: string;
  tabLabel?: string;
  hoverLabel?: string;
}

const FACILITY_DISPLAY: Record<string, FacilityDisplayConfig> = {
  archer2: {
    title: 'ARCHER2',
    tabLabel: 'ARCHER2',
    hoverLabel: 'ARCHER2',
  },
  awe: {
    title: 'AWE',
    tabLabel: 'AWE',
    hoverLabel: 'AWE',
  },
  bede: {
    institution: 'Durham University',
    title: 'Bede',
    tabLabel: 'Bede',
    hoverLabel: 'Bede',
  },
  cirrus: {
    title: 'Cirrus',
    tabLabel: 'Cirrus',
    hoverLabel: 'Cirrus',
  },
  csd3: {
    title: 'CSD3',
    tabLabel: 'CSD3',
    hoverLabel: 'CSD3',
  },
  dawn: {
    title: 'Dawn',
    tabLabel: 'Dawn',
    hoverLabel: 'Dawn',
  },
  'dirac-csd3': {
    title: 'DiRAC CSD3',
    variant: 'Data-intensive service',
    tabLabel: 'DiRAC CSD3',
    hoverLabel: 'DiRAC CSD3',
  },
  'dirac-durham': {
    title: 'DiRAC Durham',
    variant: 'Memory-intensive service',
    tabLabel: 'DiRAC Durham',
    hoverLabel: 'DiRAC Durham',
  },
  'dirac-leicester': {
    title: 'DiRAC Leicester',
    variant: 'Data-intensive service',
    tabLabel: 'DiRAC Leicester',
    hoverLabel: 'DiRAC Leicester',
  },
  'dirac-tursa': {
    title: 'DiRAC Tursa',
    variant: 'Extreme scaling service',
    tabLabel: 'DiRAC Tursa',
    hoverLabel: 'DiRAC Tursa',
  },
  eidf: {
    title: 'EIDF',
    tabLabel: 'EIDF',
    hoverLabel: 'EIDF',
  },
  'epcc-national': {
    title: 'Planned National Supercomputer',
    tabLabel: 'National Supercomputer',
    hoverLabel: 'National Supercomputer',
  },
  'gridpp-ral': {
    title: 'GridPP',
    variant: 'Tier-1 at RAL',
    tabLabel: 'GridPP',
    hoverLabel: 'GridPP',
  },
  iris: {
    institution: 'STFC',
    title: 'IRIS',
    variant: 'Federated infrastructure',
    tabLabel: 'IRIS',
    hoverLabel: 'IRIS',
  },
  'isambard-3': {
    title: 'Isambard 3',
    tabLabel: 'Isambard 3',
    hoverLabel: 'Isambard 3',
  },
  'isambard-ai': {
    title: 'Isambard-AI',
    tabLabel: 'Isambard-AI',
    hoverLabel: 'Isambard-AI',
  },
  jasmin: {
    title: 'JASMIN',
    tabLabel: 'JASMIN',
    hoverLabel: 'JASMIN',
  },
  'kelvin-2': {
    title: 'Kelvin-2',
    tabLabel: 'Kelvin-2',
    hoverLabel: 'Kelvin-2',
  },
  'mary-coombs': {
    title: 'Mary Coombs',
    tabLabel: 'Mary Coombs',
    hoverLabel: 'Mary Coombs',
  },
  'met-office': {
    title: 'Met Office',
    variant: 'Cloud supercomputer',
    tabLabel: 'Met Office',
    hoverLabel: 'Met Office',
  },
  sunrise: {
    title: 'Sunrise',
    tabLabel: 'Sunrise',
    hoverLabel: 'Sunrise',
  },
  'young-mmm': {
    title: 'Young',
    variant: 'MMM Hub facility',
    tabLabel: 'Young',
    hoverLabel: 'Young',
  },
};

export function formatExaflops(value: number | null): string {
  if (value === null) {
    return 'Not comparable';
  }

  if (Number.isInteger(value)) {
    return `${value} AI-exaflops`;
  }

  return `${value.toFixed(1)} AI-exaflops`;
}

export function formatYearMonth(value: string | null): string {
  if (!value) {
    return '—';
  }

  const [year, month] = value.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, 1));

  return date.toLocaleDateString('en-GB', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

const STATUS_LABELS: Record<Status, string> = {
  operational: 'Operational',
  upgrading: 'Upgrading',
  planned: 'Planned',
  decommissioned: 'Decommissioned',
};

const CATEGORY_LABELS: Record<Category, string> = {
  flagship: 'Flagship AI supercomputer',
  backbone: 'National HPC backbone',
  specialist: 'Specialist AI & data platform',
  regional: 'Regional research system',
  mission: 'Mission-specific compute',
};

export function statusLabel(status: Status): string {
  return STATUS_LABELS[status];
}

export function categoryLabel(category: Category): string {
  return CATEGORY_LABELS[category];
}

export function facilityDisplayName(facility: Facility): string {
  return FACILITY_DISPLAY[facility.slug]?.title ?? facility.name;
}

export function facilityDisplayVariant(facility: Facility): string | null {
  return FACILITY_DISPLAY[facility.slug]?.variant ?? null;
}

export function facilityTabLabel(facility: Facility): string {
  return FACILITY_DISPLAY[facility.slug]?.tabLabel ?? facilityDisplayName(facility);
}

export function facilityHoverLabel(facility: Facility): string {
  return FACILITY_DISPLAY[facility.slug]?.hoverLabel ?? facilityDisplayName(facility);
}

export function facilityDisplayInstitution(facility: Facility): string {
  return (
    FACILITY_DISPLAY[facility.slug]?.institution ??
    facility.location.institution.replace(/\s*\([^)]*\)$/, '')
  );
}

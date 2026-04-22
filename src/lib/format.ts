import type { Category, Status } from '../data/schema';

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

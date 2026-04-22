import type { Status } from '../data/schema';
import { statusLabel } from '../lib/format';

const STATUS_CLASS: Record<Status, string> = {
  operational: 'border-status-operational/30 bg-status-operational/10 text-status-operational',
  upgrading: 'border-status-upgrading/30 bg-status-upgrading/10 text-status-upgrading',
  planned: 'border-status-planned/30 bg-status-planned/10 text-stone-600',
  decommissioned:
    'border-status-decommissioned/30 bg-status-decommissioned/10 text-stone-500',
};

export function StatusBadge({ status }: { status: Status }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${STATUS_CLASS[status]}`}
    >
      {statusLabel(status)}
    </span>
  );
}

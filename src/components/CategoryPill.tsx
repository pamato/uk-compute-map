import type { Category } from '../data/schema';
import { categoryLabel } from '../lib/format';

const CATEGORY_CLASS: Record<Category, string> = {
  flagship: 'bg-category-flagship text-white',
  backbone: 'bg-category-backbone text-white',
  specialist: 'bg-category-specialist text-white',
  regional: 'bg-category-regional text-white',
  mission: 'bg-category-mission text-white',
};

export function CategoryPill({ category }: { category: Category }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] ${CATEGORY_CLASS[category]}`}
    >
      {categoryLabel(category)}
    </span>
  );
}

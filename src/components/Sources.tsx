import type { Facility } from '../data/schema';

export function Sources({ sources }: { sources: Facility['sources'] }) {
  return (
    <ul className="space-y-2 text-sm text-stone-700">
      {sources.map((source) => (
        <li key={source.url}>
          <a
            className="underline decoration-stone-400 underline-offset-4 transition hover:text-ink hover:decoration-ink"
            href={source.url}
            rel="noreferrer"
            target="_blank"
          >
            {source.label}
          </a>
        </li>
      ))}
    </ul>
  );
}

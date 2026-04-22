import { COUNTRY_BENCHMARK } from '../data/countries';

export function CountryBenchmark() {
  const countries = [...COUNTRY_BENCHMARK].sort(
    (left, right) => right.publicAiExaflops - left.publicAiExaflops,
  );
  const maxValue = countries[0]?.publicAiExaflops ?? 1;

  return (
    <div className="rounded-[2rem] border border-stone-300 bg-white p-6 shadow-[0_28px_60px_-40px_rgba(20,20,20,0.5)]">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
            International context
          </p>
          <h2 className="mt-2 font-serif text-3xl">Where the UK sits</h2>
        </div>
        <p className="max-w-xl text-sm text-stone-600">
          These are indicative public-access AI compute estimates, intended to
          show order of magnitude rather than produce a strict ranking.
        </p>
      </div>

      <ol className="mt-8 space-y-4">
        {countries.map((country) => {
          const width = Math.max(
            8,
            (country.publicAiExaflops / maxValue) * 100,
          );

          return (
            <li key={country.iso2}>
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="font-serif text-xl">{country.country}</p>
                  <p className="mt-1 text-sm text-stone-600">{country.note}</p>
                </div>
                <p className="text-sm font-semibold text-stone-700">
                  {country.publicAiExaflops} AI-exaflops
                </p>
              </div>
              <div className="mt-3 h-3 rounded-full bg-stone-200">
                <div
                  className={`h-full rounded-full ${
                    country.iso2 === 'GB'
                      ? 'bg-category-flagship'
                      : 'bg-stone-700'
                  }`}
                  style={{ width: `${width}%` }}
                />
              </div>
              <p className="mt-2 text-xs uppercase tracking-[0.16em] text-stone-500">
                Source: {country.source}
              </p>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

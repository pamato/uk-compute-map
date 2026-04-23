import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { COUNTRY_BENCHMARK } from '../data/countries';

export function CountryBenchmark() {
  const countries = [...COUNTRY_BENCHMARK].sort(
    (left, right) => right.publicAiExaflops - left.publicAiExaflops,
  );

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
          These bars now use explicit source scopes. The US and China rows are
          Epoch AI frontier data-centre estimates converted from H100-equivalent
          hardware; the UK row is published public AIRR capacity.
        </p>
      </div>

      <div className="mt-8">
        <ResponsiveContainer height={320} width="100%">
          <BarChart
            data={countries}
            layout="vertical"
            margin={{ top: 8, right: 36, bottom: 8, left: 120 }}
          >
            <CartesianGrid
              horizontal={false}
              stroke="#e7dfd0"
              strokeDasharray="4 6"
            />
            <XAxis
              axisLine={false}
              tick={{ fill: '#5b5246', fontSize: 12 }}
              tickLine={false}
              type="number"
            />
            <YAxis
              axisLine={false}
              dataKey="country"
              tick={{ fill: '#5b5246', fontSize: 12 }}
              tickLine={false}
              type="category"
              width={150}
            />
            <Tooltip
              contentStyle={{
                border: '1px solid #d6cfc3',
                borderRadius: '16px',
                boxShadow: '0 16px 40px -24px rgba(20,20,20,0.45)',
              }}
              formatter={(value) => [
                `${value ?? 0} AI-exaflops`,
                'Peak-equivalent estimate',
              ]}
              labelFormatter={(label) => label}
            />
            <Bar dataKey="publicAiExaflops" radius={[0, 6, 6, 0]}>
              <LabelList
                dataKey="publicAiExaflops"
                fill="#5b5246"
                fontSize={12}
                position="right"
              />
              {countries.map((country) => (
                <Cell
                  fill={
                    country.iso2 === 'GB'
                      ? '#1f4e79'
                      : country.iso2 === 'GB-2030'
                        ? '#8c3a3a'
                        : '#5b5246'
                  }
                  key={country.iso2}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <ul className="mt-5 space-y-2 text-sm text-stone-600">
        {countries.map((country) => (
          <li key={country.iso2}>
            <span className="font-medium text-stone-800">{country.country}:</span>{' '}
            <span>{country.scope}. </span>
            <span>{country.method}. </span>
            <span>{country.note}</span>{' '}
            <span className="text-stone-500">
              (Source:{' '}
              {country.sourceUrl ? (
                <a
                  className="underline decoration-stone-400 underline-offset-4 hover:text-ink"
                  href={country.sourceUrl}
                  rel="noreferrer"
                  target="_blank"
                >
                  {country.source}
                </a>
              ) : (
                country.source
              )}
              )
            </span>
            {country.caveat ? (
              <span className="block text-xs text-stone-500">{country.caveat}</span>
            ) : null}
          </li>
        ))}
      </ul>

      <p className="mt-5 rounded-2xl border border-amber-200 bg-amber-50/70 p-4 text-sm leading-relaxed text-stone-700">
        Methodology caution: the US and China bars are peak-equivalent hardware
        estimates for frontier data centres, while the UK current bar is
        published public research-compute capacity. They are shown together to
        convey order of magnitude, not as like-for-like national public access
        totals.
      </p>
    </div>
  );
}

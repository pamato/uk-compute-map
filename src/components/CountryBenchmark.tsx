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
          These are indicative public-access AI compute estimates, intended to
          show order of magnitude rather than produce a strict ranking.
        </p>
      </div>

      <div className="mt-8">
        <ResponsiveContainer height={320} width="100%">
          <BarChart
            data={countries}
            layout="vertical"
            margin={{ top: 8, right: 36, bottom: 8, left: 68 }}
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
              width={100}
            />
            <Tooltip
              contentStyle={{
                border: '1px solid #d6cfc3',
                borderRadius: '16px',
                boxShadow: '0 16px 40px -24px rgba(20,20,20,0.45)',
              }}
              formatter={(value) => [
                `${value ?? 0} AI-exaflops`,
                'Estimate',
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
                  fill={country.iso2 === 'GB' ? '#1f4e79' : '#5b5246'}
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
            {country.note}{' '}
            <span className="text-stone-500">(Source: {country.source})</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

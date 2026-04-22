import {
  CartesianGrid,
  Label,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import type { Facility } from '../data/schema';
import {
  buildTrajectorySeries,
  TARGET_2030_EXAFLOPS,
} from '../lib/trajectory';

export function TrajectoryChart({ facilities }: { facilities: Facility[] }) {
  const series = buildTrajectorySeries(facilities, {
    startYear: 2020,
    endYear: 2030,
  });
  const current = series.at(-1)?.cumulative ?? 0;
  const quantified = facilities.filter(
    (facility) => facility.aiExaflops !== null,
  ).length;

  return (
    <div className="rounded-[2rem] border border-stone-300 bg-white p-6 shadow-[0_28px_60px_-40px_rgba(20,20,20,0.5)]">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
            Capacity trajectory
          </p>
          <h2 className="mt-2 font-serif text-3xl">
            Quantified progress toward 420 AI-exaflops
          </h2>
        </div>
        <div className="rounded-full border border-stone-300 px-4 py-2 text-sm text-stone-700">
          {current} of {TARGET_2030_EXAFLOPS} AI-exaflops · {quantified}{' '}
          facilities quantified
        </div>
      </div>

      <div className="mt-6">
        <ResponsiveContainer height={320} width="100%">
          <LineChart
            data={series}
            margin={{ top: 12, right: 24, bottom: 8, left: 8 }}
          >
            <CartesianGrid
              stroke="#e7dfd0"
              strokeDasharray="4 6"
              vertical={false}
            />
            <XAxis
              axisLine={false}
              dataKey="year"
              dy={8}
              tick={{ fill: '#5b5246', fontSize: 12 }}
              tickLine={false}
            />
            <YAxis
              axisLine={false}
              domain={[0, TARGET_2030_EXAFLOPS + 20]}
              tick={{ fill: '#5b5246', fontSize: 12 }}
              tickLine={false}
              width={44}
            />
            <Tooltip
              contentStyle={{
                border: '1px solid #d6cfc3',
                borderRadius: '16px',
                boxShadow: '0 16px 40px -24px rgba(20,20,20,0.45)',
              }}
              formatter={(value) => [
                `${value ?? 0} AI-exaflops`,
                'Cumulative',
              ]}
              labelFormatter={(label) => `Year ${label}`}
            />
            <ReferenceLine
              ifOverflow="extendDomain"
              stroke="#8c3a3a"
              strokeDasharray="6 6"
              strokeWidth={2}
              y={TARGET_2030_EXAFLOPS}
            >
              <Label
                fill="#8c3a3a"
                fontSize={12}
                position="insideTopRight"
                value="2030 target: 420"
              />
            </ReferenceLine>
            <Line
              activeDot={{ r: 7, stroke: '#ffffff', strokeWidth: 3 }}
              dataKey="cumulative"
              dot={{ r: 5, stroke: '#ffffff', strokeWidth: 2 }}
              stroke="#1f4e79"
              strokeWidth={4}
              type="monotone"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <p className="mt-4 text-sm leading-relaxed text-stone-600">
        The line includes only facilities with a published AI-exaflops figure.
        CPU-first systems and sites without disclosed AI-exaflops remain on the
        map, but not in this chart, to avoid presenting false comparability.
      </p>
    </div>
  );
}

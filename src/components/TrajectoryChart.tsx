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
  const chartWidth = 900;
  const chartHeight = 340;
  const padding = {
    top: 24,
    right: 48,
    bottom: 36,
    left: 60,
  };
  const maxValue = TARGET_2030_EXAFLOPS + 20;
  const stepX =
    (chartWidth - padding.left - padding.right) / Math.max(series.length - 1, 1);

  const points = series.map((point, index) => {
    const x = padding.left + index * stepX;
    const y =
      chartHeight -
      padding.bottom -
      (point.cumulative / maxValue) *
        (chartHeight - padding.top - padding.bottom);

    return { ...point, x, y };
  });

  const path = points
    .map((point, index) =>
      `${index === 0 ? 'M' : 'L'} ${point.x.toFixed(1)} ${point.y.toFixed(1)}`,
    )
    .join(' ');
  const targetY =
    chartHeight -
    padding.bottom -
    (TARGET_2030_EXAFLOPS / maxValue) *
      (chartHeight - padding.top - padding.bottom);

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
          Quantified today: {series.at(-1)?.cumulative ?? 0} AI-exaflops
        </div>
      </div>

      <div className="mt-6 overflow-x-auto">
        <svg
          aria-label="Trajectory to 420 AI-exaflops"
          className="min-w-[860px]"
          role="img"
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
        >
          {[0, 105, 210, 315, 420].map((tick) => {
            const y =
              chartHeight -
              padding.bottom -
              (tick / maxValue) *
                (chartHeight - padding.top - padding.bottom);

            return (
              <g key={tick}>
                <line
                  stroke="#e7dfd0"
                  strokeDasharray="4 6"
                  strokeWidth="1"
                  x1={padding.left}
                  x2={chartWidth - padding.right}
                  y1={y}
                  y2={y}
                />
                <text
                  fill="#736858"
                  fontSize="12"
                  textAnchor="end"
                  x={padding.left - 10}
                  y={y + 4}
                >
                  {tick}
                </text>
              </g>
            );
          })}

          <line
            stroke="#8c3a3a"
            strokeDasharray="8 8"
            strokeWidth="2"
            x1={padding.left}
            x2={chartWidth - padding.right}
            y1={targetY}
            y2={targetY}
          />
          <text
            fill="#8c3a3a"
            fontSize="12"
            textAnchor="end"
            x={chartWidth - padding.right}
            y={targetY - 8}
          >
            2030 target: 420
          </text>

          <path
            d={path}
            fill="none"
            stroke="#1f4e79"
            strokeWidth="4"
            strokeLinejoin="round"
            strokeLinecap="round"
          />

          {points.map((point) => (
            <g key={point.year}>
              <circle
                cx={point.x}
                cy={point.y}
                fill="#1f4e79"
                r="6"
                stroke="#fff"
                strokeWidth="3"
              />
              <text
                fill="#5b5246"
                fontSize="12"
                textAnchor="middle"
                x={point.x}
                y={chartHeight - 12}
              >
                {point.year}
              </text>
            </g>
          ))}
        </svg>
      </div>

      <p className="mt-4 text-sm leading-relaxed text-stone-600">
        The line includes only facilities with a published AI-exaflops figure.
        CPU-first systems and sites without disclosed AI-exaflops remain on the
        map, but not in this chart, to avoid presenting false comparability.
      </p>
    </div>
  );
}

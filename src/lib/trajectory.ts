import type { Facility } from '../data/schema';

export const TARGET_2030_EXAFLOPS = 420;

export interface TrajectoryPoint {
  year: number;
  cumulative: number;
  target: number | null;
}

export interface TrajectoryOptions {
  startYear: number;
  endYear: number;
}

export function buildTrajectorySeries(
  facilities: Facility[],
  options: TrajectoryOptions,
): TrajectoryPoint[] {
  const quantified = facilities.filter(
    (facility) =>
      facility.aiExaflops !== null &&
      facility.opened !== null &&
      (facility.status === 'operational' || facility.status === 'upgrading'),
  );

  const points: TrajectoryPoint[] = [];

  for (let year = options.startYear; year <= options.endYear; year += 1) {
    const cumulative = quantified
      .filter((facility) => Number(facility.opened?.slice(0, 4)) <= year)
      .reduce((sum, facility) => sum + (facility.aiExaflops ?? 0), 0);

    points.push({
      year,
      cumulative,
      target: year === 2030 ? TARGET_2030_EXAFLOPS : null,
    });
  }

  return points;
}

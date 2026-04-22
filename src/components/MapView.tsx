import type { Facility } from '../data/schema';

const MAP_BOUNDS = {
  minLon: -8.7,
  maxLon: 1.8,
  minLat: 49.8,
  maxLat: 60.9,
};

const CATEGORY_COLOR: Record<Facility['category'], string> = {
  flagship: '#1f4e79',
  backbone: '#2e7d5b',
  specialist: '#8b5e3c',
  regional: '#6a4c93',
  mission: '#8c3a3a',
};

const STATUS_OPACITY: Record<Facility['status'], number> = {
  operational: 1,
  upgrading: 0.9,
  planned: 0.42,
  decommissioned: 0.22,
};

export interface MapViewProps {
  facilities: Facility[];
  onSelect: (slug: string) => void;
  selectedSlug: string | null;
}

interface GroupedMarker {
  facilities: Facility[];
  x: number;
  y: number;
}

export function MapView({
  facilities,
  onSelect,
  selectedSlug,
}: MapViewProps) {
  const markers = buildMarkerGroups(facilities);

  return (
    <div className="overflow-hidden rounded-[2rem] border border-stone-300 bg-white shadow-[0_28px_60px_-40px_rgba(20,20,20,0.5)]">
      <div className="border-b border-stone-200 px-5 py-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-serif text-2xl">Where the infrastructure lives</h2>
            <p className="mt-1 text-sm text-stone-600">
              An abstract UK outline with institution-level points and simple
              clustering where multiple facilities share a host location.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 text-xs text-stone-600">
            {Object.entries(CATEGORY_COLOR).map(([category, color]) => (
              <span className="inline-flex items-center gap-2" key={category}>
                <span
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: color }}
                />
                <span className="capitalize">{category}</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="relative aspect-[10/11] bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.65),_rgba(255,255,255,0)),linear-gradient(180deg,#f7f2e8_0%,#ede4d5_46%,#e8efe7_100%)]">
        <svg
          aria-hidden="true"
          className="absolute inset-0 h-full w-full"
          viewBox="0 0 1000 1100"
        >
          <defs>
            <pattern
              height="80"
              id="grid"
              patternUnits="userSpaceOnUse"
              width="80"
            >
              <path
                d="M 80 0 L 0 0 0 80"
                fill="none"
                stroke="rgba(121, 108, 88, 0.14)"
                strokeWidth="1"
              />
            </pattern>
            <filter id="shadow">
              <feDropShadow
                dx="0"
                dy="14"
                floodColor="rgba(37,28,18,0.18)"
                stdDeviation="18"
              />
            </filter>
          </defs>

          <rect fill="url(#grid)" height="1100" opacity="0.45" width="1000" />

          <path
            d="M562 74 650 116 706 207 674 287 718 383 666 500 664 623 608 742 590 858 545 995 451 1042 370 1008 338 900 270 824 259 690 220 564 248 443 304 351 320 224 395 137 488 96Z"
            fill="#fdf8ef"
            filter="url(#shadow)"
            stroke="#cdbfaa"
            strokeWidth="4"
          />
          <path
            d="M188 488 236 510 252 563 226 603 182 615 145 584 146 533Z"
            fill="#fdf8ef"
            filter="url(#shadow)"
            stroke="#cdbfaa"
            strokeWidth="4"
          />
          <path
            d="M430 214 492 244 523 320 521 403 470 496 470 614 427 739"
            fill="none"
            opacity="0.55"
            stroke="#bcae97"
            strokeDasharray="18 14"
            strokeWidth="3"
          />
          <path
            d="M210 516 232 543 228 585"
            fill="none"
            opacity="0.55"
            stroke="#bcae97"
            strokeDasharray="10 10"
            strokeWidth="3"
          />
          <text
            fill="#847866"
            fontFamily="Georgia, serif"
            fontSize="26"
            x="500"
            y="214"
          >
            Scotland
          </text>
          <text
            fill="#847866"
            fontFamily="Georgia, serif"
            fontSize="24"
            x="470"
            y="600"
          >
            England
          </text>
          <text
            fill="#847866"
            fontFamily="Georgia, serif"
            fontSize="22"
            x="310"
            y="760"
          >
            Wales
          </text>
          <text
            fill="#847866"
            fontFamily="Georgia, serif"
            fontSize="22"
            x="82"
            y="652"
          >
            Northern Ireland
          </text>
        </svg>

        {markers.map((marker) => {
          const selectedInGroup = marker.facilities.some(
            (facility) => facility.slug === selectedSlug,
          );
          const activeFacility =
            marker.facilities.find((facility) => facility.slug === selectedSlug) ??
            marker.facilities[0];
          const color = CATEGORY_COLOR[activeFacility.category];
          const opacity = STATUS_OPACITY[activeFacility.status];

          return (
            <button
              aria-label={markerLabel(marker)}
              className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-white text-white shadow-lg transition hover:scale-105 focus:outline-none focus:ring-2 focus:ring-ink ${
                marker.facilities.length > 1 ? 'h-12 w-12 text-sm font-semibold' : 'h-6 w-6'
              } ${selectedInGroup ? 'ring-4 ring-ink/20' : ''}`}
              key={marker.facilities.map((facility) => facility.slug).join(',')}
              onClick={() => {
                const nextFacility =
                  marker.facilities.length === 1
                    ? marker.facilities[0]
                    : cycleGroup(marker.facilities, selectedSlug);

                onSelect(nextFacility.slug);
              }}
              style={{
                backgroundColor: color,
                left: `${marker.x}%`,
                opacity,
                top: `${marker.y}%`,
              }}
              type="button"
            >
              {marker.facilities.length > 1 ? marker.facilities.length : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function buildMarkerGroups(facilities: Facility[]): GroupedMarker[] {
  const groups: GroupedMarker[] = [];

  for (const facility of facilities) {
    const position = project(facility.location.lon, facility.location.lat);
    const existing = groups.find(
      (group) =>
        Math.abs(group.x - position.x) < 2 &&
        Math.abs(group.y - position.y) < 2,
    );

    if (existing) {
      existing.facilities.push(facility);
      existing.x = average(existing.x, position.x);
      existing.y = average(existing.y, position.y);
    } else {
      groups.push({
        facilities: [facility],
        x: position.x,
        y: position.y,
      });
    }
  }

  return groups;
}

function cycleGroup(facilities: Facility[], selectedSlug: string | null) {
  const currentIndex = facilities.findIndex(
    (facility) => facility.slug === selectedSlug,
  );

  if (currentIndex === -1) {
    return facilities[0];
  }

  return facilities[(currentIndex + 1) % facilities.length];
}

function markerLabel(marker: GroupedMarker) {
  if (marker.facilities.length === 1) {
    return marker.facilities[0].name;
  }

  return `${marker.facilities.length} facilities at this location: ${marker.facilities
    .map((facility) => facility.name)
    .join(', ')}`;
}

function project(lon: number, lat: number) {
  const x =
    8 +
    ((lon - MAP_BOUNDS.minLon) / (MAP_BOUNDS.maxLon - MAP_BOUNDS.minLon)) * 84;
  const y =
    7 +
    (1 -
      (lat - MAP_BOUNDS.minLat) /
        (MAP_BOUNDS.maxLat - MAP_BOUNDS.minLat)) *
      86;

  return { x, y };
}

function average(left: number, right: number) {
  return (left + right) / 2;
}

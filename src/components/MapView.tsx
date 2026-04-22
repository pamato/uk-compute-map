import { useEffect, useMemo, useRef, type RefObject } from 'react';
import maplibregl, { type StyleSpecification } from 'maplibre-gl';
import { Protocol } from 'pmtiles';
import { layers, namedTheme } from 'protomaps-themes-base';

import 'maplibre-gl/dist/maplibre-gl.css';

import type { Facility } from '../data/schema';

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

const TILE_URL =
  'pmtiles://https://pub-7ae8668c44db4038a591a0f077bfb1ad.r2.dev/uk.pmtiles';
const MAP_CENTRE: [number, number] = [-3.5, 54.5];
const MAP_MAX_BOUNDS: [[number, number], [number, number]] = [
  [-11, 49],
  [2.5, 61],
];
const INITIAL_ZOOM = 5.3;
const MIN_ZOOM = 4.5;
const MAX_ZOOM = 10;
// Screen-space clustering threshold, in pixels. Markers closer than this at
// INITIAL_ZOOM are grouped into a single cluster button, matching the
// behaviour of the previous SVG implementation where co-located host
// institutions (e.g. Cambridge: CSD3 + DiRAC-CSD3 + Dawn) collapsed.
const CLUSTER_THRESHOLD_PX = 24;

let protocolRegistered = false;

function ensurePmtilesProtocol() {
  if (protocolRegistered) return;
  const protocol = new Protocol();
  maplibregl.addProtocol('pmtiles', protocol.tile);
  protocolRegistered = true;
}

export interface MapViewProps {
  facilities: Facility[];
  onSelect: (slug: string) => void;
  selectedSlug: string | null;
}

interface GroupedMarker {
  facilities: Facility[];
  lon: number;
  lat: number;
}

export function MapView({
  facilities,
  onSelect,
  selectedSlug,
}: MapViewProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markerRefs = useRef<maplibregl.Marker[]>([]);
  // onSelect / selectedSlug can change on every render (parent state), but
  // we want a single map instance. Keep the latest closures in refs so the
  // marker click handler always sees current state without tearing down the
  // map.
  const onSelectRef = useRef(onSelect);
  const selectedSlugRef = useRef(selectedSlug);
  onSelectRef.current = onSelect;
  selectedSlugRef.current = selectedSlug;

  const markerGroups = useMemo(
    () => buildMarkerGroups(facilities),
    [facilities],
  );

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    ensurePmtilesProtocol();

    const theme = namedTheme('light');
    const style: StyleSpecification = {
      version: 8,
      glyphs:
        'https://protomaps.github.io/basemaps-assets/fonts/{fontstack}/{range}.pbf',
      sprite:
        'https://protomaps.github.io/basemaps-assets/sprites/v4/light',
      sources: {
        protomaps: {
          type: 'vector',
          url: TILE_URL,
          attribution:
            '<a href="https://protomaps.com" target="_blank" rel="noopener">Protomaps</a> &copy; <a href="https://openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a>',
        },
      },
      layers: layers('protomaps', theme, { lang: 'en' }),
    };

    const map = new maplibregl.Map({
      container: containerRef.current,
      style,
      center: MAP_CENTRE,
      zoom: INITIAL_ZOOM,
      minZoom: MIN_ZOOM,
      maxZoom: MAX_ZOOM,
      maxBounds: MAP_MAX_BOUNDS,
      dragRotate: false,
      pitchWithRotate: false,
      touchPitch: false,
      attributionControl: { compact: true },
    });

    map.touchZoomRotate.disableRotation();
    map.keyboard.disableRotation();
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');

    mapRef.current = map;

    return () => {
      markerRefs.current.forEach((marker) => marker.remove());
      markerRefs.current = [];
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Render / re-render markers whenever the filtered facility set changes.
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const renderMarkers = () => {
      markerRefs.current.forEach((marker) => marker.remove());
      markerRefs.current = markerGroups.map((group) =>
        createMarker(group, map, onSelectRef, selectedSlugRef),
      );
      // Apply selected-state styling on first paint.
      syncSelectionStyling(markerRefs.current, markerGroups, selectedSlugRef.current);
    };

    if (map.isStyleLoaded()) {
      renderMarkers();
    } else {
      map.once('load', renderMarkers);
    }

    return () => {
      map.off('load', renderMarkers);
    };
  }, [markerGroups]);

  // When the selected slug changes, refresh styling without rebuilding the
  // marker DOM nodes (avoids flicker).
  useEffect(() => {
    syncSelectionStyling(markerRefs.current, markerGroups, selectedSlug);
  }, [markerGroups, selectedSlug]);

  return (
    <div className="overflow-hidden rounded-[2rem] border border-stone-300 bg-white shadow-[0_28px_60px_-40px_rgba(20,20,20,0.5)]">
      <div className="border-b border-stone-200 px-5 py-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-serif text-2xl">Where the infrastructure lives</h2>
            <p className="mt-1 text-sm text-stone-600">
              An interactive UK basemap with institution-level points and
              simple clustering where multiple facilities share a host
              location.
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

      <div
        aria-label="Interactive UK compute infrastructure map"
        className="relative aspect-[10/11] w-full bg-[linear-gradient(180deg,#f7f2e8_0%,#ede4d5_46%,#e8efe7_100%)]"
        ref={containerRef}
        role="region"
      />
    </div>
  );
}

function createMarker(
  group: GroupedMarker,
  map: maplibregl.Map,
  onSelectRef: RefObject<(slug: string) => void>,
  selectedSlugRef: RefObject<string | null>,
): maplibregl.Marker {
  const button = document.createElement('button');
  button.type = 'button';
  button.setAttribute('aria-label', markerLabel(group));
  button.dataset.slugs = group.facilities.map((f) => f.slug).join(',');
  applyMarkerStyles(button, group, selectedSlugRef.current);
  button.addEventListener('click', (event) => {
    event.stopPropagation();
    const currentSelected = selectedSlugRef.current;
    const nextFacility =
      group.facilities.length === 1
        ? group.facilities[0]
        : cycleGroup(group.facilities, currentSelected);
    onSelectRef.current?.(nextFacility.slug);
  });

  return new maplibregl.Marker({ element: button, anchor: 'center' })
    .setLngLat([group.lon, group.lat])
    .addTo(map);
}

function syncSelectionStyling(
  markers: maplibregl.Marker[],
  groups: GroupedMarker[],
  selectedSlug: string | null,
) {
  markers.forEach((marker, index) => {
    const group = groups[index];
    if (!group) return;
    const element = marker.getElement() as HTMLButtonElement;
    applyMarkerStyles(element, group, selectedSlug);
  });
}

function applyMarkerStyles(
  element: HTMLButtonElement,
  group: GroupedMarker,
  selectedSlug: string | null,
) {
  const isCluster = group.facilities.length > 1;
  const selectedInGroup = group.facilities.some(
    (facility) => facility.slug === selectedSlug,
  );
  const activeFacility =
    group.facilities.find((facility) => facility.slug === selectedSlug) ??
    group.facilities[0];
  const color = CATEGORY_COLOR[activeFacility.category];
  const opacity = STATUS_OPACITY[activeFacility.status];

  const size = isCluster ? 40 : 14;
  element.textContent = isCluster ? String(group.facilities.length) : '';
  element.style.width = `${size}px`;
  element.style.height = `${size}px`;
  element.style.display = 'flex';
  element.style.alignItems = 'center';
  element.style.justifyContent = 'center';
  element.style.padding = '0';
  element.style.borderRadius = '9999px';
  element.style.border = '3px solid white';
  element.style.boxShadow = '0 4px 10px rgba(0,0,0,0.25)';
  element.style.backgroundColor = color;
  element.style.color = 'white';
  element.style.fontFamily = 'inherit';
  element.style.fontSize = isCluster ? '13px' : '0';
  element.style.fontWeight = '600';
  element.style.cursor = 'pointer';
  element.style.opacity = String(opacity);
  element.style.transition = 'transform 120ms ease, outline-color 120ms ease';
  element.style.outline = selectedInGroup
    ? '3px solid rgba(26,26,26,0.2)'
    : '3px solid transparent';
  element.style.outlineOffset = '2px';
}

function buildMarkerGroups(facilities: Facility[]): GroupedMarker[] {
  const groups: GroupedMarker[] = [];
  // Rough screen-space threshold at INITIAL_ZOOM (~5.3) in geographic units.
  // At zoom 5 over the UK, 1 screen pixel ~ 0.035 degrees longitude. We fold
  // anything within CLUSTER_THRESHOLD_PX * that factor into a single group.
  const degreesPerPixel = 0.035;
  const threshold = CLUSTER_THRESHOLD_PX * degreesPerPixel;

  for (const facility of facilities) {
    const { lon, lat } = facility.location;
    const existing = groups.find(
      (group) =>
        Math.abs(group.lon - lon) < threshold &&
        Math.abs(group.lat - lat) < threshold,
    );

    if (existing) {
      existing.facilities.push(facility);
      existing.lon = average(existing.lon, lon);
      existing.lat = average(existing.lat, lat);
    } else {
      groups.push({
        facilities: [facility],
        lon,
        lat,
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

function markerLabel(group: GroupedMarker) {
  if (group.facilities.length === 1) {
    return group.facilities[0].name;
  }

  return `${group.facilities.length} facilities at this location: ${group.facilities
    .map((facility) => facility.name)
    .join(', ')}`;
}

function average(left: number, right: number) {
  return (left + right) / 2;
}

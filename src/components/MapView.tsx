import { useEffect, useMemo, useRef } from 'react';
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

export function MapView({
  facilities,
  onSelect,
  selectedSlug,
}: MapViewProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const popupRef = useRef<maplibregl.Popup | null>(null);
  const featureCollection = useMemo(
    () => ({
      type: 'FeatureCollection' as const,
      features: buildSiteFeatures(facilities),
    }),
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

    map.scrollZoom.disable();
    map.touchZoomRotate.disableRotation();
    map.keyboard.disableRotation();
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');

      map.on('load', () => {
        map.addSource('facilities', {
          type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: [],
        },
        cluster: false,
      });

      map.addLayer({
        id: 'grouped-sites',
        type: 'circle',
        source: 'facilities',
        filter: ['>', ['get', 'groupSize'], 1],
        paint: {
          'circle-color': '#f8f4ea',
          'circle-radius': [
            'interpolate',
            ['linear'],
            ['get', 'groupSize'],
            2,
            14,
            4,
            18,
            6,
            21,
          ],
          'circle-stroke-color': '#ffffff',
          'circle-stroke-width': 3,
          'circle-opacity': 0.98,
        },
      });

      map.addLayer({
        id: 'grouped-sites-halo',
        type: 'circle',
        source: 'facilities',
        filter: ['>', ['get', 'groupSize'], 1],
        paint: {
          'circle-color': '#000000',
          'circle-radius': [
            'interpolate',
            ['linear'],
            ['get', 'groupSize'],
            2,
            16,
            4,
            20,
            6,
            23,
          ],
          'circle-opacity': 0.08,
        },
      });

      map.addLayer({
        id: 'grouped-sites-count',
        type: 'symbol',
        source: 'facilities',
        filter: ['>', ['get', 'groupSize'], 1],
        layout: {
          'text-field': ['to-string', ['get', 'groupSize']],
          'text-size': 12,
          'text-font': ['Noto Sans Regular'],
          'text-offset': [0, 0],
        },
        paint: {
          'text-color': '#3b3b36',
        },
      });

      map.addLayer({
        id: 'facility-points',
        type: 'circle',
        source: 'facilities',
        filter: ['==', ['get', 'groupSize'], 1],
        paint: {
          'circle-color': [
            'match',
            ['get', 'category'],
            'flagship',
            CATEGORY_COLOR.flagship,
            'backbone',
            CATEGORY_COLOR.backbone,
            'specialist',
            CATEGORY_COLOR.specialist,
            'regional',
            CATEGORY_COLOR.regional,
            'mission',
            CATEGORY_COLOR.mission,
            '#1f4e79',
          ],
          'circle-radius': 7.5,
          'circle-stroke-color': '#ffffff',
          'circle-stroke-width': 3,
          'circle-opacity': [
            'match',
            ['get', 'status'],
            'operational',
            STATUS_OPACITY.operational,
            'upgrading',
            STATUS_OPACITY.upgrading,
            'planned',
            STATUS_OPACITY.planned,
            'decommissioned',
            STATUS_OPACITY.decommissioned,
            1,
          ],
        },
      });

      map.addLayer({
        id: 'facility-point-labels',
        type: 'symbol',
        source: 'facilities',
        filter: ['all', ['==', ['get', 'groupSize'], 1], ['>=', ['zoom'], 6.2]],
        layout: {
          'text-field': ['get', 'shortLabel'],
          'text-font': ['Noto Sans Regular'],
          'text-size': 11,
          'text-offset': [0, 1.25],
          'text-anchor': 'top',
        },
        paint: {
          'text-color': '#3f3a34',
          'text-halo-color': 'rgba(255,255,255,0.92)',
          'text-halo-width': 1.8,
        },
      });

      map.addLayer({
        id: 'selected-facility-ring',
        type: 'circle',
        source: 'facilities',
        filter: ['==', ['get', 'slug'], ''],
        paint: {
          'circle-color': 'transparent',
          'circle-radius': 12,
          'circle-stroke-color': 'rgba(26,26,26,0.25)',
          'circle-stroke-width': 4,
        },
      });

      map.on('mouseenter', 'facility-points', () => {
        map.getCanvas().style.cursor = 'pointer';
      });
      map.on('mouseleave', 'facility-points', () => {
        map.getCanvas().style.cursor = '';
      });
      map.on('mouseenter', 'grouped-sites', () => {
        map.getCanvas().style.cursor = 'pointer';
      });
      map.on('mouseleave', 'grouped-sites', () => {
        map.getCanvas().style.cursor = '';
      });

      map.on('click', 'facility-points', (event) => {
        const feature = event.features?.[0];
        if (!feature) return;
        const slug = feature.properties?.slug;
        if (typeof slug === 'string') {
          onSelect(slug);
        }
      });

      map.on('click', 'grouped-sites', (event) => {
        const feature = event.features?.[0];
        if (!feature) return;
        const slugList = feature.properties?.slugList;
        if (typeof slugList !== 'string') return;
        const [firstSlug] = slugList.split('|');
        if (!firstSlug) return;
        const coordinates = feature.geometry.type === 'Point'
          ? (feature.geometry.coordinates as [number, number])
          : MAP_CENTRE;
        map.easeTo({
          center: coordinates,
          zoom: Math.max(map.getZoom(), 7.1),
          duration: 600,
        });
        onSelect(firstSlug);
      });
    });

    mapRef.current = map;

    return () => {
      popupRef.current?.remove();
      map.remove();
      mapRef.current = null;
    };
  }, [onSelect]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const syncData = () => {
      const source = map.getSource('facilities') as maplibregl.GeoJSONSource | undefined;
      if (!source) return;
      source.setData(featureCollection);
    };

    if (map.isStyleLoaded()) {
      syncData();
    } else {
      map.once('load', syncData);
    }

    return () => {
      map.off('load', syncData);
    };
  }, [featureCollection]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.getLayer('selected-facility-ring')) return;

    map.setFilter('selected-facility-ring', [
      '==',
      ['get', 'slug'],
      selectedSlug ?? '',
    ]);

    popupRef.current?.remove();

    if (!selectedSlug) return;

    const facility = facilities.find((item) => item.slug === selectedSlug);
    if (!facility) return;

    map.easeTo({
      center: [facility.location.lon, facility.location.lat],
      zoom: Math.max(map.getZoom(), 6.7),
      duration: 650,
    });

    popupRef.current = new maplibregl.Popup({
      closeButton: false,
      closeOnClick: false,
      offset: 18,
      className: 'uk-compute-map-popup',
    })
      .setLngLat([facility.location.lon, facility.location.lat])
      .setHTML(
        `<div class="space-y-1">
          <div class="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-500">${facility.location.city}</div>
          <div class="font-serif text-base text-stone-900">${facility.name}</div>
          <div class="text-sm text-stone-600">${facility.oneLiner}</div>
        </div>`,
      )
      .addTo(map);
  }, [facilities, selectedSlug]);

  return (
    <div className="overflow-hidden rounded-[2rem] border border-white/45 bg-white/55 shadow-[0_28px_60px_-40px_rgba(20,20,20,0.36)] backdrop-blur">
      <div className="border-b border-stone-200 px-5 py-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-serif text-2xl">Where the infrastructure lives</h2>
            <p className="mt-1 text-sm text-stone-600">
              Pan and zoom the UK map, then click a dot to open the facility
              panel. Scroll continues over the map; wheel zoom is disabled to
              keep the page easy to navigate.
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
        className="relative h-[62vh] min-h-[520px] w-full bg-[linear-gradient(180deg,rgba(247,242,232,0.68)_0%,rgba(237,228,213,0.72)_46%,rgba(232,239,231,0.76)_100%)]"
        ref={containerRef}
        role="region"
      />
    </div>
  );
}

function shortLabelFor(facility: Facility) {
  const labelBySlug: Record<string, string> = {
    'isambard-ai': 'Isambard-AI',
    dawn: 'Dawn',
    sunrise: 'Sunrise',
    'epcc-national': 'EPCC',
    archer2: 'ARCHER2',
    'mary-coombs': 'Mary Coombs',
    'met-office': 'Met Office',
    eidf: 'EIDF',
    jasmin: 'JASMIN',
    iris: 'IRIS',
    'kelvin-2': 'Kelvin-2',
    cirrus: 'Cirrus',
    bede: 'Bede',
    'young-mmm': 'Young',
    csd3: 'CSD3',
    'gridpp-ral': 'GridPP',
    'dirac-tursa': 'Tursa',
    'dirac-csd3': 'DiRAC CSD3',
    'dirac-leicester': 'DiRAC Leicester',
    'dirac-durham': 'DiRAC Durham',
    awe: 'AWE',
    'isambard-3': 'Isambard 3',
  };

  return labelBySlug[facility.slug] ?? facility.name;
}

function buildSiteFeatures(facilities: Facility[]) {
  const grouped = new Map<string, Facility[]>();

  for (const facility of facilities) {
    const key = `${facility.location.lat}:${facility.location.lon}`;
    const existing = grouped.get(key) ?? [];
    existing.push(facility);
    grouped.set(key, existing);
  }

  return Array.from(grouped.values()).map((group) => {
    const primary = group[0];

    return {
      type: 'Feature' as const,
      geometry: {
        type: 'Point' as const,
        coordinates: [primary.location.lon, primary.location.lat] as [
          number,
          number,
        ],
      },
      properties: {
        slug: primary.slug,
        slugList: group.map((facility) => facility.slug).join('|'),
        name: primary.name,
        shortLabel: shortLabelFor(primary),
        category: primary.category,
        status: primary.status,
        groupSize: group.length,
      },
    };
  });
}

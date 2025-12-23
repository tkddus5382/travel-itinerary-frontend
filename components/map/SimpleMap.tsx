'use client';

import { useState, useEffect } from 'react';
import Map, { Marker, Source, Layer } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

interface Place {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  order: number;
}

interface SimpleMapProps {
  places: Place[];
  height?: string;
  onMarkerClick?: (place: Place) => void;
}

export default function SimpleMap({
  places,
  height = '400px',
  onMarkerClick,
}: SimpleMapProps) {
  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';

  // Calculate center and zoom based on places
  const [viewport, setViewport] = useState({
    longitude: 126.9780, // Default: Seoul
    latitude: 37.5665,
    zoom: 12,
  });

  useEffect(() => {
    if (places.length === 0) return;

    // Calculate bounds
    const lngs = places.map(p => p.longitude);
    const lats = places.map(p => p.latitude);

    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);

    const centerLng = (minLng + maxLng) / 2;
    const centerLat = (minLat + maxLat) / 2;

    setViewport({
      longitude: centerLng,
      latitude: centerLat,
      zoom: places.length === 1 ? 14 : 12,
    });
  }, [places]);

  // Create GeoJSON line for route
  const routeGeoJSON = {
    type: 'Feature' as const,
    properties: {},
    geometry: {
      type: 'LineString' as const,
      coordinates: places
        .sort((a, b) => a.order - b.order)
        .map(p => [p.longitude, p.latitude]),
    },
  };

  if (!mapboxToken || mapboxToken === 'your_mapbox_token_here') {
    return (
      <div
        style={{ height }}
        className="flex items-center justify-center bg-gray-100 border border-gray-300 rounded-lg"
      >
        <div className="text-center p-8">
          <p className="text-red-600 font-semibold mb-2">Mapbox 토큰이 필요합니다</p>
          <p className="text-sm text-gray-600">
            .env.local 파일에 NEXT_PUBLIC_MAPBOX_TOKEN을 설정해주세요
          </p>
          <a
            href="https://account.mapbox.com/access-tokens/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline text-sm mt-2 inline-block"
          >
            Mapbox 토큰 발급받기 →
          </a>
        </div>
      </div>
    );
  }

  return (
    <div style={{ height }} className="rounded-lg overflow-hidden border border-gray-300">
      <Map
        {...viewport}
        onMove={(evt) => setViewport(evt.viewState)}
        mapStyle="mapbox://styles/mapbox/streets-v12"
        mapboxAccessToken={mapboxToken}
        style={{ width: '100%', height: '100%' }}
      >
        {/* Route line */}
        {places.length > 1 && (
          <Source id="route" type="geojson" data={routeGeoJSON}>
            <Layer
              id="route-layer"
              type="line"
              paint={{
                'line-color': '#3b82f6',
                'line-width': 3,
                'line-opacity': 0.7,
              }}
            />
          </Source>
        )}

        {/* Place markers */}
        {places
          .sort((a, b) => a.order - b.order)
          .map((place, index) => (
            <Marker
              key={place.id}
              longitude={place.longitude}
              latitude={place.latitude}
              anchor="bottom"
              onClick={(e) => {
                e.originalEvent.stopPropagation();
                onMarkerClick?.(place);
              }}
            >
              <div
                className="cursor-pointer transform transition-transform hover:scale-110"
                title={place.name}
              >
                {/* Numbered marker */}
                <div className="relative">
                  <svg
                    width="32"
                    height="40"
                    viewBox="0 0 32 40"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M16 0C7.164 0 0 7.164 0 16c0 8.836 16 24 16 24s16-15.164 16-24C32 7.164 24.836 0 16 0z"
                      fill="#ef4444"
                    />
                    <circle cx="16" cy="16" r="10" fill="white" />
                  </svg>
                  <div className="absolute top-[6px] left-0 w-full text-center">
                    <span className="text-red-600 font-bold text-sm">
                      {index + 1}
                    </span>
                  </div>
                </div>
              </div>
            </Marker>
          ))}
      </Map>
    </div>
  );
}

'use client';

import React, { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react';
import maplibregl from 'maplibre-gl';
import { Navigation } from 'lucide-react';
import 'maplibre-gl/dist/maplibre-gl.css';

interface Map3DProps {
  center?: [number, number];
  zoom?: number;
  isDark?: boolean;
  is3D?: boolean;
}

export interface Map3DHandle {
  flyToCenter: () => void;
  setPitch: (pitch: number) => void;
}

const Map3D = forwardRef<Map3DHandle, Map3DProps>(function Map3D({
  center = [98.60877, 2.9956],
  zoom = 14,
  isDark = true,
  is3D = true,
}, ref) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  const maptilerKey = 'eFSf5fcbQmUI97nngDN1';

  useImperativeHandle(ref, () => ({
    flyToCenter: () => {
      mapRef.current?.flyTo({
        center: center,
        zoom: 14,
        pitch: is3D ? 65 : 0,
        bearing: -20,
        duration: 2000,
      });
    },
    setPitch: (pitch: number) => {
      mapRef.current?.easeTo({
        pitch,
        bearing: pitch > 0 ? -20 : 0,
        duration: 1500,
      });
    },
  }));

  useEffect(() => {
    if (!mapContainerRef.current) return;

    const styleUrl = isDark
      ? `https://api.maptiler.com/maps/streets-v2-dark/style.json?key=${maptilerKey}`
      : `https://api.maptiler.com/maps/streets-v2/style.json?key=${maptilerKey}`;

    // Safety timeout to ensure UI unlocks
    const safetyTimer = setTimeout(() => {
      if (!mapLoaded) setMapLoaded(true);
    }, 4000);

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: styleUrl,
      center: center,
      zoom: zoom,
      pitch: 65,
      bearing: -20,
    });

    mapRef.current = map;

    // Handle missing images warnings (silence the console)
    map.on('styleimagemissing', (e) => {
      const canvas = document.createElement('canvas');
      canvas.width = 1;
      canvas.height = 1;
      map.addImage(e.id, canvas.getContext('2d')!.getImageData(0, 0, 1, 1));
    });

    map.on('load', () => {
      console.log('✅ Map engine ready');
      setMapLoaded(true);
      map.resize();

      // Setup Terrain
      map.addSource('terrain', {
        type: 'raster-dem',
        url: `https://api.maptiler.com/tiles/terrain-rgb-v2/tiles.json?key=${maptilerKey}`,
        tileSize: 512,
      });
      map.setTerrain({ source: 'terrain', exaggeration: 1.2 });

      setupSaribudolokLayers(map);
    });

    map.on('error', (e) => {
      console.error('❌ Map engine error:', e);
      setMapLoaded(true);
    });

    return () => {
      clearTimeout(safetyTimer);
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [isDark]);

  const setupSaribudolokLayers = (map: maplibregl.Map) => {
    const apiUrl = 'http://localhost:3001/regions';

    // Try API first, fallback to local GeoJSON
    const loadGeoData = async () => {
      try {
        const res = await fetch(apiUrl);
        if (!res.ok) throw new Error('API unavailable');
        return await res.json();
      } catch {
        console.warn('⚠️ Backend offline, loading local GeoJSON fallback...');
        try {
          const localRes = await fetch('/geojson/saribudolok.geojson');
          const localData = await localRes.json();
          return {
            type: 'FeatureCollection',
            features: [{
              type: 'Feature',
              properties: localData.properties || { name: 'Saribu Dolok', code: '12.08.25.1012' },
              geometry: localData.geometry,
            }],
          };
        } catch {
          console.error('❌ Failed to load local GeoJSON fallback');
          return null;
        }
      }
    };

    loadGeoData().then(data => {
      if (data && data.features && data.features.length > 0) {
        const feature = data.features[0];

        map.addSource('saribudolok', { type: 'geojson', data: data });

        const maskData = {
          type: 'Feature',
          geometry: {
            type: 'Polygon',
            coordinates: [
              [[-180, -90], [180, -90], [180, 90], [-180, 90], [-180, -90]],
              feature.geometry.coordinates[0]
            ]
          }
        };
        map.addSource('mask', { type: 'geojson', data: maskData as any });
        map.addLayer({
          id: 'focus-mask',
          type: 'fill',
          source: 'mask',
          paint: {
            'fill-color': isDark ? '#000' : '#fff',
            'fill-opacity': 0.4
          }
        });

        map.addLayer({
          id: 'saribudolok-body',
          type: 'fill-extrusion',
          source: 'saribudolok',
          paint: {
            'fill-extrusion-color': isDark ? '#ffffff' : '#3b82f6',
            'fill-extrusion-height': 30,
            'fill-extrusion-base': 0,
            'fill-extrusion-opacity': 0.5,
          }
        });

        // 3D Label Layer
        map.addLayer({
          id: 'saribudolok-label',
          type: 'symbol',
          source: 'saribudolok',
          layout: {
            'text-field': 'SARIBUDOLOK',
            'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
            'text-size': 14,
            'text-letter-spacing': 0.4,
            'text-transform': 'uppercase',
            'text-anchor': 'center',
            'text-offset': [0, 0],
          },
          paint: {
            'text-color': '#fff',
            'text-halo-color': '#3b82f6',
            'text-halo-width': 2,
          }
        });

        // Glow Border (thick & blurred)
        map.addLayer({
          id: 'saribudolok-glow',
          type: 'line',
          source: 'saribudolok',
          paint: {
            'line-color': '#3b82f6',
            'line-width': 8,
            'line-blur': 6,
            'line-opacity': 0.6,
          }
        });

        // Sharp Neon Border
        map.addLayer({
          id: 'saribudolok-outline',
          type: 'line',
          source: 'saribudolok',
          paint: {
            'line-color': '#60a5fa',
            'line-width': 2,
            'line-opacity': 0.9,
          }
        });

        map.on('mouseenter', 'saribudolok-body', () => {
          map.getCanvas().style.cursor = 'pointer';
          map.setPaintProperty('saribudolok-body', 'fill-extrusion-opacity', 0.8);
          map.setPaintProperty('saribudolok-body', 'fill-extrusion-color', '#60a5fa');
        });

        map.on('mouseleave', 'saribudolok-body', () => {
          map.getCanvas().style.cursor = '';
          map.setPaintProperty('saribudolok-body', 'fill-extrusion-opacity', 0.5);
          map.setPaintProperty('saribudolok-body', 'fill-extrusion-color', isDark ? '#ffffff' : '#3b82f6');
        });

        const coordinates = feature.geometry.coordinates[0];
        const bounds = coordinates.reduce((acc: any, coord: any) => {
          return acc.extend(coord);
        }, new maplibregl.LngLatBounds(coordinates[0], coordinates[0]));

        map.fitBounds(bounds, {
          padding: 120,
          duration: 2500,
          pitch: 65,
          bearing: -20,
        });
      }
    });
  };

  return (
    <div className="relative w-full h-screen bg-slate-950 overflow-hidden">
      <div ref={mapContainerRef} className="absolute inset-0 w-full h-full" />

      {/* Loading Overlay */}
      <div className={`absolute inset-0 z-50 flex flex-col items-center justify-center bg-background/95 backdrop-blur-2xl transition-all duration-1000 ${mapLoaded ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
        <div className="relative">
          <div className="w-24 h-24 border-4 border-blue-500/20 rounded-full animate-spin border-t-blue-500" />
          <Navigation className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-blue-500 animate-pulse" />
        </div>
        <div className="mt-8 text-blue-500 font-black tracking-[0.5em] uppercase text-[10px] animate-pulse">
          Isolating Geographic Sector...
        </div>
      </div>
    </div>
  );
});

export default Map3D;

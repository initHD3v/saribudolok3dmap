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

      // Setup Atmosphere/Fog (Cast to any to bypass lint for new MapLibre features)
      (map as any).setFog({
        'range': [0.5, 10],
        'color': isDark ? '#0f172a' : '#f8fafc',
        'horizon-blend': 0.1,
        'space-color': isDark ? '#020617' : '#e2e8f0',
        'star-intensity': isDark ? 0.3 : 0
      });

      // V3: Topographic Contours (High-Altitude emphasis)
      map.addSource('contours', {
        type: 'vector',
        url: `https://api.maptiler.com/tiles/contours/tiles.json?key=${maptilerKey}`
      });
      map.addLayer({
        id: 'contour-lines',
        type: 'line',
        source: 'contours',
        'source-layer': 'contour',
        layout: {
          'line-join': 'round',
          'line-cap': 'round'
        },
        paint: {
          'line-color': isDark ? '#ffffff' : '#000000',
          'line-opacity': 0.08,
          'line-width': 0.5
        }
      });
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

        // Simple pulse animation logic
        let step = 0;
        const animate = () => {
          step += 0.05;
          const opacity = 0.4 + Math.sin(step) * 0.1;
          if (map.getLayer('saribudolok-body')) {
            map.setPaintProperty('saribudolok-body', 'fill-extrusion-opacity', opacity);
          }
          requestAnimationFrame(animate);
        };
        animate();

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

        // V3: Shadow Layer (Flat on ground)
        map.addLayer({
          id: 'saribudolok-shadow',
          type: 'fill',
          source: 'saribudolok',
          paint: {
            'fill-color': '#000',
            'fill-opacity': 0.3,
          }
        });

        // V3: Floating Glass Body
        map.addLayer({
          id: 'saribudolok-body',
          type: 'fill-extrusion',
          source: 'saribudolok',
          paint: {
            'fill-extrusion-color': isDark ? '#ffffff' : '#3b82f6',
            'fill-extrusion-height': 50,
            'fill-extrusion-base': 15,
            'fill-extrusion-opacity': 0.4,
          }
        });

        // V3: Geometric Mesh Grid Layer
        map.addLayer({
          id: 'saribudolok-mesh',
          type: 'line',
          source: 'saribudolok',
          paint: {
            'line-color': isDark ? '#60a5fa' : '#2563eb',
            'line-width': 1,
            'line-opacity': 0.3,
            'line-dasharray': [2, 1],
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

        // V3: 3D Pulse Markers for Landmarks
        const landmarkSource: any = {
          type: 'geojson',
          data: {
            type: 'FeatureCollection',
            features: [
              { type: 'Feature', properties: { name: 'Paropo' }, geometry: { type: 'Point', coordinates: [98.5430, 2.9230] } },
              { type: 'Feature', properties: { name: 'Aek Nauli' }, geometry: { type: 'Point', coordinates: [98.5800, 2.9500] } },
              { type: 'Feature', properties: { name: 'Simalem' }, geometry: { type: 'Point', coordinates: [98.5140, 2.9770] } },
            ]
          }
        };
        map.addSource('landmarks', landmarkSource);

        map.addLayer({
          id: 'landmarks-pillars',
          type: 'fill-extrusion',
          source: 'landmarks',
          paint: {
            'fill-extrusion-color': '#60a5fa',
            'fill-extrusion-height': 150,
            'fill-extrusion-base': 0,
            'fill-extrusion-opacity': 0.8,
          }
        });

        map.addLayer({
          id: 'landmarks-glow',
          type: 'circle',
          source: 'landmarks',
          paint: {
            'circle-radius': 12,
            'circle-color': '#3b82f6',
            'circle-opacity': 0.4,
            'circle-blur': 1,
          }
        });

        map.addLayer({
          id: 'landmarks-labels',
          type: 'symbol',
          source: 'landmarks',
          layout: {
            'text-field': ['get', 'name'],
            'text-size': 10,
            'text-offset': [0, 1.5],
            'text-anchor': 'top',
          },
          paint: {
            'text-color': '#fff',
            'text-halo-color': '#000',
            'text-halo-width': 1
          }
        });

        map.on('mouseenter', 'saribudolok-body', () => {
          map.getCanvas().style.cursor = 'pointer';
          map.setPaintProperty('saribudolok-body', 'fill-extrusion-opacity', 0.8);
          map.setPaintProperty('saribudolok-body', 'fill-extrusion-color', '#60a5fa');
          map.setPaintProperty('saribudolok-body', 'fill-extrusion-height', 60);
        });

        map.on('mouseleave', 'saribudolok-body', () => {
          map.getCanvas().style.cursor = '';
          map.setPaintProperty('saribudolok-body', 'fill-extrusion-opacity', 0.4);
          map.setPaintProperty('saribudolok-body', 'fill-extrusion-color', isDark ? '#ffffff' : '#3b82f6');
          map.setPaintProperty('saribudolok-body', 'fill-extrusion-height', 50);
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

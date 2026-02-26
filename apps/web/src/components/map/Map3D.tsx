'use client';

import React, { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react';
import maplibregl from 'maplibre-gl';
import { Navigation } from 'lucide-react';
import 'maplibre-gl/dist/maplibre-gl.css';
import saribudolokData from '@/data/saribudolokData';

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

      // Map Controls
      map.addControl(new maplibregl.NavigationControl(), 'top-right');
      map.addControl(new maplibregl.GeolocateControl({
        positionOptions: {
          enableHighAccuracy: true
        },
        trackUserLocation: true,
      }), 'bottom-right');

      setMapLoaded(true);
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

  // Auto-Geolocation Camera logic
  useEffect(() => {
    if (!mapLoaded || !mapRef.current) return;

    const map = mapRef.current;

    // Check for geolocation
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { longitude, latitude } = position.coords;
          map.flyTo({
            center: [longitude, latitude],
            zoom: 14,
            duration: 3000,
            essential: true
          });
        },
        (error) => {
          console.warn('Geolocation Error atau Permisi Ditolak:', error);
          // Fly to Saribudolok if GPS fails
          map.flyTo({
            center: [saribudolokData.longitude, saribudolokData.latitude],
            zoom: 13,
            duration: 3000
          });
        },
        { enableHighAccuracy: true }
      );
    }
  }, [mapLoaded]);

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

    // V3 Fix: Shift Geometry utility to align original shape with correct center
    const shiftGeometry = (geometry: any, offsetLng: number, offsetLat: number) => {
      if (geometry.type === 'Polygon') {
        const newCoordinates = geometry.coordinates.map((ring: any) =>
          ring.map((coord: any) => [coord[0] + offsetLng, coord[1] + offsetLat])
        );
        return { ...geometry, coordinates: newCoordinates };
      }
      return geometry;
    };

    loadGeoData().then(data => {
      let heroPoly = null;

      if (data && data.features && data.features.length > 0) {
        const originalFeature = data.features[0];
        const originalCenter = [98.6087771, 2.9956262]; // From saribudolok.geojson props
        const targetCenter = [98.6104, 2.9387]; // RS. GKPS Bethesda

        const offsetLng = targetCenter[0] - originalCenter[0];
        const offsetLat = targetCenter[1] - originalCenter[1];

        heroPoly = {
          ...originalFeature,
          geometry: shiftGeometry(originalFeature.geometry, offsetLng, offsetLat)
        };
      } else {
        // Fallback to circular if GeoJSON loading fails entirely
        heroPoly = {
          type: 'Feature',
          properties: { name: 'Saribudolok Fallback' },
          geometry: {
            type: 'Polygon',
            coordinates: [[
              [98.6088, 2.9956], [98.6120, 2.9956], [98.6120, 2.9980], [98.6088, 2.9980], [98.6088, 2.9956]
            ]]
          }
        };
      }

      const heroData = { type: 'FeatureCollection', features: [heroPoly] };

      if (heroPoly) {
        const feature = heroPoly as any;
        // We still load 'data' for potential boundaries but prioritize heroData for the 3D Effect
        map.addSource('saribudolok', { type: 'geojson', data: heroData as any });

        // Simple pulse animation logic for layers
        let step = 0;
        const animate = () => {
          step += 0.05;
          const opacity = 0.5 + Math.sin(step) * 0.2;
          const glowRadius = 5 + Math.sin(step) * 2;

          if (map.getLayer('saribudolok-outline')) {
            map.setPaintProperty('saribudolok-outline', 'line-opacity', opacity);
          }
          if (map.getLayer('landmarks-pulse')) {
            map.setPaintProperty('landmarks-pulse', 'circle-radius', glowRadius);
          }
          requestAnimationFrame(animate);
        };
        animate();

        // Calculate Boundary Info Points (North, South, East, West)
        const coords = feature.geometry.coordinates[0];
        let minLat = Infinity, maxLat = -Infinity, minLng = Infinity, maxLng = -Infinity;
        coords.forEach(([lng, lat]: [number, number]) => {
          if (lat < minLat) minLat = lat;
          if (lat > maxLat) maxLat = lat;
          if (lng < minLng) minLng = lng;
          if (lng > maxLng) maxLng = lng;
        });

        const boundaryInfoData = {
          type: 'FeatureCollection',
          features: [
            { type: 'Feature', geometry: { type: 'Point', coordinates: [(minLng + maxLng) / 2, maxLat] }, properties: { label: `Batas Utara: ${saribudolokData.boundaries.utara}` } },
            { type: 'Feature', geometry: { type: 'Point', coordinates: [(minLng + maxLng) / 2, minLat] }, properties: { label: `Batas Selatan: ${saribudolokData.boundaries.selatan}` } },
            { type: 'Feature', geometry: { type: 'Point', coordinates: [maxLng, (minLat + maxLat) / 2] }, properties: { label: `Batas Timur: ${saribudolokData.boundaries.timur}` } },
            { type: 'Feature', geometry: { type: 'Point', coordinates: [minLng, (minLat + maxLat) / 2] }, properties: { label: `Batas Barat: ${saribudolokData.boundaries.barat}` } },
          ]
        };

        map.addSource('boundary-info', { type: 'geojson', data: boundaryInfoData as any });
        map.addLayer({
          id: 'boundary-info-labels',
          type: 'symbol',
          source: 'boundary-info',
          layout: {
            'text-field': ['get', 'label'],
            'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
            'text-size': 11,
            'text-variable-anchor': ['top', 'bottom', 'left', 'right'],
            'text-radial-offset': 1.5,
            'text-justify': 'auto',
          },
          paint: {
            'text-color': '#60a5fa',
            'text-halo-color': 'rgba(0,0,0,0.8)',
            'text-halo-width': 2
          }
        });

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

        // V3 Refinement: Outline Only (Floating Neon Line)
        map.addLayer({
          id: 'saribudolok-outline',
          type: 'line',
          source: 'saribudolok',
          paint: {
            'line-color': '#60a5fa',
            'line-width': 3,
            'line-opacity': 0.8,
            'line-blur': 1,
          }
        });

        // V3 Refinement: Very subtle glass body (almost invisible fill)
        map.addLayer({
          id: 'saribudolok-body',
          type: 'fill-extrusion',
          source: 'saribudolok',
          paint: {
            'fill-extrusion-color': '#60a5fa',
            'fill-extrusion-height': 25,
            'fill-extrusion-base': 24.5,
            'fill-extrusion-opacity': 0.1,
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
            'symbol-placement': 'point',
            'text-allow-overlap': false,
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

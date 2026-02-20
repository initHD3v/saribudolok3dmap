'use client';

import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

// Gunakan Token dari Environment Variable
mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || '';

interface Map3DProps {
  center?: [number, number]; // [longitude, latitude]
  zoom?: number;
}

export default function Map3D({ center = [98.60877, 2.9956], zoom = 14 }: Map3DProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    if (mapRef.current || !mapContainerRef.current) return;

    // Inisialisasi Peta (Dark Theme)
    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/dark-v11', // Custom dark style sesuai desain
      center: center,
      zoom: zoom,
      pitch: 60, // Pitch 60 derajat untuk efek 3D
      bearing: -17,
      antialias: true,
    });

    const map = mapRef.current;

    map.on('load', () => {
      setMapLoaded(true);

      // 1. Tambahkan Terrain 3D (Hillshade)
      map.addSource('mapbox-dem', {
        type: 'raster-dem',
        url: 'mapbox://mapbox.mapbox-terrain-dem-v1',
        tileSize: 512,
        maxzoom: 14,
      });
      map.setTerrain({ source: 'mapbox-dem', exaggeration: 1.5 });

      // 2. Tambahkan Sky Layer (Atmosphere Effect)
      map.addLayer({
        id: 'sky',
        type: 'sky',
        paint: {
          'sky-type': 'atmosphere',
          'sky-atmosphere-sun': [0.0, 0.0],
          'sky-atmosphere-sun-intensity': 15,
        },
      });

      // 3. Load GeoJSON Saribu Dolok dari Backend (Fallback ke local jika gagal)
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/regions`)
        .then((res) => res.json())
        .then((data) => {
          if (data.features) {
            map.addSource('saribudolok-boundary', {
              type: 'geojson',
              data: data,
            });

            // 4. 3D Extrusion Layer (Polygon Berdiri)
            map.addLayer({
              id: 'saribudolok-extrusion',
              type: 'fill-extrusion',
              source: 'saribudolok-boundary',
              paint: {
                'fill-extrusion-color': '#4A90E2', // Blue glow sesuai desain
                'fill-extrusion-height': 500, // Tinggi dummy 500 meter
                'fill-extrusion-base': 0,
                'fill-extrusion-opacity': 0.7,
              },
            });
          }
        })
        .catch((err) => console.error('Gagal memuat GeoJSON:', err));

      // 5. Cinematic Flyover Effect
      map.flyTo({
        center: center,
        zoom: 15.5,
        speed: 0.5,
        curve: 1,
        easing(t) {
          return t;
        },
      });
    });

    return () => map.remove();
  }, [center, zoom]);

  return (
    <div className="relative w-full h-screen bg-slate-950 overflow-hidden">
      <div ref={mapContainerRef} className="absolute inset-0" />
      
      {/* Overlay UI (Glassmorphism Panel) */}
      {!mapLoaded && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md">
          <div className="text-blue-400 animate-pulse font-mono tracking-widest uppercase">
            Initializing Geo Systems...
          </div>
        </div>
      )}
    </div>
  );
}

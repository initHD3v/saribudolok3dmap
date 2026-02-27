'use client';

import React, { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react';
import maplibregl from 'maplibre-gl';
import { Navigation, MapPin, Navigation2, Car, Bike, Footprints, Ruler, Trash2, X, Download } from 'lucide-react';
import * as turf from '@turf/turf';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';
import 'maplibre-gl/dist/maplibre-gl.css';
import saribudolokData from '@/data/saribudolokData';

interface Map3DProps {
  center?: [number, number];
  zoom?: number;
  isDark?: boolean;
  is3D?: boolean;
  onToolChange?: (tool: 'measure' | 'route' | null) => void;
}

export interface Map3DHandle {
  flyToCenter: () => void;
  setPitch: (pitch: number) => void;
  triggerGeolocation: () => void;
  setToolMode: (mode: 'measure' | 'route' | null) => void;
}

const Map3D = forwardRef<Map3DHandle, Map3DProps>(function Map3D({
  center = [98.6104, 2.9387],
  zoom = 14,
  isDark = true,
  is3D = true,
  onToolChange,
}, ref) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const isDarkRef = useRef(isDark); // Track isDark without triggering map re-init
  const isInitialMount = useRef(true); // Track initial React mount

  // Routing State
  const [routePoints, setRoutePoints] = useState<[number, number][]>([]);
  const [routeAddresses, setRouteAddresses] = useState<string[]>(['', '']);
  const [routeInfo, setRouteInfo] = useState<{ distance: number, distanceStr: string, durationCar: number, durationBike: number, durationWalk: number } | null>(null);
  const routePointsRef = useRef<[number, number][]>([]); // Track without re-rendering the whole map init
  const [isRouting, setIsRouting] = useState(false);
  const isRoutingRef = useRef(false);

  // Measurement State
  const [measurementResult, setMeasurementResult] = useState<{ area: number, perimeter: number } | null>(null);
  const [isMeasuring, setIsMeasuring] = useState(false);
  const drawRef = useRef<MapboxDraw | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const timersRef = useRef<NodeJS.Timeout[]>([]);

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
    triggerGeolocation: () => {
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { longitude, latitude } = position.coords;
            mapRef.current?.flyTo({
              center: [longitude, latitude],
              zoom: 14,
              duration: 3000,
              essential: true
            });
          },
          (error) => {
            console.warn('Geolocation Error:', error);
            mapRef.current?.flyTo({
              center: [saribudolokData.longitude, saribudolokData.latitude],
              zoom: 13,
              duration: 3000
            });
          },
          { enableHighAccuracy: true }
        );
      }
    },
    setToolMode: (mode: 'measure' | 'route' | null) => {
      // Deactivate Measure if it's not the requested mode
      if (mode !== 'measure' && isMeasuring) {
        drawRef.current?.changeMode('simple_select');
        drawRef.current?.deleteAll();
        setMeasurementResult(null);
        setIsMeasuring(false);
      }

      // Deactivate Routing if it's not the requested mode
      if (mode !== 'route' && isRoutingRef.current) {
        setRoutePoints([]);
        routePointsRef.current = [];
        setRouteInfo(null);
        setRouteAddresses(['', '']);
        const map = mapRef.current;
        if (map) {
          if (map.getSource('route')) {
            (map.getSource('route') as maplibregl.GeoJSONSource).setData({ type: 'FeatureCollection', features: [] } as any);
          }
          for (let i = 1; i <= 2; i++) {
            const markerId = `route-marker-${i}`;
            if (map.getLayer(markerId)) map.removeLayer(markerId);
            if (map.getSource(markerId)) map.removeSource(markerId);
          }
        }
        setIsRouting(false);
        isRoutingRef.current = false;
      }

      // Activate Measure
      if (mode === 'measure') {
        drawRef.current?.changeMode('draw_polygon');
        setIsMeasuring(true);
      }
      // Activate Routing
      else if (mode === 'route') {
        setIsRouting(true);
        isRoutingRef.current = true;
      }

      // Notify parent
      if (onToolChange) {
        onToolChange(mode);
      }
    }
  }));

  useEffect(() => {
    if (!mapContainerRef.current) return;

    const styleUrl = isDarkRef.current
      ? `https://api.maptiler.com/maps/streets-v2-dark/style.json?key=${maptilerKey}`
      : `https://api.maptiler.com/maps/streets-v2/style.json?key=${maptilerKey}`;

    // Safety timeout to ensure UI unlocks
    const safetyTimer = setTimeout(() => {
      if (!mapLoaded) setMapLoaded(true);
    }, 4000);
    timersRef.current.push(safetyTimer);

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
      const draw = new MapboxDraw({
        displayControlsDefault: false,
        controls: {
          polygon: true,
          trash: true
        },
        defaultMode: 'simple_select',
        styles: [
          // ACTIVE (being drawn)
          {
            'id': 'gl-draw-polygon-fill-active',
            'type': 'fill',
            'filter': ['==', '$type', 'Polygon'],
            'paint': {
              'fill-color': '#3b82f6',
              'fill-outline-color': '#3b82f6',
              'fill-opacity': 0.2
            }
          },
          {
            'id': 'gl-draw-polygon-stroke-active',
            'type': 'line',
            'filter': ['==', '$type', 'Polygon'],
            'layout': {
              'line-cap': 'round',
              'line-join': 'round'
            },
            'paint': {
              'line-color': '#3b82f6',
              'line-dasharray': [0.2, 2],
              'line-width': 2
            }
          },
          // VERTEX
          {
            'id': 'gl-draw-polygon-and-line-vertex-active',
            'type': 'circle',
            'filter': ['all', ['==', 'meta', 'vertex'], ['==', '$type', 'Point']],  // Keep 'all' here since multiple conditions
            'paint': {
              'circle-radius': 5,
              'circle-color': '#ffffff',
              'circle-stroke-width': 2,
              'circle-stroke-color': '#3b82f6'
            }
          }
        ]
      });

      map.addControl(draw as any, 'top-right');
      drawRef.current = draw;

      const updateMeasurement = () => {
        const data = draw.getAll();
        if (data.features.length > 0) {
          const feature = data.features[0];
          if (feature.geometry.type === 'Polygon') {
            const area = turf.area(feature as any);
            const perimeter = (turf as any).length(feature as any, { units: 'meters' });
            setMeasurementResult({ area, perimeter });
          }
        } else {
          setMeasurementResult(null);
        }
      };

      map.on('draw.create', updateMeasurement);
      map.on('draw.delete', updateMeasurement);
      map.on('draw.update', updateMeasurement);

      // Force initial setup once fully loaded
      setupAllLayers(map);
    });

    // Helper: Setup all custom layers (called on initial load AND after style swap)
    const setupAllLayers = (mapInstance: maplibregl.Map) => {
      // Setup Terrain
      if (!mapInstance.getSource('terrain')) {
        mapInstance.addSource('terrain', {
          type: 'raster-dem',
          url: `https://api.maptiler.com/tiles/terrain-rgb-v2/tiles.json?key=${maptilerKey}`,
          tileSize: 512,
        });
      }
      mapInstance.setTerrain({ source: 'terrain', exaggeration: 1.2 });

      setupSaribudolokLayers(mapInstance);


      // V3: Topographic Contours (High-Altitude emphasis)
      if (!mapInstance.getSource('contours')) {
        mapInstance.addSource('contours', {
          type: 'vector',
          url: `https://api.maptiler.com/tiles/contours/tiles.json?key=${maptilerKey}`
        });
      }
      if (!mapInstance.getLayer('contour-lines')) {
        mapInstance.addLayer({
          id: 'contour-lines',
          type: 'line',
          source: 'contours',
          'source-layer': 'contour',
          layout: {
            'line-join': 'round',
            'line-cap': 'round'
          },
          paint: {
            'line-color': isDarkRef.current ? '#ffffff' : '#000000',
            'line-opacity': 0.08,
            'line-width': 0.5
          }
        });
      }

      // Map Controls (only add once)
      if (!(mapInstance as any)._controlsAdded) {
        mapInstance.addControl(new maplibregl.NavigationControl({ showCompass: true, showZoom: true }), 'top-left');
        mapInstance.addControl(new maplibregl.GeolocateControl({
          positionOptions: {
            enableHighAccuracy: true
          },
          trackUserLocation: true,
        }), 'top-left');
        (mapInstance as any)._controlsAdded = true;
      }



      // Enhance Street Names Visibility and Show Minor Roads
      const enhanceStreetLabels = () => {
        if (!mapInstance.getStyle()) return;
        const layers = mapInstance.getStyle().layers;
        if (!layers) return;

        layers.forEach((layer) => {
          // Identify any road label layers (highway, major, minor, residential)
          if (layer.id.includes('road-label') || layer.id.includes('highway-name') || layer.id.includes('road_') || layer.id.includes('street')) {
            // Only modify layout/paint if it's a symbol layer (text)
            if (layer.type === 'symbol') {
              // Force minor roads to appear earlier by lowering the minzoom if it exists
              if (layer.minzoom && layer.minzoom > 14) {
                mapInstance.setLayerZoomRange(layer.id, 12, 22);
              }

              try {
                mapInstance.setLayoutProperty(layer.id, 'text-size', [
                  'interpolate', ['linear'], ['zoom'],
                  13, 10,
                  18, 16
                ]);
                // Force visibility of labels that might be hidden by default
                mapInstance.setLayoutProperty(layer.id, 'visibility', 'visible');

                mapInstance.setPaintProperty(layer.id, 'text-color', isDarkRef.current ? '#ffffff' : '#1e293b');
                mapInstance.setPaintProperty(layer.id, 'text-halo-color', isDarkRef.current ? 'rgba(0,0,0,0.8)' : 'rgba(255,255,255,0.8)');
                mapInstance.setPaintProperty(layer.id, 'text-halo-width', 2);
              } catch (e) {
                // Safely ignore
              }
            }
          }
        });
      };

      // Delay slightly and use requestIdleCallback if available for performance
      const labelTimer = setTimeout(() => {
        if (typeof window !== 'undefined' && (window as any).requestIdleCallback) {
          (window as any).requestIdleCallback(() => enhanceStreetLabels());
        } else {
          enhanceStreetLabels();
        }
      }, 2000);
      timersRef.current.push(labelTimer);

      setMapLoaded(true);
    }; // end setupAllLayers

    // Re-apply layers after style swap (theme change)
    map.on('style.load', () => {
      console.log('🎨 Style loaded/swapped, re-applying layers...');
      setupAllLayers(map);
    });


    map.on('error', (e) => {
      // Only log the actual error message, not the entire event object
      if (e?.error?.message) {
        console.warn('⚠️ Map engine warning:', e.error.message);
      }
      // Do NOT call setMapLoaded here — prevents re-render spam
    });

    return () => {
      clearTimeout(safetyTimer);
      // Clear all tracked timers
      timersRef.current.forEach(t => clearTimeout(t));
      timersRef.current = [];

      // Cancel any active animation loops
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
        animFrameRef.current = null;
      }

      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []); // Mount only — map is created once, theme changes use setStyle()

  // Bug 2 Fix: Theme change via setStyle() instead of destroy/recreate
  useEffect(() => {
    isDarkRef.current = isDark; // Always keep ref in sync

    // Skip the first render because the initial style is already provided to the Map constructor
    // This prevents a MapLibre "Cannot read properties of undefined (reading 'shaderPreludeCode')" bug 
    // when setStyle is called concurrently with the map's initial style load.
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    const map = mapRef.current;
    if (!map) return;

    const newStyleUrl = isDark
      ? `https://api.maptiler.com/maps/streets-v2-dark/style.json?key=${maptilerKey}`
      : `https://api.maptiler.com/maps/streets-v2/style.json?key=${maptilerKey}`;

    // Workaround for MapLibre bug: "Cannot read properties of undefined (reading 'shaderPreludeCode')"
    // Disable terrain before hot-swapping style. It gets re-enabled by 'style.load' event
    if (map.getTerrain()) {
      map.setTerrain(null as any); // Disable terrain safely
    }

    // setStyle hot-swaps the style; 'style.load' event will re-apply our custom layers
    map.setStyle(newStyleUrl);
  }, [isDark]);

  // Helper: Reverse Geocoding (Nominatim API)
  const fetchAddress = async (lng: number, lat: number) => {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=id`);
      const data = await res.json();
      return data.address?.road || data.name || data.display_name?.split(',')[0] || `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
    } catch {
      return `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
    }
  };

  // Handle Route Calculation and Drawing
  useEffect(() => {
    const map = mapRef.current;
    if (!map || routePoints.length < 2) return;

    const [start, end] = routePoints;

    const fetchRoute = async () => {
      try {
        // Since MapTiler doesn't have a direct free directions API without a separate key format sometimes, 
        // we use OSRM free public API for proof-of-concept routing.
        const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${start[0]},${start[1]};${end[0]},${end[1]}?overview=full&geometries=geojson`;

        const response = await fetch(osrmUrl);
        const data = await response.json();

        if (data.code !== 'Ok') throw new Error('Route not found');

        const route = data.routes[0];

        const distanceVal = route.distance; // in meters
        const durationVal = Math.max(1, Math.round(route.duration / 60)); // in minutes

        const distanceStr = distanceVal > 1000
          ? `${(distanceVal / 1000).toFixed(1)} km`
          : `${Math.round(distanceVal)} m`;

        setRouteInfo({
          distance: +(distanceVal / 1000).toFixed(2), // km for state
          distanceStr: distanceStr,
          durationCar: Math.max(1, Math.round((distanceVal / 1000) / 40 * 60)), // ~40kmh average
          durationBike: Math.max(1, Math.round((distanceVal / 1000) / 15 * 60)), // ~15kmh average
          durationWalk: Math.max(1, Math.round((distanceVal / 1000) / 5 * 60)), // ~5kmh average
        });

        // 1. Line Feature
        const routeLineFeature = {
          type: 'Feature',
          properties: {},
          geometry: route.geometry
        };

        // 2. Center Label Feature
        // Calculate midpoint along the line using turf
        const line = turf.lineString(route.geometry.coordinates);
        const routeLength = turf.length(line, { units: 'meters' });
        const midpoint = turf.along(line, routeLength / 2, { units: 'meters' });

        const labelFeature = {
          type: 'Feature',
          properties: {
            label: `${distanceStr}\n(~${durationVal} mnt)`
          },
          geometry: midpoint.geometry
        };

        const featureCollection = {
          type: 'FeatureCollection',
          features: [routeLineFeature, labelFeature]
        };

        if (map.getSource('route')) {
          (map.getSource('route') as maplibregl.GeoJSONSource).setData(featureCollection as any);
        } else {
          map.addSource('route', {
            type: 'geojson',
            data: featureCollection as any
          });

          map.addLayer({
            id: 'route-line-casing',
            type: 'line',
            source: 'route',
            filter: ['==', '$type', 'LineString'],
            layout: {
              'line-join': 'round',
              'line-cap': 'round'
            },
            paint: {
              'line-color': isDarkRef.current ? '#1e3a8a' : '#bfdbfe', // Adaptive casing
              'line-width': 8,
              'line-opacity': 0.8
            }
          });

          map.addLayer({
            id: 'route-line',
            type: 'line',
            source: 'route',
            filter: ['==', '$type', 'LineString'],
            layout: {
              'line-join': 'round',
              'line-cap': 'round'
            },
            paint: {
              'line-color': isDarkRef.current ? '#3b82f6' : '#2563eb', // Adaptive core
              'line-width': 4
            }
          });

          // Midpoint Label Layer
          map.addLayer({
            id: 'route-label',
            type: 'symbol',
            source: 'route',
            filter: ['==', '$type', 'Point'],
            layout: {
              'text-field': ['get', 'label'],
              'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
              'text-size': 13,
              'text-justify': 'center',
              'text-anchor': 'center',
              'symbol-placement': 'point',
            },
            paint: {
              'text-color': '#ffffff',
              'text-halo-color': '#1e40af', // Dark blue halo
              'text-halo-width': 2,
            }
          });
        }

        // Fit bounds to show the whole route
        const bounds = route.geometry.coordinates.reduce((acc: any, coord: any) => {
          return acc.extend(coord);
        }, new maplibregl.LngLatBounds(route.geometry.coordinates[0], route.geometry.coordinates[0]));

        map.fitBounds(bounds, { padding: 80, duration: 1500 });

      } catch (err) {
        console.error("Routing error:", err);
      }
    };

    fetchRoute();
  }, [routePoints]);

  // Click Handler for placing routing pins
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const handleMapClick = async (e: maplibregl.MapMouseEvent) => {
      // Only execute routing click logic if routing tool is explicitly active
      if (!isRoutingRef.current) {
        return;
      }

      const { lng, lat } = e.lngLat;
      const newPoints = [...routePointsRef.current];

      if (newPoints.length >= 2) {
        // Reset if we already have 2 points
        newPoints.length = 0;
        setRouteInfo(null);
        setRouteAddresses(['', '']);
        if (map.getSource('route')) {
          (map.getSource('route') as maplibregl.GeoJSONSource).setData({ type: 'FeatureCollection', features: [] } as any);
        }
      }

      newPoints.push([lng, lat]);
      routePointsRef.current = newPoints;
      setRoutePoints([...newPoints]);

      // Fetch Address
      const address = await fetchAddress(lng, lat);
      setRouteAddresses(prev => {
        const newAddrs = [...prev];
        if (newPoints.length === 1) {
          newAddrs[0] = address;
        } else if (newPoints.length === 2) {
          newAddrs[1] = address;
        }
        return newAddrs;
      });

      // Add markers visually
      const markerId = `route-marker-${newPoints.length}`;
      if (map.getSource(markerId)) {
        (map.getSource(markerId) as maplibregl.GeoJSONSource).setData({
          type: 'Feature',
          geometry: { type: 'Point', coordinates: [lng, lat] },
          properties: {}
        } as any);
      } else {
        map.addSource(markerId, {
          type: 'geojson',
          data: {
            type: 'Feature',
            geometry: { type: 'Point', coordinates: [lng, lat] },
            properties: {}
          } as any
        });
        map.addLayer({
          id: markerId,
          type: 'circle',
          source: markerId,
          paint: {
            'circle-radius': 8,
            'circle-color': newPoints.length === 1 ? '#22c55e' : '#ef4444', // Green for start, Red for end
            'circle-stroke-width': 2,
            'circle-stroke-color': '#ffffff'
          }
        });
      }
    };

    map.on('click', handleMapClick);

    return () => {
      map.off('click', handleMapClick);
    };
  }, [mapLoaded, isMeasuring]); // Re-bind when isMeasuring changes to capture it in closure


  // Auto-Geolocation Camera logic (Handled via Ref now)

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
      // Guard: don't add layers if style was completely destroyed
      if (!map.getStyle()) return;

      try {
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
          if (!map.getSource('saribudolok')) {
            map.addSource('saribudolok', { type: 'geojson', data: heroData as any });
          }

          // Animation logic kept only for landmarks
          let step = 0;
          const animate = () => {
            if (!mapRef.current) return;
            step += 0.05;
            const glowRadius = 5 + Math.sin(step) * 2;

            if (map.getLayer('landmarks-pulse')) {
              map.setPaintProperty('landmarks-pulse', 'circle-radius', glowRadius);
            }
            animFrameRef.current = requestAnimationFrame(animate);
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

          if (!map.getSource('boundary-info')) {
            map.addSource('boundary-info', { type: 'geojson', data: boundaryInfoData as any });
          }
          if (!map.getLayer('boundary-info-labels')) {
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
          }

          // V3 Refinement: Outline Only (Floating Neon Line)
          if (!map.getLayer('saribudolok-outline')) {
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
          }

          // Note: saribudolok-body removed to prevent solid blue block

          // V3: Geometric Mesh Grid Layer
          if (!map.getLayer('saribudolok-mesh')) {
            map.addLayer({
              id: 'saribudolok-mesh',
              type: 'line',
              source: 'saribudolok',
              paint: {
                'line-color': isDarkRef.current ? '#60a5fa' : '#2563eb',
                'line-width': 1,
                'line-opacity': 0.3,
                'line-dasharray': [2, 1],
              }
            });
          }


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
          if (!map.getSource('landmarks')) {
            map.addSource('landmarks', landmarkSource);
          }

          if (!map.getLayer('landmarks-pillars')) {
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
          }

          if (!map.getLayer('landmarks-glow')) {
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
          }

          if (!map.getLayer('landmarks-labels')) {
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
          }

          // Hover listeners removed to prevent solid block reappearing



          const coordinates = feature.geometry.coordinates[0];
          const bounds = coordinates.reduce((acc: any, coord: any) => {
            return acc.extend(coord);
          }, new maplibregl.LngLatBounds(coordinates[0], coordinates[0]));

          // Automatic fitBounds disabled to prevent overriding auto-GPS flyTo
          /*
          map.fitBounds(bounds, {
            padding: 120,
            duration: 2500,
            pitch: 65,
            bearing: -20,
          });
          */
        }
      } catch (error) {
        console.warn('⚠️ Map style interrupted during geo data load:', error);
      }
    });
  };

  const handleExportMeasurement = () => {
    if (!measurementResult || !drawRef.current) return;
    const data = drawRef.current.getAll();
    if (data.features.length === 0) return;

    const feature = data.features[0];
    const coords = (feature.geometry as any).coordinates[0] || [];

    let content = `HASIL PENGUKURAN LAHAN 3D MAP\n`;
    content += `=============================\n\n`;
    content += `Lokasi       : Kawasan Saribudolok\n`;
    content += `Luas Tanah   : ${measurementResult.area.toLocaleString('id-ID', { maximumFractionDigits: 2 })} m² (~${(measurementResult.area / 10000).toFixed(4)} Ha) (~${(measurementResult.area / 400).toFixed(2)} Rantai)\n`;
    content += `Keliling     : ${measurementResult.perimeter.toFixed(2)} m\n\n`;
    content += `KOORDINAT BATAS POLYGON (Longitude, Latitude):\n`;
    coords.forEach((c: any, i: number) => {
      // The last coordinate is the same as the first one to close the polygon loop
      if (i === coords.length - 1) {
        content += `Titik Akhir (Tutup) : ${c[0].toFixed(6)}, ${c[1].toFixed(6)}\n`;
      } else {
        content += `Titik Patok ${i + 1}      : ${c[0].toFixed(6)}, ${c[1].toFixed(6)}\n`;
      }
    });

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Pengukuran_Lahan_Saribudolok_${Date.now()}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="relative w-full h-screen bg-slate-950 overflow-hidden">
      <div ref={mapContainerRef} className="absolute inset-0 w-full h-full mapboxgl-canvas" />

      {/* OVERRIDE MAPLIBRE DEFAULT CONTROL POSITIONING */}
      <style dangerouslySetInnerHTML={{
        __html: `
        .maplibregl-ctrl-top-left {
          top: 100px !important;
          left: 20px !important;
        }
        .maplibregl-ctrl-group {
          background-color: ${isDark ? 'rgba(15, 23, 42, 0.8)' : 'rgba(255, 255, 255, 0.9)'} !important;
          backdrop-filter: blur(8px) !important;
          border: 1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'} !important;
          border-radius: 12px !important;
          overflow: hidden !important;
        }
        .maplibregl-ctrl-group button {
          filter: ${isDark ? 'invert(1) hue-rotate(180deg)' : 'none'} !important;
        }
      `}} />

      {/* FLOATING ACTIVE TOOL BANNER */}
      {(isMeasuring || isRouting) && (
        <div className="absolute top-24 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4 px-6 py-3 rounded-full shadow-2xl backdrop-blur-md bg-slate-900/90 border border-blue-500/50">
          <div className="flex items-center gap-2 text-white font-semibold text-sm">
            <div className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse" />
            {isMeasuring ? 'Mode Pengukuran Lahan Aktif' : 'Mode Navigasi Rute Aktif'}
          </div>
          <div className="w-px h-5 bg-slate-700 mx-2" />
          <button
            onClick={() => {
              if (onToolChange) onToolChange(null);
              // We also manually run the internal setToolMode here to ensure cleanup happens
              // if ref wasn't called directly by parent, though it's safer to just rely on parent
              setIsMeasuring(false);
              setIsRouting(false);
              isRoutingRef.current = false;
              drawRef.current?.changeMode('simple_select');
              drawRef.current?.deleteAll();
              setMeasurementResult(null);
              setRoutePoints([]);
              routePointsRef.current = [];
              setRouteInfo(null);
              setRouteAddresses(['', '']);
              const map = mapRef.current;
              if (map) {
                if (map.getSource('route')) (map.getSource('route') as maplibregl.GeoJSONSource).setData({ type: 'FeatureCollection', features: [] } as any);
                for (let i = 1; i <= 2; i++) {
                  if (map.getLayer(`route-marker-${i}`)) map.removeLayer(`route-marker-${i}`);
                  if (map.getSource(`route-marker-${i}`)) map.removeSource(`route-marker-${i}`);
                }
              }
            }}
            className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-xs font-bold text-red-500 transition-colors uppercase tracking-wider"
          >
            <X size={14} />
            Batal
          </button>
        </div>
      )}

      {measurementResult && (
        <div className={`absolute top-28 left-4 w-64 p-4 rounded-2xl border-2 shadow-2xl z-10 transition-all ${isDark ? 'bg-slate-900/90 border-blue-500/50 text-white backdrop-blur-md' : 'bg-white/90 border-blue-500/30 text-slate-900 backdrop-blur-md'
          }`}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
              Hasil Pengukuran
            </h3>
          </div>

          <div className="space-y-3">
            <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <p className="text-[10px] uppercase font-bold text-blue-400 mb-1">Luas Tanah</p>
              <div className="flex flex-col">
                <span className="text-lg font-black">{measurementResult.area.toLocaleString('id-ID', { maximumFractionDigits: 2 })} m²</span>
                <span className="text-xs text-slate-400">
                  ≈ {(measurementResult.area / 10000).toFixed(4)} Ha
                </span>
                <span className="text-xs text-blue-400 font-medium">
                  ≈ {(measurementResult.area / 400).toFixed(2)} Rantai
                </span>
              </div>
            </div>

            <div className={`p-2 rounded-lg border ${isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50/50 border-slate-200'}`}>
              <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Keliling Lahan</p>
              <span className="text-sm font-bold">
                {measurementResult.perimeter > 1000
                  ? `${(measurementResult.perimeter / 1000).toFixed(2)} km`
                  : `${measurementResult.perimeter.toFixed(1)} m`}
              </span>
            </div>
          </div>

          <button
            onClick={handleExportMeasurement}
            className={`mt-4 w-full py-2.5 px-3 rounded-lg flex items-center justify-center gap-2 font-semibold text-xs transition-colors border ${isDark
              ? 'bg-blue-600 hover:bg-blue-500 text-white border-blue-500/50'
              : 'bg-blue-500 hover:bg-blue-600 text-white border-blue-600/50'
              }`}
          >
            <Download size={14} />
            Export Data (.txt)
          </button>

          <p className="mt-3 text-[9px] text-slate-500 text-center leading-tight">
            *Hasil ini adalah estimasi digital.<br />Gunakan jasa survei profesional untuk legalitas.
          </p>
        </div>
      )}

      {/* Loading Overlay */}
      <div className={`absolute inset-0 z-50 flex flex-col items-center justify-center bg-background/95 backdrop-blur-2xl transition-all duration-1000 pointer-events-none ${mapLoaded ? 'opacity-0' : 'opacity-100'}`}>
        <div className="relative">
          <div className="w-24 h-24 border-4 border-blue-500/20 rounded-full animate-spin border-t-blue-500" />
          <Navigation className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-blue-500 animate-pulse" />
        </div>
        <div className="mt-8 text-blue-500 font-black tracking-[0.5em] uppercase text-[10px] animate-pulse">
          Isolating Geographic Sector...
        </div>
      </div>

      {/* Routing UI Overlay - Moved to Left */}
      <div className={`absolute top-24 left-4 z-40 max-w-sm w-full transition-all duration-500 transform ${routePoints.length > 0 ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0 pointer-events-none'}`}>
        <div className={`backdrop-blur-xl border p-5 rounded-2xl shadow-2xl transition-colors duration-300 ${isDark ? 'bg-slate-900/80 border-slate-700/50 shadow-blue-900/10' : 'bg-white/90 border-slate-200/60 shadow-slate-200/50'}`}>
          <h3 className={`font-semibold text-sm mb-4 flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-800'}`}>
            <div className={`p-1.5 rounded-lg ${isDark ? 'bg-blue-500/20' : 'bg-blue-100'}`}>
              <Navigation2 className="w-4 h-4 text-blue-500" />
            </div>
            Navigasi Jarak & Rute
          </h3>

          <div className="space-y-4 relative">
            <div className={`absolute left-[15px] top-5 bottom-5 w-0.5 ${isDark ? 'bg-slate-700/50' : 'bg-slate-200'}`} />

            <div className="flex items-start gap-4 relative z-10">
              <div className={`mt-1 flex-shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center ${isDark ? 'bg-slate-800 border-green-500/50' : 'bg-white border-green-400'}`}>
                <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
              </div>
              <div className="flex-1 min-w-0">
                <span className={`text-[10px] uppercase font-bold tracking-wider block mb-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Lokasi Awal (A)</span>
                <span className={`font-medium truncate block ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
                  {routePoints[0] ? (routeAddresses[0] || 'Mengambil lokasi...') : 'Pilih titik di peta...'}
                </span>
                {routePoints[0] && <span className={`text-[10px] block mt-0.5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{routePoints[0][1].toFixed(5)}, {routePoints[0][0].toFixed(5)}</span>}
              </div>
            </div>

            <div className="flex items-start gap-4 relative z-10">
              <div className={`mt-1 flex-shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center ${isDark ? 'bg-slate-800 border-red-500/50' : 'bg-white border-red-400'}`}>
                <MapPin className="w-4 h-4 text-red-500" fill="currentColor" fillOpacity={0.2} />
              </div>
              <div className="flex-1 min-w-0">
                <span className={`text-[10px] uppercase font-bold tracking-wider block mb-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Tujuan (B)</span>
                <span className={`font-medium truncate block ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
                  {routePoints[1] ? (routeAddresses[1] || 'Mengambil lokasi...') : 'Pilih titik di peta...'}
                </span>
                {routePoints[1] && <span className={`text-[10px] block mt-0.5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{routePoints[1][1].toFixed(5)}, {routePoints[1][0].toFixed(5)}</span>}
              </div>
            </div>
          </div>

          {routeInfo && (
            <div className={`mt-5 pt-4 border-t ${isDark ? 'border-slate-700/50' : 'border-slate-200'}`}>
              <div className="flex items-center justify-between mb-4">
                <span className={`text-sm font-semibold ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>Total Jarak:</span>
                <span className="text-blue-500 font-bold text-xl">{routeInfo.distanceStr}</span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className={`p-2 rounded-lg flex flex-col items-center justify-center text-center ${isDark ? 'bg-slate-800/50' : 'bg-slate-50'}`}>
                  <Car className={`w-4 h-4 mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />
                  <span className="text-[10px] font-bold text-emerald-500">{routeInfo.durationCar} mnt</span>
                </div>
                <div className={`p-2 rounded-lg flex flex-col items-center justify-center text-center ${isDark ? 'bg-slate-800/50' : 'bg-slate-50'}`}>
                  <Bike className={`w-4 h-4 mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />
                  <span className="text-[10px] font-bold text-emerald-500">{routeInfo.durationBike} mnt</span>
                </div>
                <div className={`p-2 rounded-lg flex flex-col items-center justify-center text-center ${isDark ? 'bg-slate-800/50' : 'bg-slate-50'}`}>
                  <Footprints className={`w-4 h-4 mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />
                  <span className="text-[10px] font-bold text-emerald-500">{routeInfo.durationWalk} mnt</span>
                </div>
              </div>
            </div>
          )}

          {routePoints.length > 0 && (
            <button
              onClick={() => {
                setRoutePoints([]);
                routePointsRef.current = [];
                setRouteInfo(null);
                setRouteAddresses(['', '']);
                const map = mapRef.current;
                if (map) {
                  if (map.getSource('route')) (map.getSource('route') as maplibregl.GeoJSONSource).setData({ type: 'FeatureCollection', features: [] } as any);
                  if (map.getSource('route-marker-1')) (map.getSource('route-marker-1') as maplibregl.GeoJSONSource).setData({ type: 'FeatureCollection', features: [] } as any);
                  if (map.getSource('route-marker-2')) (map.getSource('route-marker-2') as maplibregl.GeoJSONSource).setData({ type: 'FeatureCollection', features: [] } as any);
                }
              }}
              className={`mt-4 w-full py-2.5 text-sm font-semibold rounded-lg transition-colors ${isDark
                ? 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-800'
                }`}
            >
              Tutup / Reset
            </button>
          )}
        </div>
      </div>
    </div>
  );
});

export default Map3D;

/* ═══════════════════════════════════════════════════
   MapView — Core MapLibre GL JS map component
   ═══════════════════════════════════════════════════ */

import { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import { MAP_CONFIG, SATELLITE_SOURCE, TOPO_SOURCE, LAYER_IDS } from '../config/mapConfig';
import { addFossilLayers, toggleFossilLayers } from '../layers/fossilLayer';

export default function MapView({
  mapRef,
  onMapReady,
  layers,
  baseMap,
  fossilData,
  onFeatureClick,
}) {
  const containerRef = useRef(null);
  const dataLoadedRef = useRef({ fossils: false });

  // Initialize Map
  useEffect(() => {
    if (!containerRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      ...MAP_CONFIG,
      attributionControl: false,
    });

    map.addControl(new maplibregl.NavigationControl({ showCompass: true, showZoom: true }), 'top-right');

    // Scale control
    map.addControl(new maplibregl.ScaleControl({
      maxWidth: 120,
      unit: 'metric'
    }), 'bottom-left');

    map.on('load', () => {
      mapRef.current = map;
      onMapReady(map);
    });

    return () => {
      mapRef.current = null;
      map.remove();
    };
  }, []);

  // Handle fossil data
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !fossilData || dataLoadedRef.current.fossils) return;

    try {
      addFossilLayers(map, fossilData);
      dataLoadedRef.current.fossils = true;

      // Click handler for individual fossil points
      map.on('click', LAYER_IDS.FOSSILS_POINT, (e) => {
        if (e.features && e.features.length > 0) {
          const feature = e.features[0];
          onFeatureClick({
            type: 'Feature',
            geometry: feature.geometry,
            properties: feature.properties
          });
        }
      });
    } catch (err) {
      console.error('Failed to add fossil layers:', err);
    }
  }, [fossilData]);

  // Toggle fossil layer visibility
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (dataLoadedRef.current.fossils) toggleFossilLayers(map, layers.fossils);
  }, [layers.fossils]);

  // Base map toggle (satellite / streets / topo)
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;

    // Add satellite source if not present
    if (!map.getSource('satellite')) {
      map.addSource('satellite', SATELLITE_SOURCE);
      map.addLayer({
        id: LAYER_IDS.SATELLITE,
        type: 'raster',
        source: 'satellite',
        paint: { 'raster-opacity': 1 },
        layout: { 'visibility': 'none' }
      }, map.getStyle().layers[1]?.id);
    }

    // Add topo source if not present
    if (!map.getSource('topo')) {
      map.addSource('topo', TOPO_SOURCE);
      map.addLayer({
        id: LAYER_IDS.TOPO,
        type: 'raster',
        source: 'topo',
        paint: { 'raster-opacity': 1 },
        layout: { 'visibility': 'none' }
      }, map.getStyle().layers[1]?.id);
    }

    // Show/hide layers based on selection
    const layerMap = {
      streets: LAYER_IDS.STREETS,
      satellite: LAYER_IDS.SATELLITE,
      topo: LAYER_IDS.TOPO,
    };

    Object.entries(layerMap).forEach(([key, layerId]) => {
      if (map.getLayer(layerId)) {
        map.setLayoutProperty(
          layerId,
          'visibility',
          key === baseMap ? 'visible' : 'none'
        );
      }
    });
  }, [baseMap]);

  return (
    <div ref={containerRef} className="absolute inset-0 w-full h-full" />
  );
}

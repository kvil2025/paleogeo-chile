/* ═══════════════════════════════════════════════════
   MapView — Core MapLibre GL JS map component
   ═══════════════════════════════════════════════════ */

import { useEffect, useRef, useCallback } from 'react';
import maplibregl from 'maplibre-gl';
import { MAP_CONFIG, SATELLITE_SOURCE, TOPO_SOURCE, LAYER_IDS } from '../config/mapConfig';
import { addFossilLayers, toggleFossilLayers } from '../layers/fossilLayer';
import {
  POT_SOURCE_ID,
  POT_FILL_LAYER_ID,
  POT_OUTLINE_LAYER_ID,
  loadPotencialidadData,
  addPotencialidadLayers,
  setPotencialidadVisibility,
  setPotencialidadOpacity,
} from '../layers/potencialidadLayer';

export default function MapView({
  mapRef,
  onMapReady,
  layers,
  baseMap,
  fossilData,
  onFeatureClick,
  geologyOpacity,
  onGeologyLoadProgress,
}) {
  const containerRef = useRef(null);
  const dataLoadedRef = useRef({ fossils: false, geology: false });
  const abortRef = useRef(null);

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
      abortRef.current?.abort();
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

  // ── CMN/SERNAGEOMIN Potencialidad Paleontológica ──────────────
  const addGeologyLayer = useCallback(async (map) => {
    if (dataLoadedRef.current.geology) return;

    // Cancel any previous load
    abortRef.current?.abort();
    abortRef.current = new AbortController();

    onGeologyLoadProgress?.(0, 14);

    try {
      const geojson = await loadPotencialidadData(
        abortRef.current.signal,
        (loaded, total) => onGeologyLoadProgress?.(loaded, total)
      );

      if (abortRef.current.signal.aborted) return;

      // Find first fossil layer to insert below
      const firstFossilLayer = map.getStyle().layers.find(l =>
        l.id.startsWith('fossil') || l.id.startsWith(LAYER_IDS.FOSSILS_CLUSTER ?? 'fossil')
      );

      addPotencialidadLayers(map, geojson, geologyOpacity, firstFossilLayer?.id);
      dataLoadedRef.current.geology = true;
      onGeologyLoadProgress?.(14, 14); // done
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error('[potencialidad] Error cargando capa:', err);
      }
    }
  }, [geologyOpacity]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (layers.geology) {
      if (!dataLoadedRef.current.geology) {
        addGeologyLayer(map);
      } else {
        setPotencialidadVisibility(map, true);
      }
    } else {
      if (dataLoadedRef.current.geology) {
        setPotencialidadVisibility(map, false);
      }
    }
  }, [layers.geology, addGeologyLayer]);

  // Update geology opacity
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !dataLoadedRef.current.geology) return;
    setPotencialidadOpacity(map, geologyOpacity);
  }, [geologyOpacity]);

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

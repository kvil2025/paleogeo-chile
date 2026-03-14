/* ═══════════════════════════════════════════════════
   MapView — Core MapLibre GL JS map component
   ═══════════════════════════════════════════════════ */

import { useEffect, useRef, useCallback } from 'react';
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
  geologyOpacity,
}) {
  const containerRef = useRef(null);
  const dataLoadedRef = useRef({ fossils: false, geology: false });

  // BGS World Geology WMS — covers Chile at 1:5M scale (free, OGC standard)
  const BGS_WMS_URL =
    'https://ogc.bgs.ac.uk/cgi-bin/BGS_Bedrock_and_Resurficial_Geology/wms?' +
    'SERVICE=WMS&VERSION=1.3.0&REQUEST=GetMap' +
    '&LAYERS=GBG%3AWORLD_BEDROCK_GEOL_1_5M&STYLES=default' +
    '&FORMAT=image%2Fpng&TRANSPARENT=true&CRS={crs}' +
    '&WIDTH={width}&HEIGHT={height}&BBOX={bbox}';

  const GEO_SOURCE_ID = 'bgs-geology';
  const GEO_LAYER_ID  = 'bgs-geology-layer';

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

  // Add / toggle BGS Geology WMS
  const addGeologyLayer = useCallback((map) => {
    if (dataLoadedRef.current.geology) return;
    if (map.getSource(GEO_SOURCE_ID)) return;

    map.addSource(GEO_SOURCE_ID, {
      type: 'raster',
      tiles: [
        'https://ogc.bgs.ac.uk/cgi-bin/BGS_Bedrock_and_Resurficial_Geology/wms?' +
        'SERVICE=WMS&VERSION=1.1.1&REQUEST=GetMap' +
        '&LAYERS=GBG%3AWORLD_BEDROCK_GEOL_1_5M&STYLES=&FORMAT=image%2Fpng&TRANSPARENT=TRUE' +
        '&SRS=EPSG:3857&WIDTH=256&HEIGHT=256&BBOX={bbox-epsg-3857}'
      ],
      tileSize: 256,
      attribution: '© BGS / OneGeology — geología mundial 1:5M'
    });

    // Insert geology layer BELOW fossil layers so fossils stay on top
    const firstFossilLayer = map.getStyle().layers.find(l => l.id.startsWith('fossil'));
    map.addLayer({
      id: GEO_LAYER_ID,
      type: 'raster',
      source: GEO_SOURCE_ID,
      paint: {
        'raster-opacity': geologyOpacity,
        'raster-fade-duration': 300,
      },
      layout: { visibility: 'visible' },
    }, firstFossilLayer?.id);

    dataLoadedRef.current.geology = true;
  }, [geologyOpacity]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (layers.geology) {
      if (!dataLoadedRef.current.geology) {
        addGeologyLayer(map);
      } else {
        if (map.getLayer(GEO_LAYER_ID))
          map.setLayoutProperty(GEO_LAYER_ID, 'visibility', 'visible');
      }
    } else {
      if (map.getLayer(GEO_LAYER_ID))
        map.setLayoutProperty(GEO_LAYER_ID, 'visibility', 'none');
    }
  }, [layers.geology, addGeologyLayer]);

  // Update geology opacity
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.getLayer(GEO_LAYER_ID)) return;
    map.setPaintProperty(GEO_LAYER_ID, 'raster-opacity', geologyOpacity);
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

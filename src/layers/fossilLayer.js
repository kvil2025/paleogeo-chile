/* ═══════════════════════════════════════════════════
   Fossil Layer — Paleobiology Database (PBDB)
   ═══════════════════════════════════════════════════ */

import { LAYER_IDS } from '../config/mapConfig';

const PBDB_URL = 'https://paleobiodb.org/data1.2/occs/list.json?country=CL&show=coords,ident,class,strat&limit=all';

/**
 * Fetch fossil occurrence data from PBDB and convert to GeoJSON
 */
export async function fetchFossilData() {
  const response = await fetch(PBDB_URL);
  if (!response.ok) throw new Error(`PBDB API error: ${response.status}`);
  const data = await response.json();
  
  const features = (data.records || [])
    .filter(r => r.lng != null && r.lat != null)
    .map(record => ({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [parseFloat(record.lng), parseFloat(record.lat)]
      },
      properties: {
        id: record.oid,
        oid: record.oid,
        name: record.tna || 'Taxón desconocido',
        rank: record.rnk || '',
        phylum: record.phl || '',
        class: record.cll || '',
        order: record.odl || '',
        family: record.fml || '',
        period: record.oei || 'Desconocido',
        epoch: record.eag || '',
        formation: record.sfm || record.fmn || '',
        environment: record.jev || '',
        ref_id: record.rid,
        identified_by: record.idn || '',
        early_age: parseFloat(record.eag) || null,
        late_age: parseFloat(record.lag) || null,
        type: 'fossil'
      }
    }));

  return {
    type: 'FeatureCollection',
    features
  };
}

/**
 * Add fossil source + layers to the map
 */
export function addFossilLayers(map, geojson) {
  // GeoJSON source with clustering
  map.addSource('fossils', {
    type: 'geojson',
    data: geojson,
    cluster: true,
    clusterMaxZoom: 14,
    clusterRadius: 55,
    clusterProperties: {
      sum: ['+', 1]
    }
  });

  // Cluster circles
  map.addLayer({
    id: LAYER_IDS.FOSSILS_CLUSTER,
    type: 'circle',
    source: 'fossils',
    filter: ['has', 'point_count'],
    paint: {
      'circle-color': [
        'step', ['get', 'point_count'],
        '#FCD34D',   // < 20: amber
        20, '#F59E0B', // 20-100: darker amber
        100, '#D97706', // 100-500: dark amber
        500, '#B45309'  // 500+: deep amber
      ],
      'circle-radius': [
        'step', ['get', 'point_count'],
        18,   // < 20
        20, 24,  // 20-100
        100, 30, // 100-500
        500, 38  // 500+
      ],
      'circle-stroke-width': 2,
      'circle-stroke-color': 'rgba(252, 211, 77, 0.3)',
      'circle-opacity': 0.9
    }
  });

  // Cluster count labels
  map.addLayer({
    id: LAYER_IDS.FOSSILS_COUNT,
    type: 'symbol',
    source: 'fossils',
    filter: ['has', 'point_count'],
    layout: {
      'text-field': '{point_count_abbreviated}',
      'text-size': 12,
      'text-font': ['Open Sans Regular'],
      'text-allow-overlap': true
    },
    paint: {
      'text-color': '#1e293b'
    }
  });

  // Individual fossil points
  map.addLayer({
    id: LAYER_IDS.FOSSILS_POINT,
    type: 'circle',
    source: 'fossils',
    filter: ['!', ['has', 'point_count']],
    paint: {
      'circle-color': '#FCD34D',
      'circle-radius': [
        'interpolate', ['linear'], ['zoom'],
        5, 4,
        10, 7,
        15, 10
      ],
      'circle-stroke-width': 2,
      'circle-stroke-color': '#92400E',
      'circle-opacity': 0.9
    }
  });

  // Click on cluster → zoom in
  map.on('click', LAYER_IDS.FOSSILS_CLUSTER, (e) => {
    const features = map.queryRenderedFeatures(e.point, {
      layers: [LAYER_IDS.FOSSILS_CLUSTER]
    });
    const clusterId = features[0].properties.cluster_id;
    map.getSource('fossils').getClusterExpansionZoom(clusterId).then(zoom => {
      map.easeTo({
        center: features[0].geometry.coordinates,
        zoom: zoom
      });
    });
  });

  // Cursor pointer on clusters/points
  map.on('mouseenter', LAYER_IDS.FOSSILS_CLUSTER, () => { map.getCanvas().style.cursor = 'pointer'; });
  map.on('mouseleave', LAYER_IDS.FOSSILS_CLUSTER, () => { map.getCanvas().style.cursor = ''; });
  map.on('mouseenter', LAYER_IDS.FOSSILS_POINT, () => { map.getCanvas().style.cursor = 'pointer'; });
  map.on('mouseleave', LAYER_IDS.FOSSILS_POINT, () => { map.getCanvas().style.cursor = ''; });
}

/**
 * Toggle fossil layers visibility
 */
export function toggleFossilLayers(map, visible) {
  const visibility = visible ? 'visible' : 'none';
  [LAYER_IDS.FOSSILS_CLUSTER, LAYER_IDS.FOSSILS_COUNT, LAYER_IDS.FOSSILS_POINT].forEach(id => {
    if (map.getLayer(id)) {
      map.setLayoutProperty(id, 'visibility', visibility);
    }
  });
}

/**
 * Filter fossils by geological period
 * @param {object} map - MapLibre map instance
 * @param {object} fullGeoJSON - Complete unfiltered GeoJSON
 * @param {string|null} periodKey - Period key (e.g. 'Cretaceous') or null for all
 */
export function filterFossilsByPeriod(map, fullGeoJSON, periodKey) {
  const source = map.getSource('fossils');
  if (!source) return;

  if (!periodKey) {
    // Show all
    source.setData(fullGeoJSON);
    return;
  }

  // Filter features whose period matches (PBDB 'oei' field)
  const filtered = {
    type: 'FeatureCollection',
    features: fullGeoJSON.features.filter(f => {
      const p = f.properties.period;
      if (!p) return false;
      // Match by period key (English name from PBDB)
      return p.toLowerCase().includes(periodKey.toLowerCase());
    })
  };

  source.setData(filtered);
}

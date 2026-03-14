/* ═══════════════════════════════════════════════════════════════
   Capa de Potencialidad Paleontológica — CMN / SERNAGEOMIN
   Consume los FeatureServer de ArcGIS Online (services2.arcgis.com)
   ═══════════════════════════════════════════════════════════════ */

const BASE_URL = 'https://services2.arcgis.com/mQ0T5ijzGExuCc9o/ArcGIS/rest/services';

// Servicios regionales de Potencialidad Paleontológica V2
const REGIONAL_SERVICES = [
  '15_Arica_y_Parinacota_VP2_0',
  '01_Tarapacá_VP2_0',
  '02_Antofagasta_VP2_0',
  '03_Atacama_VP2_0',
  '04_Coquimbo_VP2_0',
  '04_Valparaíso_VP2_0_WFL1',
  '13_Metropolitana_V2_0',
  '06_OHiggins_VP2_0',
  '07_Maule_VP2_0',
  '16_Ñuble_VP2_0',
  '08_Biobio_VP2_0',
  '09_ARAUCANÍA_VP2_0',
  '14_Los_Rios_VP2_0',
  '10_Los_Lagos_VP2_V3_WFL1',
];

// Paleta de colores basada en el nivel de potencial (CMN usa estos términos)
export const POTENCIAL_COLORS = {
  'Fosilífero':           '#e63946', // rojo vivo — yacimiento conocido
  'Alto':                 '#ff6b35', // naranja
  'Medio':                '#f4a261', // ámbar
  'Bajo':                 '#f1c40f', // amarillo
  'Moderado':             '#f4a261', // ámbar (alias)
  'Sin Potencial':        '#2d6a4f', // verde oscuro
  'Sin potencial':        '#2d6a4f',
  'Sin información':      '#6c757d', // gris
};

const POTENCIAL_ORDER = [
  'Fosilífero', 'Alto', 'Medio', 'Moderado', 'Bajo', 'Sin Potencial', 'Sin potencial', 'Sin información'
];

// Construye expresión MapLibre step/match para colorear por POTENCIAL
function buildColorExpression() {
  const matchExpr = ['match', ['get', 'POTENCIAL']];
  POTENCIAL_ORDER.forEach(key => {
    matchExpr.push(key, POTENCIAL_COLORS[key] || '#999');
  });
  matchExpr.push('#999'); // default
  return matchExpr;
}

/**
 * Fetch GeoJSON desde un FeatureServer regional del CMN.
 * Usa paginación si hay más de 1000 features.
 */
async function fetchRegionalLayer(serviceName, signal) {
  const allFeatures = [];
  let offset = 0;
  const pageSize = 1000;

  while (true) {
    const url =
      `${BASE_URL}/${encodeURIComponent(serviceName)}/FeatureServer/0/query?` +
      `where=1%3D1&outFields=POTENCIAL%2CNOMBRE%2CREFERENCIA%2CVERSIÓN%2CÁREA` +
      `&outSR=4326&f=geojson&resultRecordCount=${pageSize}&resultOffset=${offset}`;

    const res = await fetch(url, { signal });
    if (!res.ok) throw new Error(`HTTP ${res.status} for ${serviceName}`);

    const data = await res.json();
    if (!data.features || data.features.length === 0) break;

    allFeatures.push(...data.features);

    // Si excedió el límite de transferencia o hay más registros
    if (!data.properties?.exceededTransferLimit || data.features.length < pageSize) break;
    offset += pageSize;
  }

  return allFeatures;
}

/**
 * Carga todas las capas regionales en paralelo y retorna un GeoJSON FeatureCollection.
 * @param {AbortSignal} signal  — para cancelar fetch si el mapa se desmonta
 * @param {Function} onProgress — callback(loaded, total)
 */
export async function loadPotencialidadData(signal, onProgress) {
  const total = REGIONAL_SERVICES.length;
  let loaded = 0;
  const allFeatures = [];

  await Promise.allSettled(
    REGIONAL_SERVICES.map(async (service) => {
      try {
        const features = await fetchRegionalLayer(service, signal);
        allFeatures.push(...features);
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.warn(`[potencialidad] ${service} falló:`, err.message);
        }
      } finally {
        loaded++;
        onProgress?.(loaded, total);
      }
    })
  );

  return {
    type: 'FeatureCollection',
    features: allFeatures,
  };
}

export const POT_SOURCE_ID = 'cmn-potencialidad';
export const POT_FILL_LAYER_ID = 'cmn-potencialidad-fill';
export const POT_OUTLINE_LAYER_ID = 'cmn-potencialidad-outline';

/**
 * Agrega las capas de potencialidad al mapa.
 * @param {maplibregl.Map} map
 * @param {Object} geojson  — FeatureCollection combinada
 * @param {number} opacity  — 0-1
 * @param {string|null} beforeLayerId — capas de fósiles para insertar debajo
 */
export function addPotencialidadLayers(map, geojson, opacity = 0.65, beforeLayerId) {
  // Limpiar si ya existe (reload)
  if (map.getLayer(POT_OUTLINE_LAYER_ID)) map.removeLayer(POT_OUTLINE_LAYER_ID);
  if (map.getLayer(POT_FILL_LAYER_ID))    map.removeLayer(POT_FILL_LAYER_ID);
  if (map.getSource(POT_SOURCE_ID))       map.removeSource(POT_SOURCE_ID);

  map.addSource(POT_SOURCE_ID, {
    type: 'geojson',
    data: geojson,
    attribution: '© CMN · SERNAGEOMIN — Potencialidad Paleontológica 2024',
  });

  // Capa de relleno
  map.addLayer({
    id: POT_FILL_LAYER_ID,
    type: 'fill',
    source: POT_SOURCE_ID,
    paint: {
      'fill-color': buildColorExpression(),
      'fill-opacity': opacity,
    },
    layout: { visibility: 'visible' },
  }, beforeLayerId);

  // Capa de contorno
  map.addLayer({
    id: POT_OUTLINE_LAYER_ID,
    type: 'line',
    source: POT_SOURCE_ID,
    paint: {
      'line-color': 'rgba(0,0,0,0.25)',
      'line-width': 0.5,
    },
    layout: { visibility: 'visible' },
  }, beforeLayerId);
}

export function setPotencialidadVisibility(map, visible) {
  const v = visible ? 'visible' : 'none';
  if (map.getLayer(POT_FILL_LAYER_ID))    map.setLayoutProperty(POT_FILL_LAYER_ID,    'visibility', v);
  if (map.getLayer(POT_OUTLINE_LAYER_ID)) map.setLayoutProperty(POT_OUTLINE_LAYER_ID, 'visibility', v);
}

export function setPotencialidadOpacity(map, opacity) {
  if (map.getLayer(POT_FILL_LAYER_ID))
    map.setPaintProperty(POT_FILL_LAYER_ID, 'fill-opacity', opacity);
}

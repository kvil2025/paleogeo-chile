/* ═══════════════════════════════════════════════════
   PaleoGeo Chile — Map Configuration
   ═══════════════════════════════════════════════════ */

export const MAP_CONFIG = {
  center: [-70.66, -33.45],
  zoom: 5,
  minZoom: 3,
  maxZoom: 18,
  pitch: 0,
  bearing: 0,
  maxBounds: [[-85, -60], [-55, -15]],
  style: {
    version: 8,
    name: 'PaleoGeo Dark',
    glyphs: 'https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf',
    sources: {
      'carto-dark': {
        type: 'raster',
        tiles: [
          'https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png',
          'https://b.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png',
          'https://c.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png'
        ],
        tileSize: 256,
        attribution: '&copy; <a href="https://carto.com">CARTO</a> &copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
      }
    },
    layers: [
      {
        id: 'carto-dark-layer',
        type: 'raster',
        source: 'carto-dark',
        minzoom: 0,
        maxzoom: 22
      }
    ]
  }
};

export const SATELLITE_SOURCE = {
  type: 'raster',
  tiles: [
    'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
  ],
  tileSize: 256,
  attribution: '&copy; <a href="https://www.esri.com/">Esri</a> &mdash; Source: Esri, Maxar, Earthstar Geographics'
};

export const TOPO_SOURCE = {
  type: 'raster',
  tiles: [
    'https://a.tile.opentopomap.org/{z}/{x}/{y}.png',
    'https://b.tile.opentopomap.org/{z}/{x}/{y}.png',
    'https://c.tile.opentopomap.org/{z}/{x}/{y}.png'
  ],
  tileSize: 256,
  attribution: '&copy; <a href="https://opentopomap.org">OpenTopoMap</a> (CC-BY-SA)'
};

export const STREETS_SOURCE = {
  type: 'raster',
  tiles: [
    'https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png',
    'https://b.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png',
    'https://c.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png'
  ],
  tileSize: 256,
  attribution: '&copy; CARTO &copy; OSM'
};

// Geological periods color lookup
export const PERIOD_COLORS = {
  'Cretaceous':   '#7CFC00',
  'Jurassic':     '#00BFFF',
  'Triassic':     '#9370DB',
  'Permian':      '#F4A460',
  'Carboniferous':'#808080',
  'Devonian':     '#B8860B',
  'Silurian':     '#8FBC8F',
  'Ordovician':   '#009966',
  'Cambrian':     '#7B9F35',
  'Neogene':      '#FFD700',
  'Paleogene':    '#FFA500',
  'Miocene':      '#FFD700',
  'Eocene':       '#FFA500',
  'Oligocene':    '#FFB347',
  'Pleistocene':  '#FFFACD',
  'Holocene':     '#FFEFD5',
  'Pliocene':     '#F0E68C',
};

export const LAYER_IDS = {
  GEOLOGY: 'geologia-layer',
  FOSSILS_CLUSTER: 'fossils-clusters',
  FOSSILS_COUNT: 'fossils-cluster-count',
  FOSSILS_POINT: 'fossils-unclustered',
  FOSSILS_LABEL: 'fossils-label',
  ARCHAEOLOGY: 'archaeology-points',
  ARCHAEOLOGY_LABEL: 'archaeology-label',
  SATELLITE: 'satellite-layer',
  TOPO: 'topo-layer',
  STREETS: 'carto-dark-layer',
};

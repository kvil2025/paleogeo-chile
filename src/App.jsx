/* ═══════════════════════════════════════════════════
   PaleoGeo Chile — Main Application
   ═══════════════════════════════════════════════════ */

import { useState, useRef, useCallback } from 'react';
import MapView from './components/MapView';
import LayerPanel from './components/LayerPanel';
import InfoPanel from './components/InfoPanel';
import LoadingOverlay from './components/LoadingOverlay';
import StatusBar from './components/StatusBar';
import TimescaleBar from './components/TimescaleBar';
import { fetchFossilData, filterFossilsByPeriod } from './layers/fossilLayer';

export default function App() {
  const mapRef = useRef(null);

  // Loading state
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [showLoading, setShowLoading] = useState(true);
  const [isDataLoading, setIsDataLoading] = useState(true);

  // Data
  const [fossilData, setFossilData] = useState(null);
  const [fossilCount, setFossilCount] = useState(0);

  // UI State
  const [layers, setLayers] = useState({
    fossils: true,
    geology: false,
  });
  const [geologyOpacity, setGeologyOpacity] = useState(0.65);
  const [geologyLoadProgress, setGeologyLoadProgress] = useState({ loaded: 0, total: 14, done: false });
  const [baseMap, setBaseMap] = useState('streets');
  const [selectedFeature, setSelectedFeature] = useState(null);
  const [activePeriod, setActivePeriod] = useState(null);

  // Handle map ready → load data
  const handleMapReady = useCallback(async (map) => {
    setLoadingProgress(20);

    try {
      setLoadingProgress(40);

      const fossils = await fetchFossilData();

      setLoadingProgress(80);

      setFossilData(fossils);
      setFossilCount(fossils.features.length);

      setLoadingProgress(100);
      setIsDataLoading(false);

      // Dismiss loading overlay after animation
      setTimeout(() => setShowLoading(false), 800);

    } catch (err) {
      console.error('Data loading error:', err);
      setLoadingProgress(100);
      setIsDataLoading(false);
      setTimeout(() => setShowLoading(false), 800);
    }
  }, []);

  // Layer toggle handler
  const handleToggleLayer = useCallback((layerName) => {
    setLayers(prev => ({ ...prev, [layerName]: !prev[layerName] }));
  }, []);

  // Feature click handler
  const handleFeatureClick = useCallback((feature) => {
    setSelectedFeature(feature);

    // Fly to feature
    if (mapRef.current && feature.geometry) {
      mapRef.current.flyTo({
        center: feature.geometry.coordinates,
        zoom: Math.max(mapRef.current.getZoom(), 12),
        duration: 1000,
      });
    }
  }, []);

  // Close info panel
  const handleCloseInfo = useCallback(() => {
    setSelectedFeature(null);
  }, []);

  // Period filter handler
  const handlePeriodChange = useCallback((periodKey) => {
    setActivePeriod(periodKey);
    if (mapRef.current && fossilData) {
      filterFossilsByPeriod(mapRef.current, fossilData, periodKey);
    }
  }, [fossilData]);

  return (
    <div className="relative w-full h-full overflow-hidden bg-[var(--color-surface-900)]">
      {/* Loading Overlay */}
      <LoadingOverlay progress={loadingProgress} isVisible={showLoading} />

      {/* Map */}
      <MapView
        mapRef={mapRef}
        onMapReady={handleMapReady}
        layers={layers}
        baseMap={baseMap}
        fossilData={fossilData}
        onFeatureClick={handleFeatureClick}
        geologyOpacity={geologyOpacity}
        onGeologyLoadProgress={(loaded, total) =>
          setGeologyLoadProgress({ loaded, total, done: loaded >= total })
        }
      />

      {/* Status Bar */}
      {!showLoading && (
        <StatusBar
          fossilCount={fossilCount}
          isLoading={isDataLoading}
        />
      )}

      {/* Layer Panel */}
      {!showLoading && (
        <LayerPanel
          layers={layers}
          onToggleLayer={handleToggleLayer}
          baseMap={baseMap}
          onBaseMapChange={setBaseMap}
          fossilCount={fossilCount}
          geologyOpacity={geologyOpacity}
          onGeologyOpacityChange={setGeologyOpacity}
          geologyLoadProgress={geologyLoadProgress}
        />
      )}

      {/* Geological Timescale Bar */}
      {!showLoading && layers.fossils && (
        <TimescaleBar
          activePeriod={activePeriod}
          onPeriodChange={handlePeriodChange}
        />
      )}

      {/* Info Panel */}
      {selectedFeature && (
        <InfoPanel feature={selectedFeature} onClose={handleCloseInfo} />
      )}
    </div>
  );
}

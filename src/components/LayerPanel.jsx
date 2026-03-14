/* ═══════════════════════════════════════════════════
   Layer Panel — Glassmorphism floating control
   ═══════════════════════════════════════════════════ */

import { useState, useRef, useEffect } from 'react';
import { Icons } from './Icons';
import { POTENCIAL_COLORS } from '../layers/potencialidadLayer';

// Legend items for Potencialidad Paleontológica
const LEGEND_ITEMS = [
  { label: 'Fosilífero',     color: POTENCIAL_COLORS['Fosilífero'] },
  { label: 'Alto',           color: POTENCIAL_COLORS['Alto'] },
  { label: 'Medio',          color: POTENCIAL_COLORS['Medio'] },
  { label: 'Bajo',           color: POTENCIAL_COLORS['Bajo'] },
  { label: 'Sin Potencial',  color: POTENCIAL_COLORS['Sin Potencial'] },
  { label: 'Sin datos',      color: POTENCIAL_COLORS['Sin información'] },
];

export default function LayerPanel({
  layers,
  onToggleLayer,
  baseMap,
  onBaseMapChange,
  fossilCount,
  geologyOpacity,
  onGeologyOpacityChange,
  geologyLoadProgress,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const panelRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Derive loading state
  const geoLoading = layers.geology &&
    geologyLoadProgress &&
    !geologyLoadProgress.done &&
    geologyLoadProgress.loaded < geologyLoadProgress.total;
  const geoProgress = geologyLoadProgress
    ? Math.round((geologyLoadProgress.loaded / geologyLoadProgress.total) * 100)
    : 0;

  return (
    <div ref={panelRef} className="fixed bottom-20 right-4 z-50 flex flex-col items-end gap-3">
      {/* Panel */}
      {isOpen && (
        <div className="glass rounded-2xl p-5 w-[300px] animate-scale-in origin-bottom-right"
          style={{ boxShadow: '0 16px 48px rgba(0,0,0,0.5)' }}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-[var(--color-text-primary)] tracking-wide uppercase">
              Capas del Mapa
            </h3>
            <button
              onClick={() => setIsOpen(false)}
              className="touch-target rounded-lg hover:bg-white/5 transition-colors"
              aria-label="Cerrar panel"
            >
              {Icons.close}
            </button>
          </div>

          {/* Base Map Toggle */}
          <div className="mb-4 pb-4 border-b border-[var(--color-glass-border)]">
            <p className="text-xs text-[var(--color-text-muted)] mb-2 uppercase tracking-wider font-medium">
              Mapa Base
            </p>
            <div className="grid grid-cols-3 gap-2">
              <BaseMapButton
                active={baseMap === 'streets'}
                onClick={() => onBaseMapChange('streets')}
                icon={Icons.map}
                label="Calles"
              />
              <BaseMapButton
                active={baseMap === 'satellite'}
                onClick={() => onBaseMapChange('satellite')}
                icon={Icons.satellite}
                label="Satélite"
              />
              <BaseMapButton
                active={baseMap === 'topo'}
                onClick={() => onBaseMapChange('topo')}
                icon={Icons.mountain}
                label="Topo"
              />
            </div>
          </div>

          {/* Data Layers */}
          <div className="space-y-3">
            <p className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider font-medium">
              Datos
            </p>

            {/* Fossils */}
            <LayerToggle
              color="#FCD34D"
              icon={Icons.fossil}
              label="Fósiles"
              sublabel={fossilCount > 0 ? `${fossilCount.toLocaleString()} registros` : 'Cargando...'}
              checked={layers.fossils}
              onChange={() => onToggleLayer('fossils')}
            />

            {/* Potencialidad Paleontológica CMN */}
            <LayerToggle
              color="#6EE7B7"
              icon={Icons.geology}
              label="Potencialidad Paleontológica"
              sublabel={
                geoLoading
                  ? `Cargando ${geologyLoadProgress.loaded}/${geologyLoadProgress.total} regiones…`
                  : layers.geology && geologyLoadProgress?.done
                    ? 'CMN · SERNAGEOMIN 2024'
                    : 'CMN · SERNAGEOMIN 2024'
              }
              checked={layers.geology}
              onChange={() => onToggleLayer('geology')}
            />

            {/* Progress bar while loading */}
            {geoLoading && (
              <div className="pl-11 pr-2">
                <div className="h-1 rounded-full bg-[var(--color-surface-600)] overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${geoProgress}%`,
                      background: 'linear-gradient(to right, #6EE7B7, #34D399)',
                    }}
                  />
                </div>
              </div>
            )}

            {/* Opacity slider + Legend when active */}
            {layers.geology && geologyLoadProgress?.done && (
              <>
                <div className="pl-11 pr-2 pb-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] text-[var(--color-text-muted)]">Opacidad</span>
                    <span className="text-[10px] text-[var(--color-text-muted)] font-mono">
                      {Math.round(geologyOpacity * 100)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.1" max="1" step="0.05"
                    value={geologyOpacity}
                    onChange={(e) => onGeologyOpacityChange(parseFloat(e.target.value))}
                    className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
                    style={{
                      background: `linear-gradient(to right, #6EE7B7 ${geologyOpacity * 100}%, var(--color-surface-600) ${geologyOpacity * 100}%)`
                    }}
                  />
                </div>

                {/* Potencial Legend */}
                <div className="pl-11 pr-2 pt-1">
                  <p className="text-[9px] text-[var(--color-text-muted)] uppercase tracking-wider mb-1.5">
                    Leyenda
                  </p>
                  <div className="space-y-1">
                    {LEGEND_ITEMS.map(({ label, color }) => (
                      <div key={label} className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-sm flex-shrink-0"
                          style={{ backgroundColor: color, opacity: 0.85 }}
                        />
                        <span className="text-[10px] text-[var(--color-text-secondary)]">
                          {label}
                        </span>
                      </div>
                    ))}
                  </div>
                  <p className="text-[9px] text-[var(--color-text-muted)] mt-2 leading-tight">
                    Fuente: Consejo de Monumentos Nacionales · SERNAGEOMIN
                  </p>
                </div>
              </>
            )}
          </div>

          {/* Footer */}
          <div className="mt-4 pt-3 border-t border-[var(--color-glass-border)]">
            <p className="text-[10px] text-[var(--color-text-muted)] text-center">
              PaleoGeo Chile · Datos abiertos
            </p>
          </div>
        </div>
      )}

      {/* FAB Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`touch-target w-14 h-14 rounded-2xl transition-all duration-300 shadow-lg ${
          isOpen
            ? 'glass rotate-90 scale-90'
            : 'bg-gradient-to-br from-[#FCD34D] to-[#D97706] hover:shadow-[0_0_24px_rgba(252,211,77,0.3)] hover:scale-105 active:scale-95'
        }`}
        aria-label="Toggle layer panel"
      >
        <span className={isOpen ? 'text-white' : 'text-[#1e293b]'}>
          {isOpen ? Icons.close : Icons.layers}
        </span>
      </button>
    </div>
  );
}

function LayerToggle({ color, icon, label, sublabel, checked, onChange }) {
  return (
    <label className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 transition-colors cursor-pointer group">
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200"
        style={{
          background: checked ? `${color}20` : 'var(--color-surface-700)',
          color: checked ? color : 'var(--color-text-muted)',
        }}
      >
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-[var(--color-text-primary)]">{label}</p>
        <p className="text-[10px] text-[var(--color-text-muted)] truncate">
          {sublabel}
        </p>
      </div>
      <div className="relative">
        <input
          type="checkbox"
          checked={checked}
          onChange={onChange}
          className="sr-only"
        />
        <div
          className="w-10 h-5 rounded-full transition-all duration-200"
          style={{
            background: checked ? color : 'var(--color-surface-600)',
          }}
        >
          <div
            className="w-4 h-4 rounded-full bg-white shadow-md transition-transform duration-200 mt-0.5"
            style={{
              transform: checked ? 'translateX(22px)' : 'translateX(2px)',
            }}
          />
        </div>
      </div>
    </label>
  );
}

function BaseMapButton({ active, onClick, icon, label }) {
  return (
    <button
      onClick={onClick}
      className={`touch-target flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
        active
          ? 'bg-white/10 text-[var(--color-text-primary)] ring-1 ring-[var(--color-brand-amber)]/30'
          : 'bg-[var(--color-surface-700)]/50 text-[var(--color-text-muted)] hover:bg-white/5'
      }`}
    >
      <span style={{ color: active ? '#FCD34D' : 'inherit' }}>{icon}</span>
      {label}
    </button>
  );
}

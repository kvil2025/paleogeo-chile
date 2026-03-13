/* ═══════════════════════════════════════════════════
   Layer Panel — Glassmorphism floating control
   ═══════════════════════════════════════════════════ */

import { useState, useRef, useEffect } from 'react';
import { Icons } from './Icons';

export default function LayerPanel({
  layers,
  onToggleLayer,
  baseMap,
  onBaseMapChange,
  fossilCount,
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

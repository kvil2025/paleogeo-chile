/* ═══════════════════════════════════════════════════
   Info Panel — Bottom sheet for fossil details
   ═══════════════════════════════════════════════════ */

import { useEffect, useRef } from 'react';
import { Icons } from './Icons';
import { PERIOD_COLORS } from '../config/mapConfig';

export default function InfoPanel({ feature, onClose }) {
  const panelRef = useRef(null);

  // Close on escape key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  // Close on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        onClose();
      }
    };
    const timer = setTimeout(() => {
      document.addEventListener('mousedown', handleClick);
    }, 100);
    return () => {
      clearTimeout(timer);
      document.removeEventListener('mousedown', handleClick);
    };
  }, [onClose]);

  if (!feature) return null;

  const props = feature.properties;
  const accentColor = '#FCD34D';
  const periodColor = PERIOD_COLORS[props.period] || accentColor;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[60] bg-black/20 animate-fade-in"
        onClick={onClose}
      />

      {/* Panel */}
      <div
        ref={panelRef}
        className="fixed bottom-0 left-0 right-0 z-[70] glass rounded-t-3xl animate-slide-up max-h-[70vh] overflow-y-auto"
        style={{ boxShadow: '0 -8px 40px rgba(0,0,0,0.5)' }}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-10 h-1 rounded-full bg-[var(--color-surface-600)]" />
        </div>

        <div className="px-5 pb-6 pt-1">
          {/* Header */}
          <div className="flex items-start gap-3 mb-4">
            {/* Type badge */}
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
              style={{ background: `${accentColor}20`, color: accentColor }}
            >
              {Icons.fossil}
            </div>

            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-semibold text-[var(--color-text-primary)] leading-tight">
                <span className="italic">{props.name}</span>
              </h2>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                {props.period && (
                  <span
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
                    style={{
                      background: `${periodColor}20`,
                      color: periodColor,
                      border: `1px solid ${periodColor}30`
                    }}
                  >
                    🕐 {props.period}
                  </span>
                )}
                <span className="text-xs text-[var(--color-brand-amber)]">Fósil</span>
              </div>
            </div>

            {/* Close button */}
            <button
              onClick={onClose}
              className="touch-target rounded-xl hover:bg-white/5 transition-colors shrink-0"
              aria-label="Cerrar"
            >
              {Icons.close}
            </button>
          </div>

          {/* Details Grid */}
          <div className="grid gap-2">
            {props.phylum && <DetailRow label="Filo" value={props.phylum} />}
            {props.class && <DetailRow label="Clase" value={props.class} />}
            {props.order && <DetailRow label="Orden" value={props.order} />}
            {props.family && <DetailRow label="Familia" value={props.family} />}
            {props.epoch && <DetailRow label="Época" value={props.epoch} />}
            {props.formation && <DetailRow label="Formación" value={props.formation} />}
            {props.environment && <DetailRow label="Paleoambiente" value={props.environment} />}
            {props.identified_by && <DetailRow label="Identificado por" value={props.identified_by} />}
          </div>

          {/* Coordinates */}
          {feature.geometry && (
            <div className="mt-3 pt-3 border-t border-[var(--color-glass-border)]">
              <p className="text-[10px] text-[var(--color-text-muted)] font-mono">
                📍 {feature.geometry.coordinates[1].toFixed(4)}°S, {Math.abs(feature.geometry.coordinates[0]).toFixed(4)}°W
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function DetailRow({ label, value }) {
  return (
    <div className="flex items-center gap-2 py-1.5 px-3 rounded-lg bg-white/[0.03]">
      <span className="text-xs text-[var(--color-text-muted)] w-28 shrink-0">{label}</span>
      <span className="text-sm text-[var(--color-text-primary)] truncate">{value}</span>
    </div>
  );
}

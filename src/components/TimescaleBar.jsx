/* ═══════════════════════════════════════════════════
   Timescale Bar — ICS Geological Timescale with filtering
   Based on PBDB Navigator timescale
   ═══════════════════════════════════════════════════ */

import { useState, useMemo } from 'react';

/* ── ICS Standard Geological Periods ────────────── */
const PERIODS = [
  { name: 'Cámbrico',       key: 'Cambrian',       minMa: 485.4, maxMa: 538.8, color: '#7FA882', era: 'Paleozoico' },
  { name: 'Ordovícico',     key: 'Ordovician',      minMa: 443.8, maxMa: 485.4, color: '#009270', era: 'Paleozoico' },
  { name: 'Silúrico',       key: 'Silurian',        minMa: 419.2, maxMa: 443.8, color: '#B3E1D0', era: 'Paleozoico' },
  { name: 'Devónico',       key: 'Devonian',        minMa: 358.9, maxMa: 419.2, color: '#CB8C37', era: 'Paleozoico' },
  { name: 'Carbonífero',    key: 'Carboniferous',   minMa: 298.9, maxMa: 358.9, color: '#67A599', era: 'Paleozoico' },
  { name: 'Pérmico',        key: 'Permian',         minMa: 251.9, maxMa: 298.9, color: '#F04028', era: 'Paleozoico' },
  { name: 'Triásico',       key: 'Triassic',        minMa: 201.4, maxMa: 251.9, color: '#812B92', era: 'Mesozoico' },
  { name: 'Jurásico',       key: 'Jurassic',        minMa: 145.0, maxMa: 201.4, color: '#34B2E0', era: 'Mesozoico' },
  { name: 'Cretácico',      key: 'Cretaceous',      minMa: 66.0,  maxMa: 145.0, color: '#7FC64E', era: 'Mesozoico' },
  { name: 'Paleógeno',      key: 'Paleogene',       minMa: 23.03, maxMa: 66.0,  color: '#FD9A52', era: 'Cenozoico' },
  { name: 'Neógeno',        key: 'Neogene',         minMa: 2.58,  maxMa: 23.03, color: '#FFE619', era: 'Cenozoico' },
  { name: 'Cuaternario',    key: 'Quaternary',      minMa: 0,     maxMa: 2.58,  color: '#F9F97F', era: 'Cenozoico' },
];

const ERAS = [
  { name: 'Paleozoico', color: '#99C08D', minMa: 251.9, maxMa: 538.8 },
  { name: 'Mesozoico',  color: '#67C5CA', minMa: 66.0,  maxMa: 251.9 },
  { name: 'Cenozoico',  color: '#F2F91D', minMa: 0,     maxMa: 66.0  },
];

const TOTAL_MA = 538.8;

export default function TimescaleBar({ activePeriod, onPeriodChange }) {
  const [hoveredPeriod, setHoveredPeriod] = useState(null);

  // Memoize widths
  const periodWidths = useMemo(() =>
    PERIODS.map(p => ({
      ...p,
      widthPct: ((p.maxMa - p.minMa) / TOTAL_MA) * 100
    })), []
  );

  const eraWidths = useMemo(() =>
    ERAS.map(e => ({
      ...e,
      widthPct: ((e.maxMa - e.minMa) / TOTAL_MA) * 100
    })), []
  );

  const handleClick = (periodKey) => {
    // Toggle: click same period again to deselect
    onPeriodChange(activePeriod === periodKey ? null : periodKey);
  };

  const hovered = hoveredPeriod ? PERIODS.find(p => p.key === hoveredPeriod) : null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50" style={{ pointerEvents: 'auto' }}>
      {/* Tooltip */}
      {hovered && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap"
          style={{
            background: 'rgba(0,0,0,0.9)',
            color: hovered.color,
            border: `1px solid ${hovered.color}40`,
            backdropFilter: 'blur(8px)'
          }}
        >
          {hovered.name} · {hovered.maxMa}–{hovered.minMa} Ma
        </div>
      )}

      {/* Active Period Indicator */}
      {activePeriod && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 flex items-center gap-2 px-3 py-1 rounded-full text-xs"
          style={{
            background: `${PERIODS.find(p => p.key === activePeriod)?.color}20`,
            border: `1px solid ${PERIODS.find(p => p.key === activePeriod)?.color}40`,
            color: PERIODS.find(p => p.key === activePeriod)?.color,
          }}
        >
          Filtro: {PERIODS.find(p => p.key === activePeriod)?.name}
          <button
            onClick={(e) => { e.stopPropagation(); onPeriodChange(null); }}
            className="ml-1 hover:opacity-80"
          >✕</button>
        </div>
      )}

      {/* Era Row */}
      <div className="flex w-full h-5" style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}>
        {eraWidths.map(era => (
          <div
            key={era.name}
            className="flex items-center justify-center text-[9px] font-bold tracking-wider overflow-hidden"
            style={{
              width: `${era.widthPct}%`,
              background: era.color,
              color: '#000',
              opacity: 0.85,
              textShadow: '0 0 3px rgba(255,255,255,0.3)',
            }}
          >
            {era.widthPct > 8 ? era.name.toUpperCase() : ''}
          </div>
        ))}
      </div>

      {/* Period Row */}
      <div className="flex w-full h-8">
        {periodWidths.map(period => {
          const isActive = activePeriod === period.key;
          const isHovered = hoveredPeriod === period.key;
          const isDimmed = activePeriod && !isActive;

          return (
            <div
              key={period.key}
              className="relative flex items-center justify-center cursor-pointer transition-all duration-150 border-r"
              style={{
                width: `${period.widthPct}%`,
                background: period.color,
                opacity: isDimmed ? 0.3 : isActive || isHovered ? 1 : 0.75,
                borderColor: 'rgba(0,0,0,0.2)',
                transform: isActive ? 'scaleY(1.15)' : isHovered ? 'scaleY(1.08)' : 'scaleY(1)',
                transformOrigin: 'bottom',
                zIndex: isActive || isHovered ? 10 : 1,
                boxShadow: isActive ? `0 -4px 16px ${period.color}60` : 'none',
              }}
              onClick={() => handleClick(period.key)}
              onMouseEnter={() => setHoveredPeriod(period.key)}
              onMouseLeave={() => setHoveredPeriod(null)}
              title={`${period.name} (${period.maxMa}–${period.minMa} Ma)`}
            >
              <span
                className="text-[10px] font-semibold truncate px-0.5 select-none"
                style={{
                  color: ['#F04028', '#812B92'].includes(period.color) ? '#fff' : '#000',
                  textShadow: ['#F04028', '#812B92'].includes(period.color)
                    ? '0 1px 2px rgba(0,0,0,0.3)'
                    : 'none',
                }}
              >
                {period.widthPct > 5 ? period.name : period.name.charAt(0)}
              </span>

              {/* Active indicator */}
              {isActive && (
                <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-0 h-0"
                  style={{
                    borderLeft: '5px solid transparent',
                    borderRight: '5px solid transparent',
                    borderTop: `5px solid ${period.color}`,
                  }}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Ma scale labels */}
      <div className="flex w-full h-3 bg-[var(--color-surface-900)]" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <span className="text-[8px] text-[var(--color-text-muted)] pl-1">538.8 Ma</span>
        <span className="flex-1" />
        <span className="text-[8px] text-[var(--color-text-muted)]">251.9</span>
        <span className="flex-1" />
        <span className="text-[8px] text-[var(--color-text-muted)]">66</span>
        <span className="flex-1" />
        <span className="text-[8px] text-[var(--color-text-muted)] pr-1">0 Ma</span>
      </div>
    </div>
  );
}

// Export periods data for use in filtering
export { PERIODS };

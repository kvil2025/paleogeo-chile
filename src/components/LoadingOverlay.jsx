/* ═══════════════════════════════════════════════════
   Loading Overlay — Premium splash screen
   ═══════════════════════════════════════════════════ */

import { useState, useEffect } from 'react';

const LOADING_STAGES = [
  { text: 'Inicializando mapa...', icon: '🗺️' },
  { text: 'Cargando geología de Chile...', icon: '🏔️' },
  { text: 'Descubriendo fósiles...', icon: '🦴' },
  { text: 'Localizando monumentos...', icon: '🏛️' },
  { text: '¡Listo para explorar!', icon: '✨' },
];

export default function LoadingOverlay({ progress, isVisible }) {
  const [currentStage, setCurrentStage] = useState(0);

  useEffect(() => {
    if (!isVisible) return;
    const stageIndex = Math.min(
      Math.floor((progress / 100) * LOADING_STAGES.length),
      LOADING_STAGES.length - 1
    );
    setCurrentStage(stageIndex);
  }, [progress, isVisible]);

  if (!isVisible) return null;

  const stage = LOADING_STAGES[currentStage];

  return (
    <div className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[var(--color-surface-900)] ${progress >= 100 ? 'animate-fade-out' : ''}`}
      style={progress >= 100 ? { animation: 'fadeOut 0.6s ease forwards', pointerEvents: 'none' } : {}}
    >
      {/* Ambient glow */}
      <div className="absolute w-[400px] h-[400px] rounded-full opacity-20"
        style={{
          background: 'radial-gradient(circle, rgba(252,211,77,0.3) 0%, rgba(168,85,247,0.15) 50%, transparent 70%)',
          filter: 'blur(60px)',
        }}
      />

      {/* Logo / Title */}
      <div className="relative z-10 flex flex-col items-center gap-6">
        <div className="animate-float">
          <div className="text-6xl mb-2">{stage.icon}</div>
        </div>

        <h1 className="text-3xl font-bold tracking-tight text-[var(--color-text-primary)]">
          Paleo<span className="text-[var(--color-brand-amber)]">Geo</span> Chile
        </h1>

        <p className="text-sm text-[var(--color-text-secondary)] tracking-wide">
          Geología · Fósiles · Arqueología
        </p>

        {/* Progress bar */}
        <div className="w-64 h-1.5 rounded-full bg-[var(--color-surface-700)] overflow-hidden mt-2">
          <div
            className="h-full rounded-full transition-all duration-500 ease-out"
            style={{
              width: `${progress}%`,
              background: 'linear-gradient(90deg, #FCD34D, #A855F7)',
            }}
          />
        </div>

        <p className="text-xs text-[var(--color-text-muted)] animate-pulse mt-1">
          {stage.text}
        </p>
      </div>
    </div>
  );
}

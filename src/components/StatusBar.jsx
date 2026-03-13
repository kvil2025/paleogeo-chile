/* ═══════════════════════════════════════════════════
   StatusBar — Top bar showing data status
   ═══════════════════════════════════════════════════ */

export default function StatusBar({ fossilCount, isLoading }) {
  return (
    <div className="fixed top-4 left-4 right-20 z-40 flex items-center gap-2 pointer-events-none">
      {/* Logo */}
      <div className="glass rounded-2xl px-4 py-2.5 flex items-center gap-3 pointer-events-auto">
        <div className="flex items-center gap-2">
          <span className="text-lg">🦴</span>
          <h1 className="text-sm font-bold tracking-tight text-[var(--color-text-primary)] hidden sm:block">
            Paleo<span className="text-[var(--color-brand-amber)]">Geo</span>
          </h1>
        </div>
        
        <div className="w-px h-5 bg-[var(--color-glass-border)] hidden sm:block" />

        {/* Stats */}
        <div className="flex items-center gap-3">
          {fossilCount > 0 && (
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-[var(--color-brand-amber)]" />
              <span className="text-xs text-[var(--color-text-secondary)] font-medium">
                {fossilCount.toLocaleString()}
              </span>
            </div>
          )}
          {isLoading && (
            <div className="w-3 h-3 rounded-full border-2 border-[var(--color-brand-amber)] border-t-transparent animate-spin" />
          )}
        </div>
      </div>
    </div>
  );
}

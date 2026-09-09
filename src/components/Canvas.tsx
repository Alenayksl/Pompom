export function Canvas() {
  return (
    <section className="relative flex min-w-0 flex-1 flex-col overflow-hidden bg-cream">
      {/* Soft lo-fi atmosphere */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_30%_20%,var(--sage-soft)_0%,transparent_55%),radial-gradient(ellipse_at_80%_70%,var(--mist)_0%,transparent_50%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.4'/%3E%3C/svg%3E\")",
        }}
      />

      <header className="relative z-10 flex items-center justify-between px-8 py-5">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-soil-muted">
            Garden
          </p>
          <h2 className="text-lg font-semibold text-soil">Plant area</h2>
        </div>
      </header>

      <div className="relative z-10 flex flex-1 items-center justify-center px-8 pb-8">
        <div className="flex h-full w-full max-w-5xl items-center justify-center rounded-3xl border border-dashed border-sage bg-panel/60 backdrop-blur-[2px]">
          <div className="text-center">
            <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-sage-soft/80 ring-4 ring-mist" />
            <p className="text-base font-medium text-soil">Canvas</p>
            <p className="mt-1 max-w-xs text-sm text-soil-muted">
              Place for plants — empty skeleton for now
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

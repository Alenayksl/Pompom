export function Pomodoro() {
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex h-28 w-28 items-center justify-center rounded-full border-4 border-sage-soft bg-mist">
        <div className="text-center">
          <p className="text-2xl font-semibold tabular-nums tracking-tight text-soil">
            25:00
          </p>
          <p className="text-[10px] font-medium uppercase tracking-wider text-soil-muted">
            Focus
          </p>
        </div>
      </div>

      <div className="flex w-full gap-2">
        <button
          type="button"
          className="flex-1 rounded-xl bg-moss px-3 py-2 text-sm font-medium text-cream transition-colors hover:bg-moss-deep"
        >
          Start
        </button>
        <button
          type="button"
          className="flex-1 rounded-xl border border-border-soft bg-cream px-3 py-2 text-sm font-medium text-soil-muted transition-colors hover:bg-mist"
        >
          Reset
        </button>
      </div>
    </div>
  );
}

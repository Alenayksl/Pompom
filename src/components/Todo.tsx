export function Todo() {
  return (
    <section className="flex min-h-0 flex-1 flex-col rounded-2xl border border-border-soft bg-panel p-4 shadow-[0_1px_0_rgba(92,107,82,0.04)]">
      <h2 className="mb-3 text-sm font-semibold text-moss-deep">To-do</h2>
      <div className="flex flex-1 items-center justify-center rounded-xl border border-dashed border-sage bg-mist/50 px-3 py-6">
        <p className="text-center text-sm text-soil-muted">
          Task list will go here
        </p>
      </div>
    </section>
  );
}

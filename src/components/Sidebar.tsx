import { Pomodoro } from "@/components/Pomodoro";

export function Sidebar() {
  return (
    <aside className="flex h-full w-80 shrink-0 flex-col gap-4 border-r border-border-soft bg-sidebar p-5">
      <header className="pb-1">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-soil-muted">
          Pompom
        </p>
        <h1 className="mt-1 text-xl font-semibold text-soil">Workspace</h1>
      </header>

      <section className="rounded-2xl border border-border-soft bg-panel p-4 shadow-[0_1px_0_rgba(92,107,82,0.04)]">
        <h2 className="mb-3 text-sm font-semibold text-moss-deep">Pomodoro</h2>
        <Pomodoro />
      </section>

      <section className="flex min-h-0 flex-1 flex-col rounded-2xl border border-border-soft bg-panel p-4 shadow-[0_1px_0_rgba(92,107,82,0.04)]">
        <h2 className="mb-3 text-sm font-semibold text-moss-deep">To-do</h2>
        <div className="flex flex-1 items-center justify-center rounded-xl border border-dashed border-sage bg-mist/50 px-3 py-6">
          <p className="text-center text-sm text-soil-muted">
            Task list will go here
          </p>
        </div>
      </section>

      <section className="flex min-h-0 flex-1 flex-col rounded-2xl border border-border-soft bg-panel p-4 shadow-[0_1px_0_rgba(92,107,82,0.04)]">
        <h2 className="mb-3 text-sm font-semibold text-moss-deep">Notes</h2>
        <div className="flex flex-1 items-center justify-center rounded-xl border border-dashed border-sage bg-mist/50 px-3 py-6">
          <p className="text-center text-sm text-soil-muted">
            Notes area will go here
          </p>
        </div>
      </section>
    </aside>
  );
}

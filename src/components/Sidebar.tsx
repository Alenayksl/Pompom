import { Notes } from "@/components/Notes";
import { Pomodoro } from "@/components/Pomodoro";
import { Todo } from "@/components/Todo";

export function Sidebar() {
  return (
    <aside className="flex h-full w-80 shrink-0 flex-col gap-4 border-r border-border-soft bg-sidebar p-5">
      <header className="pb-1">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-soil-muted">
          Pompom
        </p>
        <h1 className="mt-1 text-xl font-semibold text-soil">Workspace</h1>
      </header>

      <Pomodoro />
      <Todo />
      <Notes />
    </aside>
  );
}

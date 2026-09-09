"use client";

import { usePanels } from "@/context/PanelsContext";
import { useTasks } from "@/context/TasksContext";

export function Todo() {
  const { recentTasks } = useTasks();
  const { todo, togglePanel } = usePanels();
  const active = todo.isOpen && !todo.isClosing;

  return (
    <button
      type="button"
      onClick={() => togglePanel("todo")}
      aria-expanded={active}
      className={`flex min-h-0 flex-1 flex-col rounded-2xl border bg-panel p-4 text-left shadow-[0_1px_0_rgba(92,107,82,0.04)] transition-colors hover:border-sage hover:bg-mist/40 ${
        active ? "border-sage bg-mist/30" : "border-border-soft"
      }`}
    >
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-moss-deep">To-do</h2>
        <span className="text-[10px] font-medium uppercase tracking-wider text-soil-muted">
          {active ? "Close" : "Open"}
        </span>
      </div>

      {recentTasks.length === 0 ? (
        <div className="flex flex-1 items-center justify-center rounded-xl border border-dashed border-sage bg-mist/50 px-3 py-6">
          <p className="text-center text-sm text-soil-muted">
            No tasks yet — click to add some
          </p>
        </div>
      ) : (
        <ul className="flex flex-1 flex-col gap-2 overflow-hidden">
          {recentTasks.map((task) => (
            <li
              key={task.id}
              className="flex items-start gap-2 rounded-lg bg-mist/60 px-2.5 py-2"
            >
              <span
                aria-hidden
                className={`mt-0.5 flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded border ${
                  task.done
                    ? "border-moss bg-moss text-cream"
                    : "border-sage bg-panel"
                }`}
              >
                {task.done ? (
                  <svg
                    viewBox="0 0 12 12"
                    className="h-2.5 w-2.5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M2.5 6.5 5 9l4.5-5.5" />
                  </svg>
                ) : null}
              </span>
              <span
                className={`line-clamp-2 text-sm leading-snug ${
                  task.done
                    ? "text-soil-muted line-through"
                    : "text-soil"
                }`}
              >
                {task.text}
              </span>
            </li>
          ))}
        </ul>
      )}
    </button>
  );
}

"use client";

import { useState, type FormEvent } from "react";
import { useTasks } from "@/context/TasksContext";

const EXIT_MS = 320;

type TodoPanelProps = {
  isClosing: boolean;
  onClose: () => void;
};

export function TodoPanel({ isClosing, onClose }: TodoPanelProps) {
  const { tasks, addTask, toggleTask, removeTask } = useTasks();
  const [draft, setDraft] = useState("");
  const [exitingIds, setExitingIds] = useState<Set<string>>(new Set());

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    addTask(draft);
    setDraft("");
  }

  function handleDelete(id: string) {
    if (exitingIds.has(id)) return;

    setExitingIds((prev) => new Set(prev).add(id));

    window.setTimeout(() => {
      removeTask(id);
      setExitingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }, EXIT_MS);
  }

  return (
    <div
      className={`h-full shrink-0 overflow-hidden ${
        isClosing ? "todo-panel-exit" : "todo-panel-enter"
      }`}
    >
      <section className="flex h-full w-[22rem] flex-col border-r border-border-soft bg-cream-deep">
      <header className="flex items-start justify-between gap-3 border-b border-border-soft px-5 py-4">
        <button
          type="button"
          onClick={onClose}
          className="text-left transition-colors hover:text-moss-deep"
        >
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-soil-muted">
            Tasks
          </p>
          <h2 className="mt-1 text-lg font-semibold text-soil">To-do list</h2>
        </button>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg border border-border-soft bg-panel px-2.5 py-1.5 text-xs font-medium text-soil-muted transition-colors hover:bg-mist hover:text-soil"
        >
          Close
        </button>
      </header>

      <form
        onSubmit={handleSubmit}
        className="flex gap-2 border-b border-border-soft px-5 py-4"
      >
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Write a task..."
          className="min-w-0 flex-1 rounded-xl border border-border-soft bg-panel px-3 py-2 text-sm text-soil outline-none placeholder:text-soil-muted/70 focus:border-sage"
        />
        <button
          type="submit"
          className="shrink-0 rounded-xl bg-moss px-3 py-2 text-sm font-medium text-cream transition-colors hover:bg-moss-deep"
        >
          Add
        </button>
      </form>

      <ul className="flex flex-1 flex-col gap-2 overflow-y-auto px-5 py-4">
        {tasks.length === 0 ? (
          <li className="flex flex-1 items-center justify-center rounded-xl border border-dashed border-sage bg-mist/40 px-3 py-8">
            <p className="text-center text-sm text-soil-muted">
              Add your first task above
            </p>
          </li>
        ) : (
          tasks.map((task) => {
            const isExiting = exitingIds.has(task.id);

            return (
              <li
                key={task.id}
                className={`group flex items-start gap-3 rounded-xl border border-border-soft bg-panel px-3 py-2.5 ${
                  isExiting ? "todo-task-exit" : ""
                }`}
              >
                <input
                  type="checkbox"
                  checked={task.done}
                  onChange={() => toggleTask(task.id)}
                  disabled={isExiting}
                  className="mt-1 h-4 w-4 shrink-0 cursor-pointer rounded border-sage accent-moss disabled:cursor-default"
                  aria-label={`Mark "${task.text}" as ${task.done ? "not done" : "done"}`}
                />
                <span
                  className={`min-w-0 flex-1 text-sm leading-snug ${
                    task.done
                      ? "text-soil-muted line-through"
                      : "text-soil"
                  }`}
                >
                  {task.text}
                </span>
                <button
                  type="button"
                  onClick={() => handleDelete(task.id)}
                  disabled={isExiting}
                  className="shrink-0 rounded-md px-1.5 py-0.5 text-xs text-soil-muted opacity-0 transition-opacity hover:bg-mist hover:text-soil group-hover:opacity-100 disabled:opacity-0"
                  aria-label={`Delete "${task.text}"`}
                >
                  ✕
                </button>
              </li>
            );
          })
        )}
      </ul>
    </section>
    </div>
  );
}

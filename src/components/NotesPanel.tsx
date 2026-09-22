"use client";

import { useMemo, useState } from "react";
import { useNotes } from "@/context/NotesContext";

type NotesPanelProps = {
  isClosing: boolean;
  onClose: () => void;
};

function formatUpdated(ts: number) {
  const date = new Date(ts);
  const localeParts = new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).formatToParts(date);
  const englishMonth = new Intl.DateTimeFormat("en-US", {
    month: "short",
  }).format(date);

  return localeParts
    .map((part) => (part.type === "month" ? englishMonth : part.value))
    .join("");
}

function previewLine(content: string) {
  const line = content.trim().split("\n").find((part) => part.trim());
  return line?.trim() || "No additional text";
}

export function NotesPanel({ isClosing, onClose }: NotesPanelProps) {
  const { notes, createNote, updateNote, removeNote } = useNotes();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [exitingIds, setExitingIds] = useState<Set<string>>(new Set());

  const activeNote = useMemo(
    () => notes.find((note) => note.id === activeId) ?? notes[0] ?? null,
    [notes, activeId],
  );

  function handleCreate() {
    const id = createNote();
    setActiveId(id);
  }

  function handleDelete(id: string) {
    if (exitingIds.has(id)) return;

    setExitingIds((prev) => new Set(prev).add(id));

    window.setTimeout(() => {
      removeNote(id);
      setExitingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }, 320);
  }

  return (
    <div
      className={`h-full shrink-0 overflow-hidden ${
        isClosing ? "notes-panel-exit" : "notes-panel-enter"
      }`}
    >
      <section className="flex h-full w-[36rem] border-r border-border-soft bg-cream-deep">
        {/* File list */}
        <aside className="flex w-44 shrink-0 flex-col border-r border-border-soft bg-sidebar">
          <div className="flex items-center justify-between gap-2 border-b border-border-soft px-3 py-3">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-soil-muted">
              Files
            </p>
            <button
              type="button"
              onClick={handleCreate}
              className="rounded-lg bg-moss px-2 py-1 text-xs font-medium text-cream transition-colors hover:bg-moss-deep"
            >
              New
            </button>
          </div>

          <ul className="flex flex-1 flex-col gap-1 overflow-y-auto p-2">
            {notes.length === 0 ? (
              <li className="px-2 py-6 text-center text-xs text-soil-muted">
                No notes yet
              </li>
            ) : (
              notes.map((note) => {
                const isActive = note.id === activeId;
                const isExiting = exitingIds.has(note.id);

                return (
                  <li
                    key={note.id}
                    className={isExiting ? "todo-task-exit" : undefined}
                  >
                    <button
                      type="button"
                      onClick={() => setActiveId(note.id)}
                      disabled={isExiting}
                      className={`w-full rounded-xl px-2.5 py-2 text-left transition-colors ${
                        isActive
                          ? "bg-sage-soft/80 text-soil"
                          : "hover:bg-mist/70 text-soil"
                      }`}
                    >
                      <p className="truncate text-sm font-medium">
                        {note.title.trim() || "Untitled"}
                      </p>
                      <p className="mt-0.5 truncate text-[11px] text-soil-muted">
                        {previewLine(note.content)}
                      </p>
                    </button>
                  </li>
                );
              })
            )}
          </ul>
        </aside>

        {/* Editor */}
        <div className="flex min-w-0 flex-1 flex-col bg-panel">
          <header className="flex items-start justify-between gap-3 border-b border-border-soft px-4 py-3">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-soil-muted">
                Notes
              </p>
              <h2 className="mt-1 text-lg font-semibold text-soil">
                {activeNote ? "Editor" : "No file open"}
              </h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-border-soft bg-cream px-2.5 py-1.5 text-xs font-medium text-soil-muted transition-colors hover:bg-mist hover:text-soil"
            >
              Close
            </button>
          </header>

          {activeNote ? (
            <div className="flex min-h-0 flex-1 flex-col">
              <div className="flex items-center gap-2 border-b border-border-soft px-4 py-2">
                <span
                  aria-hidden
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-mist text-moss-deep"
                >
                  <svg
                    viewBox="0 0 16 16"
                    className="h-3.5 w-3.5"
                    fill="currentColor"
                  >
                    <path d="M3 1.5h7.2L13 4.3V14a.5.5 0 0 1-.5.5h-9A.5.5 0 0 1 3 14V1.5Zm7 0v3h3" />
                  </svg>
                </span>
                <input
                  type="text"
                  value={activeNote.title}
                  onChange={(e) =>
                    updateNote(activeNote.id, { title: e.target.value })
                  }
                  placeholder="Untitled"
                  className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-soil outline-none placeholder:text-soil-muted"
                />
                <button
                  type="button"
                  onClick={() => handleDelete(activeNote.id)}
                  className="rounded-md px-2 py-1 text-xs text-soil-muted transition-colors hover:bg-mist hover:text-soil"
                >
                  Delete
                </button>
              </div>

              <p className="px-4 pt-2 text-[11px] text-soil-muted">
                Edited {formatUpdated(activeNote.updatedAt)}
              </p>

              <textarea
                value={activeNote.content}
                onChange={(e) =>
                  updateNote(activeNote.id, { content: e.target.value })
                }
                placeholder="Start writing..."
                className="min-h-0 flex-1 resize-none bg-transparent px-4 py-3 text-sm leading-relaxed text-soil outline-none placeholder:text-soil-muted/70"
              />
            </div>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6">
              <p className="text-sm text-soil-muted">
                Create a file to start taking notes
              </p>
              <button
                type="button"
                onClick={handleCreate}
                className="rounded-xl bg-moss px-4 py-2 text-sm font-medium text-cream transition-colors hover:bg-moss-deep"
              >
                New note
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

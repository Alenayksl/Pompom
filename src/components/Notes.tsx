"use client";

import { useNotesPanel } from "@/context/NotesPanelContext";
import { useNotes } from "@/context/NotesContext";

export function Notes() {
  const { recentNotes } = useNotes();
  const { isOpen, isClosing, togglePanel } = useNotesPanel();
  const active = isOpen && !isClosing;

  return (
    <button
      type="button"
      onClick={togglePanel}
      aria-expanded={active}
      className={`flex min-h-0 flex-1 flex-col rounded-2xl border bg-panel p-4 text-left shadow-[0_1px_0_rgba(92,107,82,0.04)] transition-colors hover:border-sage hover:bg-mist/40 ${
        active ? "border-sage bg-mist/30" : "border-border-soft"
      }`}
    >
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-moss-deep">Notes</h2>
        <span className="text-[10px] font-medium uppercase tracking-wider text-soil-muted">
          {active ? "Close" : "Open"}
        </span>
      </div>

      {recentNotes.length === 0 ? (
        <div className="flex flex-1 items-center justify-center rounded-xl border border-dashed border-sage bg-mist/50 px-3 py-6">
          <p className="text-center text-sm text-soil-muted">
            No notes yet — click to write
          </p>
        </div>
      ) : (
        <ul className="flex flex-1 flex-col gap-2 overflow-hidden">
          {recentNotes.map((note) => (
            <li
              key={note.id}
              className="flex items-start gap-2 rounded-lg bg-mist/60 px-2.5 py-2"
            >
              <span
                aria-hidden
                className="mt-0.5 flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded bg-panel text-moss-deep"
              >
                <svg
                  viewBox="0 0 12 12"
                  className="h-2.5 w-2.5"
                  fill="currentColor"
                >
                  <path d="M2.5 1h5l2 2v7.5a.5.5 0 0 1-.5.5h-6.5a.5.5 0 0 1-.5-.5V1.5a.5.5 0 0 1 .5-.5Zm4.5 0v2h2" />
                </svg>
              </span>
              <span className="line-clamp-2 text-sm leading-snug text-soil">
                {note.title.trim() || "Untitled"}
              </span>
            </li>
          ))}
        </ul>
      )}
    </button>
  );
}

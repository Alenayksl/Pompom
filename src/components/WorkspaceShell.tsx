"use client";

import { Sidebar } from "@/components/Sidebar";
import { NotesPanel } from "@/components/NotesPanel";
import { TodoPanel } from "@/components/TodoPanel";
import { NotesProvider } from "@/context/NotesContext";
import {
  NotesPanelProvider,
  useNotesPanel,
} from "@/context/NotesPanelContext";
import { TasksProvider } from "@/context/TasksContext";
import {
  TodoPanelProvider,
  useTodoPanel,
} from "@/context/TodoPanelContext";

function WorkspaceMain({ children }: { children: React.ReactNode }) {
  const todo = useTodoPanel();
  const notes = useNotesPanel();

  return (
    <div className="flex h-dvh w-full">
      <Sidebar />
      <div className="flex min-w-0 flex-1 overflow-hidden">
        {todo.isOpen ? (
          <TodoPanel isClosing={todo.isClosing} onClose={todo.closePanel} />
        ) : null}
        {notes.isOpen ? (
          <NotesPanel isClosing={notes.isClosing} onClose={notes.closePanel} />
        ) : null}
        {children}
      </div>
    </div>
  );
}

export function WorkspaceShell({ children }: { children: React.ReactNode }) {
  return (
    <TasksProvider>
      <NotesProvider>
        <TodoPanelProvider>
          <NotesPanelProvider>
            <WorkspaceMain>{children}</WorkspaceMain>
          </NotesPanelProvider>
        </TodoPanelProvider>
      </NotesProvider>
    </TasksProvider>
  );
}

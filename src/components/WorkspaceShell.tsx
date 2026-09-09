"use client";

import { Sidebar } from "@/components/Sidebar";
import { TodoPanel } from "@/components/TodoPanel";
import { TasksProvider } from "@/context/TasksContext";
import {
  TodoPanelProvider,
  useTodoPanel,
} from "@/context/TodoPanelContext";

function WorkspaceMain({ children }: { children: React.ReactNode }) {
  const { isOpen, isClosing, closePanel } = useTodoPanel();

  return (
    <div className="flex h-dvh w-full">
      <Sidebar />
      <div className="flex min-w-0 flex-1 overflow-hidden">
        {isOpen ? (
          <TodoPanel isClosing={isClosing} onClose={closePanel} />
        ) : null}
        {children}
      </div>
    </div>
  );
}

export function WorkspaceShell({ children }: { children: React.ReactNode }) {
  return (
    <TasksProvider>
      <TodoPanelProvider>
        <WorkspaceMain>{children}</WorkspaceMain>
      </TodoPanelProvider>
    </TasksProvider>
  );
}

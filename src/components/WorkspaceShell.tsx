"use client";

import { useCallback, useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { CalendarPanel } from "@/components/CalendarPanel";
import { DraggablePanel } from "@/components/DraggablePanel";
import { NotesPanel } from "@/components/NotesPanel";
import { TodoPanel } from "@/components/TodoPanel";
import { CalendarProvider } from "@/context/CalendarContext";
import { NotesProvider } from "@/context/NotesContext";
import { PanelsProvider, usePanels, type PanelId } from "@/context/PanelsContext";
import { TasksProvider } from "@/context/TasksContext";
import { FlowerProvider } from "@/context/FlowerContext";

function PanelById({ id }: { id: PanelId }) {
  const { panels, closePanel } = usePanels();
  const { todo, notes, calendar } = panels;

  if (id === "todo" && todo.isOpen) {
    return (
      <DraggablePanel id="todo">
        <TodoPanel
          isClosing={todo.isClosing}
          onClose={() => closePanel("todo")}
        />
      </DraggablePanel>
    );
  }

  if (id === "notes" && notes.isOpen) {
    return (
      <DraggablePanel id="notes">
        <NotesPanel
          isClosing={notes.isClosing}
          onClose={() => closePanel("notes")}
        />
      </DraggablePanel>
    );
  }

  if (id === "calendar" && calendar.isOpen) {
    return (
      <DraggablePanel id="calendar">
        <CalendarPanel
          isClosing={calendar.isClosing}
          onClose={() => closePanel("calendar")}
        />
      </DraggablePanel>
    );
  }

  return null;
}

const FINAL_FLOWER_INDEX = 6;
const POMODOROS_PER_CYCLE = 8;

function WorkspaceMain({ children }: { children: React.ReactNode }) {
  const { order } = usePanels();
  const [completedInCycle, setCompletedInCycle] = useState(0);

  const showNextFlower = useCallback(() => {
    setCompletedInCycle((current) =>
      Math.min(current + 1, POMODOROS_PER_CYCLE),
    );
  }, []);

  const flowerIndex =
    completedInCycle === POMODOROS_PER_CYCLE
      ? FINAL_FLOWER_INDEX
      : Math.min(completedInCycle, 5);

  return (
    <FlowerProvider flowerIndex={flowerIndex}>
      <main className="flex h-dvh w-full">
        <Sidebar
          onFocusComplete={showNextFlower}
          onLongBreakComplete={() => setCompletedInCycle(0)}
          onReset={() => setCompletedInCycle(0)}
        />
        <div className="flex min-w-0 flex-1 overflow-hidden">
          {order.map((id) => (
            <PanelById key={id} id={id} />
          ))}
          {children}
        </div>
      </main>
    </FlowerProvider>
  );
}

export function WorkspaceShell({ children }: { children: React.ReactNode }) {
  return (
    <TasksProvider>
      <NotesProvider>
        <CalendarProvider>
          <PanelsProvider>
            <WorkspaceMain>{children}</WorkspaceMain>
          </PanelsProvider>
        </CalendarProvider>
      </NotesProvider>
    </TasksProvider>
  );
}

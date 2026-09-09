"use client";

import { useState, type DragEvent, type ReactNode } from "react";
import { usePanels, type PanelId } from "@/context/PanelsContext";

type DraggablePanelProps = {
  id: PanelId;
  children: ReactNode;
};

export function DraggablePanel({ id, children }: DraggablePanelProps) {
  const { movePanel } = usePanels();
  const [isDragging, setIsDragging] = useState(false);
  const [isOver, setIsOver] = useState(false);

  function handleDragStart(e: DragEvent<HTMLButtonElement>) {
    e.dataTransfer.setData("text/panel-id", id);
    e.dataTransfer.effectAllowed = "move";
    setIsDragging(true);
  }

  function handleDragEnd() {
    setIsDragging(false);
    setIsOver(false);
  }

  function handleDragOver(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (!isOver) setIsOver(true);
  }

  function handleDragLeave(e: DragEvent<HTMLDivElement>) {
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    setIsOver(false);
  }

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    const fromId = e.dataTransfer.getData("text/panel-id") as PanelId;
    setIsOver(false);
    if (fromId === "todo" || fromId === "notes") {
      movePanel(fromId, id);
    }
  }

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`relative h-full transition-[opacity,box-shadow] ${
        isDragging ? "opacity-45" : "opacity-100"
      } ${isOver ? "ring-2 ring-inset ring-sage" : ""}`}
    >
      <button
        type="button"
        draggable
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        aria-label="Drag to reorder panel"
        title="Drag to reorder"
        className="absolute left-1/2 top-2 z-20 flex -translate-x-1/2 cursor-grab items-center gap-0.5 rounded-full border border-border-soft bg-panel/95 px-2.5 py-1.5 text-soil-muted shadow-sm active:cursor-grabbing"
      >
        <span className="h-1 w-1 rounded-full bg-soil-muted/70" />
        <span className="h-1 w-1 rounded-full bg-soil-muted/70" />
        <span className="h-1 w-1 rounded-full bg-soil-muted/70" />
      </button>
      {children}
    </div>
  );
}

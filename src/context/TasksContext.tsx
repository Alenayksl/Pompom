"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { Task } from "@/types/task";

const STORAGE_KEY = "pompom-tasks";

type TasksContextValue = {
  tasks: Task[];
  addTask: (text: string) => void;
  toggleTask: (id: string) => void;
  removeTask: (id: string) => void;
  recentTasks: Task[];
};

const TasksContext = createContext<TasksContextValue | null>(null);

function loadTasks(): Task[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Task[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function TasksProvider({ children }: { children: React.ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setTasks(loadTasks());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  }, [tasks, hydrated]);

  const addTask = useCallback((text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    setTasks((prev) => [
      {
        id: crypto.randomUUID(),
        text: trimmed,
        done: false,
        createdAt: Date.now(),
      },
      ...prev,
    ]);
  }, []);

  const toggleTask = useCallback((id: string) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id ? { ...task, done: !task.done } : task,
      ),
    );
  }, []);

  const removeTask = useCallback((id: string) => {
    setTasks((prev) => prev.filter((task) => task.id !== id));
  }, []);

  const recentTasks = useMemo(
    () =>
      [...tasks]
        .sort((a, b) => b.createdAt - a.createdAt)
        .slice(0, 3),
    [tasks],
  );

  const value = useMemo(
    () => ({ tasks, addTask, toggleTask, removeTask, recentTasks }),
    [tasks, addTask, toggleTask, removeTask, recentTasks],
  );

  return (
    <TasksContext.Provider value={value}>{children}</TasksContext.Provider>
  );
}

export function useTasks() {
  const ctx = useContext(TasksContext);
  if (!ctx) {
    throw new Error("useTasks must be used within TasksProvider");
  }
  return ctx;
}

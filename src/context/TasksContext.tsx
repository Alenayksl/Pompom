"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { Task } from "@/types/task";
import { createClient } from "@/lib/supabase/client";

type TasksContextValue = {
  tasks: Task[];
  addTask: (text: string) => void;
  toggleTask: (id: string) => void;
  removeTask: (id: string) => void;
  recentTasks: Task[];
};

const TasksContext = createContext<TasksContextValue | null>(null);

export function TasksProvider({ children }: { children: React.ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const supabase = useMemo(() => createClient(), []);
  const pendingCreates = useRef<Record<string, Promise<void>>>({});

  useEffect(() => {
    let active = true;

    async function loadTasks() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("tasks")
        .select("id, text, done, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Could not load tasks.", error);
        return;
      }

      if (active && data) {
        setTasks(
          data.map((task) => ({
            id: task.id,
            text: task.text,
            done: task.done,
            createdAt: new Date(task.created_at).getTime(),
          })),
        );
      }
    }

    void loadTasks();
    return () => {
      active = false;
    };
  }, [supabase]);

  const addTask = useCallback((text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    const id = crypto.randomUUID();
    const createdAt = Date.now();
    setTasks((prev) => [
      {
        id,
        text: trimmed,
        done: false,
        createdAt,
      },
      ...prev,
    ]);
    const createRequest = supabase.auth.getUser().then(async ({ data: { user }, error }) => {
      if (error) {
        console.error("Could not identify the current user for task creation.", error);
        return;
      }
      if (!user) return;
      const { error: insertError } = await supabase.from("tasks").insert({
        id,
        user_id: user.id,
        text: trimmed,
        done: false,
      });
      if (insertError) console.error("Could not save task.", insertError);
    });
    pendingCreates.current[id] = createRequest;
    void createRequest.finally(() => delete pendingCreates.current[id]);
  }, [supabase]);

  const toggleTask = useCallback((id: string) => {
    const task = tasks.find((item) => item.id === id);
    if (!task) return;
    const done = !task.done;

    setTasks((prev) =>
      prev.map((task) =>
        task.id === id ? { ...task, done } : task,
      ),
    );
    void (async () => {
      await pendingCreates.current[id];
      const { error } = await supabase.from("tasks").update({ done }).eq("id", id);
      if (error) console.error("Could not save task state.", error);
    })();
  }, [supabase, tasks]);

  const removeTask = useCallback(
    (id: string) => {
      setTasks((prev) => prev.filter((task) => task.id !== id));
      void supabase.from("tasks").delete().eq("id", id);
    },
    [supabase],
  );

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

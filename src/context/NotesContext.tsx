"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { Note } from "@/types/note";

const STORAGE_KEY = "pompom-notes";

type NotesContextValue = {
  notes: Note[];
  recentNotes: Note[];
  createNote: () => string;
  updateNote: (id: string, patch: Partial<Pick<Note, "title" | "content">>) => void;
  removeNote: (id: string) => void;
  getNote: (id: string) => Note | undefined;
};

const NotesContext = createContext<NotesContextValue | null>(null);

function loadNotes(): Note[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Note[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function sortByUpdated(notes: Note[]) {
  return [...notes].sort((a, b) => b.updatedAt - a.updatedAt);
}

export function NotesProvider({ children }: { children: React.ReactNode }) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setNotes(loadNotes());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
  }, [notes, hydrated]);

  const createNote = useCallback(() => {
    const id = crypto.randomUUID();
    const now = Date.now();
    setNotes((prev) => [
      {
        id,
        title: "Untitled",
        content: "",
        createdAt: now,
        updatedAt: now,
      },
      ...prev,
    ]);
    return id;
  }, []);

  const updateNote = useCallback(
    (id: string, patch: Partial<Pick<Note, "title" | "content">>) => {
      setNotes((prev) =>
        prev.map((note) =>
          note.id === id
            ? { ...note, ...patch, updatedAt: Date.now() }
            : note,
        ),
      );
    },
    [],
  );

  const removeNote = useCallback((id: string) => {
    setNotes((prev) => prev.filter((note) => note.id !== id));
  }, []);

  const getNote = useCallback(
    (id: string) => notes.find((note) => note.id === id),
    [notes],
  );

  const recentNotes = useMemo(
    () => sortByUpdated(notes).slice(0, 3),
    [notes],
  );

  const sortedNotes = useMemo(() => sortByUpdated(notes), [notes]);

  const value = useMemo(
    () => ({
      notes: sortedNotes,
      recentNotes,
      createNote,
      updateNote,
      removeNote,
      getNote,
    }),
    [sortedNotes, recentNotes, createNote, updateNote, removeNote, getNote],
  );

  return (
    <NotesContext.Provider value={value}>{children}</NotesContext.Provider>
  );
}

export function useNotes() {
  const ctx = useContext(NotesContext);
  if (!ctx) {
    throw new Error("useNotes must be used within NotesProvider");
  }
  return ctx;
}

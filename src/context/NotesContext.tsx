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
import type { Note } from "@/types/note";
import { createClient } from "@/lib/supabase/client";

type NotesContextValue = {
  notes: Note[];
  recentNotes: Note[];
  createNote: () => string;
  updateNote: (id: string, patch: Partial<Pick<Note, "title" | "content">>) => void;
  removeNote: (id: string) => void;
  getNote: (id: string) => Note | undefined;
};

const NotesContext = createContext<NotesContextValue | null>(null);

function sortByUpdated(notes: Note[]) {
  return [...notes].sort((a, b) => b.updatedAt - a.updatedAt);
}

export function NotesProvider({ children }: { children: React.ReactNode }) {
  const [notes, setNotes] = useState<Note[]>([]);
  const supabase = useMemo(() => createClient(), []);
  const pendingUpdates = useRef<Record<string, Partial<Pick<Note, "title" | "content">>>>({});
  const updateTimers = useRef<Record<string, number>>({});
  const pendingCreates = useRef<Record<string, Promise<void>>>({});

  useEffect(() => {
    let active = true;

    async function loadNotes() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("notes")
        .select("id, title, content, created_at, updated_at")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false });

      if (error) {
        console.error("Could not load notes.", error);
        return;
      }

      if (active && data) {
        setNotes(
          data.map((note) => ({
            id: note.id,
            title: note.title,
            content: note.content,
            createdAt: new Date(note.created_at).getTime(),
            updatedAt: new Date(note.updated_at).getTime(),
          })),
        );
      }
    }

    void loadNotes();
    return () => {
      active = false;
    };
  }, [supabase]);

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
    const createRequest = supabase.auth.getUser().then(async ({ data: { user }, error }) => {
      if (error) {
        console.error("Could not identify the current user for note creation.", error);
        return;
      }
      if (!user) return;
      const { error: insertError } = await supabase.from("notes").insert({
        id,
        user_id: user.id,
        title: "Untitled",
        content: "",
      });
      if (insertError) console.error("Could not save note.", insertError);
    });
    pendingCreates.current[id] = createRequest;
    void createRequest.finally(() => delete pendingCreates.current[id]);
    return id;
  }, [supabase]);

  const updateNote = useCallback(
    (id: string, patch: Partial<Pick<Note, "title" | "content">>) => {
      setNotes((prev) =>
        prev.map((note) =>
          note.id === id
            ? { ...note, ...patch, updatedAt: Date.now() }
            : note,
        ),
      );

      pendingUpdates.current[id] = {
        ...pendingUpdates.current[id],
        ...patch,
      };
      const existingTimer = updateTimers.current[id];
      if (existingTimer) window.clearTimeout(existingTimer);
      updateTimers.current[id] = window.setTimeout(() => {
        const pendingPatch = pendingUpdates.current[id];
        delete pendingUpdates.current[id];
        delete updateTimers.current[id];
        if (!pendingPatch) return;

        void (async () => {
          await pendingCreates.current[id];
          const { error } = await supabase
            .from("notes")
            .update({ ...pendingPatch, updated_at: new Date().toISOString() })
            .eq("id", id);
          if (error) console.error("Could not save note changes.", error);
        })();
      }, 400);
    },
    [supabase],
  );

  const removeNote = useCallback(
    (id: string) => {
      setNotes((prev) => prev.filter((note) => note.id !== id));
      void supabase.from("notes").delete().eq("id", id);
    },
    [supabase],
  );

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

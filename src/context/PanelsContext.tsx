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
import { usePathname } from "next/navigation";

const PANEL_MS = 320;
const ORDER_KEY = "pompom-panel-order";

export type PanelId = "todo" | "notes";

type PanelState = {
  isOpen: boolean;
  isClosing: boolean;
};

type PanelsContextValue = {
  todo: PanelState;
  notes: PanelState;
  order: PanelId[];
  openPanel: (id: PanelId) => void;
  closePanel: (id: PanelId) => void;
  togglePanel: (id: PanelId) => void;
  movePanel: (fromId: PanelId, toId: PanelId) => void;
};

const PanelsContext = createContext<PanelsContextValue | null>(null);

function loadOrder(): PanelId[] {
  if (typeof window === "undefined") return ["todo", "notes"];
  try {
    const raw = localStorage.getItem(ORDER_KEY);
    if (!raw) return ["todo", "notes"];
    const parsed = JSON.parse(raw) as PanelId[];
    if (
      Array.isArray(parsed) &&
      parsed.length === 2 &&
      parsed.includes("todo") &&
      parsed.includes("notes")
    ) {
      return parsed;
    }
  } catch {
    /* ignore */
  }
  return ["todo", "notes"];
}

export function PanelsProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [todo, setTodo] = useState<PanelState>({
    isOpen: false,
    isClosing: false,
  });
  const [notes, setNotes] = useState<PanelState>({
    isOpen: false,
    isClosing: false,
  });
  const [order, setOrder] = useState<PanelId[]>(["todo", "notes"]);

  const todoClosingRef = useRef(false);
  const notesClosingRef = useRef(false);
  const todoTimerRef = useRef<number | null>(null);
  const notesTimerRef = useRef<number | null>(null);

  useEffect(() => {
    setOrder(loadOrder());
  }, []);

  useEffect(() => {
    localStorage.setItem(ORDER_KEY, JSON.stringify(order));
  }, [order]);

  // Deep links open a panel without closing the other
  useEffect(() => {
    if (pathname === "/todo") {
      todoClosingRef.current = false;
      setTodo({ isOpen: true, isClosing: false });
    }
    if (pathname === "/notes") {
      notesClosingRef.current = false;
      setNotes({ isOpen: true, isClosing: false });
    }
  }, [pathname]);

  useEffect(() => {
    return () => {
      if (todoTimerRef.current !== null) window.clearTimeout(todoTimerRef.current);
      if (notesTimerRef.current !== null) window.clearTimeout(notesTimerRef.current);
    };
  }, []);

  const openPanel = useCallback((id: PanelId) => {
    if (id === "todo") {
      if (todoClosingRef.current) return;
      setTodo({ isOpen: true, isClosing: false });
      return;
    }
    if (notesClosingRef.current) return;
    setNotes({ isOpen: true, isClosing: false });
  }, []);

  const closePanel = useCallback((id: PanelId) => {
    if (id === "todo") {
      if (!todo.isOpen || todoClosingRef.current) return;
      todoClosingRef.current = true;
      setTodo({ isOpen: true, isClosing: true });
      todoTimerRef.current = window.setTimeout(() => {
        setTodo({ isOpen: false, isClosing: false });
        todoClosingRef.current = false;
        todoTimerRef.current = null;
      }, PANEL_MS);
      return;
    }

    if (!notes.isOpen || notesClosingRef.current) return;
    notesClosingRef.current = true;
    setNotes({ isOpen: true, isClosing: true });
    notesTimerRef.current = window.setTimeout(() => {
      setNotes({ isOpen: false, isClosing: false });
      notesClosingRef.current = false;
      notesTimerRef.current = null;
    }, PANEL_MS);
  }, [todo.isOpen, notes.isOpen]);

  const togglePanel = useCallback(
    (id: PanelId) => {
      const state = id === "todo" ? todo : notes;
      const closing =
        id === "todo" ? todoClosingRef.current : notesClosingRef.current;
      if (state.isOpen && !closing) {
        closePanel(id);
        return;
      }
      openPanel(id);
    },
    [todo, notes, closePanel, openPanel],
  );

  const movePanel = useCallback((fromId: PanelId, toId: PanelId) => {
    if (fromId === toId) return;
    setOrder((prev) => {
      const next = [...prev];
      const fromIndex = next.indexOf(fromId);
      const toIndex = next.indexOf(toId);
      if (fromIndex < 0 || toIndex < 0) return prev;
      next.splice(fromIndex, 1);
      next.splice(toIndex, 0, fromId);
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({
      todo,
      notes,
      order,
      openPanel,
      closePanel,
      togglePanel,
      movePanel,
    }),
    [todo, notes, order, openPanel, closePanel, togglePanel, movePanel],
  );

  return (
    <PanelsContext.Provider value={value}>{children}</PanelsContext.Provider>
  );
}

export function usePanels() {
  const ctx = useContext(PanelsContext);
  if (!ctx) {
    throw new Error("usePanels must be used within PanelsProvider");
  }
  return ctx;
}

export const PANEL_ANIMATION_MS = PANEL_MS;

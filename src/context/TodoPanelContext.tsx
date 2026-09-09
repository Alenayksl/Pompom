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
import { usePathname, useRouter } from "next/navigation";

const PANEL_MS = 320;

type TodoPanelContextValue = {
  isOpen: boolean;
  isClosing: boolean;
  openPanel: () => void;
  closePanel: () => void;
  togglePanel: () => void;
};

const TodoPanelContext = createContext<TodoPanelContextValue | null>(null);

export function TodoPanelProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const routeOpen = pathname === "/todo";

  const [isOpen, setIsOpen] = useState(routeOpen);
  const [isClosing, setIsClosing] = useState(false);
  const closingRef = useRef(false);
  const closeTimerRef = useRef<number | null>(null);

  useEffect(() => {
    if (routeOpen) {
      if (closingRef.current) return;
      setIsOpen(true);
      setIsClosing(false);
      return;
    }

    if (!closingRef.current) {
      setIsOpen(false);
      setIsClosing(false);
    }
  }, [routeOpen]);

  useEffect(() => {
    return () => {
      if (closeTimerRef.current !== null) {
        window.clearTimeout(closeTimerRef.current);
      }
    };
  }, []);

  const openPanel = useCallback(() => {
    if (closingRef.current) return;
    setIsOpen(true);
    setIsClosing(false);
    router.push("/todo");
  }, [router]);

  const closePanel = useCallback(() => {
    if (!isOpen || closingRef.current) return;

    closingRef.current = true;
    setIsClosing(true);

    closeTimerRef.current = window.setTimeout(() => {
      setIsOpen(false);
      setIsClosing(false);
      closingRef.current = false;
      closeTimerRef.current = null;
      router.push("/");
    }, PANEL_MS);
  }, [isOpen, router]);

  const togglePanel = useCallback(() => {
    if (isOpen && !closingRef.current) {
      closePanel();
      return;
    }
    openPanel();
  }, [isOpen, closePanel, openPanel]);

  const value = useMemo(
    () => ({ isOpen, isClosing, openPanel, closePanel, togglePanel }),
    [isOpen, isClosing, openPanel, closePanel, togglePanel],
  );

  return (
    <TodoPanelContext.Provider value={value}>
      {children}
    </TodoPanelContext.Provider>
  );
}

export function useTodoPanel() {
  const ctx = useContext(TodoPanelContext);
  if (!ctx) {
    throw new Error("useTodoPanel must be used within TodoPanelProvider");
  }
  return ctx;
}

export const TODO_PANEL_MS = PANEL_MS;

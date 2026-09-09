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

type NotesPanelContextValue = {
  isOpen: boolean;
  isClosing: boolean;
  openPanel: () => void;
  closePanel: () => void;
  togglePanel: () => void;
};

const NotesPanelContext = createContext<NotesPanelContextValue | null>(null);

export function NotesPanelProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const routeOpen = pathname === "/notes";

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
    router.push("/notes");
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
    <NotesPanelContext.Provider value={value}>
      {children}
    </NotesPanelContext.Provider>
  );
}

export function useNotesPanel() {
  const ctx = useContext(NotesPanelContext);
  if (!ctx) {
    throw new Error("useNotesPanel must be used within NotesPanelProvider");
  }
  return ctx;
}

export const NOTES_PANEL_MS = PANEL_MS;

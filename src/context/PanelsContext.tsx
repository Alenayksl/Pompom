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
const MAX_OPEN_PANELS = 2;

export const PANEL_IDS = ["todo", "notes", "calendar"] as const;

export type PanelId = (typeof PANEL_IDS)[number];

type PanelState = {
  isOpen: boolean;
  isClosing: boolean;
};

type PanelsContextValue = {
  panels: Record<PanelId, PanelState>;
  order: PanelId[];
  openPanel: (id: PanelId) => void;
  closePanel: (id: PanelId) => void;
  togglePanel: (id: PanelId) => void;
  movePanel: (fromId: PanelId, toId: PanelId) => void;
};

const PanelsContext = createContext<PanelsContextValue | null>(null);

const CLOSED: PanelState = { isOpen: false, isClosing: false };

export function isPanelId(value: unknown): value is PanelId {
  return PANEL_IDS.includes(value as PanelId);
}

function loadOrder(): PanelId[] {
  const fallback = [...PANEL_IDS];
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(ORDER_KEY);
    if (!raw) return fallback;
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return fallback;
    // Keep the saved order, then append panels added since it was saved
    const saved = [...new Set(parsed.filter(isPanelId))];
    return [...saved, ...PANEL_IDS.filter((id) => !saved.includes(id))];
  } catch {
    return fallback;
  }
}

function swap(order: PanelId[], a: PanelId, b: PanelId) {
  const next = [...order];
  const aIndex = next.indexOf(a);
  const bIndex = next.indexOf(b);
  if (aIndex < 0 || bIndex < 0) return order;
  next[aIndex] = b;
  next[bIndex] = a;
  return next;
}

export function PanelsProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [panels, setPanels] = useState<Record<PanelId, PanelState>>({
    todo: CLOSED,
    notes: CLOSED,
    calendar: CLOSED,
  });
  const [order, setOrder] = useState<PanelId[]>([...PANEL_IDS]);

  // Open (non-closing) panels, oldest first — the oldest one is replaced
  // when a panel beyond the limit is opened.
  const openStackRef = useRef<PanelId[]>([]);
  const closingRef = useRef<Set<PanelId>>(new Set());
  const timersRef = useRef<Map<PanelId, number>>(new Map());

  useEffect(() => {
    setOrder(loadOrder());
  }, []);

  useEffect(() => {
    localStorage.setItem(ORDER_KEY, JSON.stringify(order));
  }, [order]);

  useEffect(() => {
    const timers = timersRef.current;
    return () => {
      timers.forEach((timer) => window.clearTimeout(timer));
    };
  }, []);

  const setPanel = useCallback((id: PanelId, state: PanelState) => {
    setPanels((prev) => ({ ...prev, [id]: state }));
  }, []);

  const closePanel = useCallback(
    (id: PanelId) => {
      if (!openStackRef.current.includes(id)) return;
      openStackRef.current = openStackRef.current.filter((p) => p !== id);
      closingRef.current.add(id);
      setPanel(id, { isOpen: true, isClosing: true });

      const timer = window.setTimeout(() => {
        setPanel(id, CLOSED);
        closingRef.current.delete(id);
        timersRef.current.delete(id);
      }, PANEL_MS);
      timersRef.current.set(id, timer);
    },
    [setPanel],
  );

  const openPanel = useCallback(
    (id: PanelId) => {
      if (closingRef.current.has(id)) return;
      if (openStackRef.current.includes(id)) return;

      if (openStackRef.current.length >= MAX_OPEN_PANELS) {
        // Replace the oldest open panel and take its place on screen
        const replaced = openStackRef.current[0];
        closePanel(replaced);
        setOrder((prev) => swap(prev, id, replaced));
      }

      openStackRef.current = [...openStackRef.current, id];
      setPanel(id, { isOpen: true, isClosing: false });
    },
    [closePanel, setPanel],
  );

  const togglePanel = useCallback(
    (id: PanelId) => {
      if (openStackRef.current.includes(id)) {
        closePanel(id);
        return;
      }
      openPanel(id);
    },
    [closePanel, openPanel],
  );

  // Deep links open a panel without closing the others (within the limit)
  useEffect(() => {
    const id = pathname.replace(/^\//, "");
    if (isPanelId(id)) openPanel(id);
  }, [pathname, openPanel]);

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
      panels,
      order,
      openPanel,
      closePanel,
      togglePanel,
      movePanel,
    }),
    [panels, order, openPanel, closePanel, togglePanel, movePanel],
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

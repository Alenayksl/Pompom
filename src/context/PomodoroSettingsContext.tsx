"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
} from "react";

const CUSTOM_PRESETS_KEY = "pompom-pomodoro-custom-presets";
const ACTIVE_PRESET_KEY = "pompom-pomodoro-active-preset";

export const MIN_PRESET_MINUTES = 1;
export const MAX_PRESET_MINUTES = 180;

export type PomodoroPreset = {
  id: string;
  name: string;
  focusMinutes: number;
  shortBreakMinutes: number;
  longBreakOptions: number[];
  isCustom: boolean;
};

export type CustomPresetInput = {
  name: string;
  focusMinutes: number;
  shortBreakMinutes: number;
  longBreakMinutes: number;
};

export const BUILT_IN_PRESETS: PomodoroPreset[] = [
  {
    id: "classic",
    name: "Classic",
    focusMinutes: 25,
    shortBreakMinutes: 5,
    longBreakOptions: [15, 30],
    isCustom: false,
  },
  {
    id: "quick",
    name: "Quick focus",
    focusMinutes: 15,
    shortBreakMinutes: 3,
    longBreakOptions: [10, 20],
    isCustom: false,
  },
];

const DEFAULT_PRESET = BUILT_IN_PRESETS[0];

type PomodoroSettingsContextValue = {
  presets: PomodoroPreset[];
  activePreset: PomodoroPreset;
  selectPreset: (id: string) => void;
  addCustomPreset: (input: CustomPresetInput) => string;
  updateCustomPreset: (id: string, input: CustomPresetInput) => void;
  removeCustomPreset: (id: string) => void;
};

const PomodoroSettingsContext =
  createContext<PomodoroSettingsContextValue | null>(null);

function clampMinutes(value: number) {
  if (!Number.isFinite(value)) return MIN_PRESET_MINUTES;
  return Math.min(
    MAX_PRESET_MINUTES,
    Math.max(MIN_PRESET_MINUTES, Math.round(value)),
  );
}

function toCustomPreset(id: string, input: CustomPresetInput): PomodoroPreset {
  return {
    id,
    name: input.name.trim() || "My pomodoro",
    focusMinutes: clampMinutes(input.focusMinutes),
    shortBreakMinutes: clampMinutes(input.shortBreakMinutes),
    longBreakOptions: [clampMinutes(input.longBreakMinutes)],
    isCustom: true,
  };
}

function isStoredPreset(value: unknown): value is PomodoroPreset {
  if (!value || typeof value !== "object") return false;
  const preset = value as Record<string, unknown>;
  return (
    typeof preset.id === "string" &&
    typeof preset.name === "string" &&
    typeof preset.focusMinutes === "number" &&
    typeof preset.shortBreakMinutes === "number" &&
    Array.isArray(preset.longBreakOptions) &&
    preset.longBreakOptions.length > 0 &&
    preset.longBreakOptions.every((minutes) => typeof minutes === "number")
  );
}

type StoredSettings = {
  customPresets: PomodoroPreset[];
  activeId: string;
};

const DEFAULT_SETTINGS: StoredSettings = {
  customPresets: [],
  activeId: DEFAULT_PRESET.id,
};

function loadSettings(): StoredSettings {
  try {
    const raw = localStorage.getItem(CUSTOM_PRESETS_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    const customPresets = Array.isArray(parsed)
      ? parsed
          .filter(isStoredPreset)
          .map((preset) => ({ ...preset, isCustom: true }))
      : [];
    const activeId =
      localStorage.getItem(ACTIVE_PRESET_KEY) ?? DEFAULT_PRESET.id;
    return { customPresets, activeId };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

// Settings live in localStorage; this small store lets React read them
// without a hydration mismatch (the server always renders the defaults).
let settings: StoredSettings | null = null;
const listeners = new Set<() => void>();

function getSnapshot() {
  settings ??= loadSettings();
  return settings;
}

function getServerSnapshot() {
  return DEFAULT_SETTINGS;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function updateSettings(update: (prev: StoredSettings) => StoredSettings) {
  settings = update(getSnapshot());
  try {
    localStorage.setItem(
      CUSTOM_PRESETS_KEY,
      JSON.stringify(settings.customPresets),
    );
    localStorage.setItem(ACTIVE_PRESET_KEY, settings.activeId);
  } catch {
    // Storage unavailable — settings last for this session only
  }
  listeners.forEach((listener) => listener());
}

export function PomodoroSettingsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { customPresets, activeId } = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  const presets = useMemo(
    () => [...BUILT_IN_PRESETS, ...customPresets],
    [customPresets],
  );

  const activePreset =
    presets.find((preset) => preset.id === activeId) ?? DEFAULT_PRESET;

  const selectPreset = useCallback((id: string) => {
    updateSettings((prev) => ({ ...prev, activeId: id }));
  }, []);

  const addCustomPreset = useCallback((input: CustomPresetInput) => {
    const id = `custom-${crypto.randomUUID()}`;
    updateSettings((prev) => ({
      ...prev,
      customPresets: [...prev.customPresets, toCustomPreset(id, input)],
    }));
    return id;
  }, []);

  const updateCustomPreset = useCallback(
    (id: string, input: CustomPresetInput) => {
      updateSettings((prev) => ({
        ...prev,
        customPresets: prev.customPresets.map((preset) =>
          preset.id === id ? toCustomPreset(id, input) : preset,
        ),
      }));
    },
    [],
  );

  const removeCustomPreset = useCallback((id: string) => {
    updateSettings((prev) => ({
      customPresets: prev.customPresets.filter((preset) => preset.id !== id),
      activeId: prev.activeId === id ? DEFAULT_PRESET.id : prev.activeId,
    }));
  }, []);

  const value = useMemo(
    () => ({
      presets,
      activePreset,
      selectPreset,
      addCustomPreset,
      updateCustomPreset,
      removeCustomPreset,
    }),
    [
      presets,
      activePreset,
      selectPreset,
      addCustomPreset,
      updateCustomPreset,
      removeCustomPreset,
    ],
  );

  return (
    <PomodoroSettingsContext.Provider value={value}>
      {children}
    </PomodoroSettingsContext.Provider>
  );
}

export function usePomodoroSettings() {
  const ctx = useContext(PomodoroSettingsContext);
  if (!ctx) {
    throw new Error(
      "usePomodoroSettings must be used within PomodoroSettingsProvider",
    );
  }
  return ctx;
}

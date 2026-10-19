"use client";

import { usePanels } from "@/context/PanelsContext";
import { usePomodoroSettings } from "@/context/PomodoroSettingsContext";
import { PresetDurations } from "@/components/PresetDurations";

export function PomodoroSettings() {
  const { activePreset } = usePomodoroSettings();
  const { panels, togglePanel } = usePanels();
  const { pomodoro } = panels;
  const active = pomodoro.isOpen && !pomodoro.isClosing;

  return (
    <button
      type="button"
      onClick={() => togglePanel("pomodoro")}
      aria-expanded={active}
      className={`flex shrink-0 flex-col rounded-2xl border bg-panel p-4 text-left shadow-[0_1px_0_rgba(92,107,82,0.04)] transition-colors hover:border-sage hover:bg-mist/40 ${
        active ? "border-sage bg-mist/30" : "border-border-soft"
      }`}
    >
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-moss-deep">
          Pomodoro settings
        </h2>
        <span className="text-[10px] font-medium uppercase tracking-wider text-soil-muted">
          {active ? "Close" : "Open"}
        </span>
      </div>
      <div className="flex items-start gap-2 rounded-lg bg-mist/60 px-2.5 py-2">
        <span
          aria-hidden
          className="mt-0.5 flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded bg-panel text-moss-deep"
        >
          <svg
            viewBox="0 0 12 12"
            className="h-2.5 w-2.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          >
            <circle cx="6" cy="6.5" r="4.25" />
            <path d="M6 4.25V6.5l1.5 1" />
          </svg>
        </span>
        <span className="flex min-w-0 flex-col gap-1.5">
          <span className="truncate text-sm leading-snug text-soil">
            {activePreset.name}
          </span>
          <PresetDurations preset={activePreset} />
        </span>
      </div>
    </button>
  );
}

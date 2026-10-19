"use client";

import { usePanels } from "@/context/PanelsContext";
import { usePomodoroSettings } from "@/context/PomodoroSettingsContext";

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
      <div className="mb-2 flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-moss-deep">
          Pomodoro settings
        </h2>
        <span className="text-[10px] font-medium uppercase tracking-wider text-soil-muted">
          {active ? "Close" : "Open"}
        </span>
      </div>
      <p className="truncate text-sm font-medium text-soil">
        {activePreset.name}
      </p>
      <p className="text-xs text-soil-muted">
        {activePreset.focusMinutes} min focus · {activePreset.shortBreakMinutes}{" "}
        min break
      </p>
    </button>
  );
}

"use client";

import { useState, type FormEvent } from "react";
import { PresetDurations } from "@/components/PresetDurations";
import {
  MAX_PRESET_MINUTES,
  MIN_PRESET_MINUTES,
  usePomodoroSettings,
  type CustomPresetInput,
  type PomodoroPreset,
} from "@/context/PomodoroSettingsContext";

type PomodoroSettingsPanelProps = {
  isClosing: boolean;
  onClose: () => void;
};

const EMPTY_DRAFT: CustomPresetInput = {
  name: "",
  focusMinutes: 50,
  shortBreakMinutes: 10,
  longBreakMinutes: 30,
};

type PresetFormProps = {
  initial: CustomPresetInput;
  submitLabel: string;
  onSubmit: (input: CustomPresetInput) => void;
  onCancel: () => void;
};

function PresetForm({ initial, submitLabel, onSubmit, onCancel }: PresetFormProps) {
  const [draft, setDraft] = useState(initial);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    onSubmit(draft);
  }

  const durationFields: {
    key: keyof Omit<CustomPresetInput, "name">;
    label: string;
    tone: string;
  }[] = [
    { key: "focusMinutes", label: "Focus", tone: "bg-mist text-moss-deep" },
    { key: "shortBreakMinutes", label: "Break", tone: "bg-butter-soft text-honey-deep" },
    { key: "longBreakMinutes", label: "Long break", tone: "bg-butter-soft text-honey-deep" },
  ];

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-3 rounded-xl border border-sage bg-panel p-3"
    >
      <label className="flex flex-col gap-1">
        <span className="text-[10px] font-medium uppercase tracking-wider text-soil-muted">
          Name
        </span>
        <input
          type="text"
          value={draft.name}
          onChange={(e) => setDraft({ ...draft, name: e.target.value })}
          placeholder="My pomodoro"
          maxLength={40}
          className="rounded-lg border border-border-soft bg-cream px-2.5 py-1.5 text-sm text-soil outline-none placeholder:text-soil-muted/70 focus:border-sage"
        />
      </label>

      <div className="grid grid-cols-3 gap-2">
        {durationFields.map(({ key, label, tone }) => (
          <label key={key} className="flex flex-col gap-1">
            <span className="text-[10px] font-medium uppercase tracking-wider text-soil-muted">
              {label}
            </span>
            <div className={`flex items-center gap-1 rounded-lg border border-transparent px-2 py-1.5 focus-within:border-sage ${tone}`}>
              <input
                type="number"
                required
                min={MIN_PRESET_MINUTES}
                max={MAX_PRESET_MINUTES}
                value={Number.isNaN(draft[key]) ? "" : draft[key]}
                onChange={(e) =>
                  setDraft({ ...draft, [key]: e.target.valueAsNumber })
                }
                className="w-full min-w-0 bg-transparent text-sm font-medium tabular-nums outline-none"
              />
              <span className="text-[10px] opacity-70">min</span>
            </div>
          </label>
        ))}
      </div>

      <div className="flex gap-2">
        <button
          type="submit"
          className="flex-1 rounded-lg bg-moss px-3 py-1.5 text-sm font-medium text-cream transition-colors hover:bg-moss-deep"
        >
          {submitLabel}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 rounded-lg border border-border-soft bg-cream px-3 py-1.5 text-sm font-medium text-soil-muted transition-colors hover:bg-mist"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

type PresetCardProps = {
  preset: PomodoroPreset;
  isActive: boolean;
  onSelect: () => void;
  onEdit: () => void;
  onDelete: () => void;
};

function PresetCard({ preset, isActive, onSelect, onEdit, onDelete }: PresetCardProps) {
  return (
    <div
      className={`group relative rounded-xl border transition-colors ${
        isActive
          ? "border-moss bg-mist shadow-[0_1px_0_rgba(92,107,82,0.08)]"
          : "border-border-soft bg-panel hover:border-sage hover:bg-mist/40"
      }`}
    >
      <button
        type="button"
        onClick={onSelect}
        aria-pressed={isActive}
        className="flex w-full flex-col gap-2 px-3 py-3 text-left"
      >
        <span className="flex items-center gap-2">
          <span
            aria-hidden
            className={`flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full border ${
              isActive ? "border-moss bg-moss" : "border-sage bg-panel"
            }`}
          >
            {isActive && <span className="h-1.5 w-1.5 rounded-full bg-cream" />}
          </span>
          <span className="text-sm font-semibold text-soil">{preset.name}</span>
          {isActive && (
            <span className="rounded-full bg-moss px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-cream">
              Active
            </span>
          )}
        </span>
        <span className="pl-5.5">
          <PresetDurations preset={preset} showLongBreak />
        </span>
      </button>

      {preset.isCustom && (
        <div className="absolute right-2 top-2 flex gap-1 opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100">
          <button
            type="button"
            onClick={onEdit}
            className="rounded-md px-1.5 py-0.5 text-xs text-soil-muted hover:bg-mist hover:text-soil"
            aria-label={`Edit "${preset.name}"`}
          >
            Edit
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="rounded-md px-1.5 py-0.5 text-xs text-soil-muted hover:bg-mist hover:text-soil"
            aria-label={`Delete "${preset.name}"`}
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}

export function PomodoroSettingsPanel({ isClosing, onClose }: PomodoroSettingsPanelProps) {
  const {
    presets,
    activePreset,
    selectPreset,
    addCustomPreset,
    updateCustomPreset,
    removeCustomPreset,
  } = usePomodoroSettings();
  // "new" while the add form is open, a preset id while editing it
  const [editingId, setEditingId] = useState<string | null>(null);

  function handleAdd(input: CustomPresetInput) {
    const id = addCustomPreset(input);
    selectPreset(id);
    setEditingId(null);
  }

  function handleUpdate(id: string, input: CustomPresetInput) {
    updateCustomPreset(id, input);
    setEditingId(null);
  }

  const sections = [
    { title: "Presets", items: presets.filter((preset) => !preset.isCustom) },
    { title: "Your pomodoros", items: presets.filter((preset) => preset.isCustom) },
  ];

  function renderPreset(preset: PomodoroPreset) {
    if (editingId === preset.id) {
      return (
        <PresetForm
          key={preset.id}
          initial={{
            name: preset.name,
            focusMinutes: preset.focusMinutes,
            shortBreakMinutes: preset.shortBreakMinutes,
            longBreakMinutes: preset.longBreakOptions[0],
          }}
          submitLabel="Save"
          onSubmit={(input) => handleUpdate(preset.id, input)}
          onCancel={() => setEditingId(null)}
        />
      );
    }
    return (
      <PresetCard
        key={preset.id}
        preset={preset}
        isActive={preset.id === activePreset.id}
        onSelect={() => selectPreset(preset.id)}
        onEdit={() => setEditingId(preset.id)}
        onDelete={() => removeCustomPreset(preset.id)}
      />
    );
  }

  return (
    <div
      className={`h-full shrink-0 overflow-hidden ${
        isClosing ? "todo-panel-exit" : "todo-panel-enter"
      }`}
    >
      <section className="flex h-full w-[22rem] flex-col border-r border-border-soft bg-cream-deep">
        <header className="flex items-start justify-between gap-3 border-b border-border-soft px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            className="text-left transition-colors hover:text-moss-deep"
          >
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-soil-muted">
              Pomodoro
            </p>
            <h2 className="mt-1 text-lg font-semibold text-soil">Settings</h2>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-border-soft bg-panel px-2.5 py-1.5 text-xs font-medium text-soil-muted transition-colors hover:bg-mist hover:text-soil"
          >
            Close
          </button>
        </header>

        <div className="flex flex-1 flex-col gap-2 overflow-y-auto px-5 py-4">
          <p className="pb-1 text-xs leading-snug text-soil-muted">
            Pick how long you focus and rest. Changes apply from the next
            focus session.
          </p>

          {sections.map(({ title, items }) =>
            items.length === 0 ? null : (
              <div key={title} className="flex flex-col gap-2">
                <h3 className="pt-1 text-[10px] font-medium uppercase tracking-[0.18em] text-soil-muted">
                  {title}
                </h3>
                {items.map(renderPreset)}
              </div>
            ),
          )}

          {editingId === "new" ? (
            <PresetForm
              initial={EMPTY_DRAFT}
              submitLabel="Add"
              onSubmit={handleAdd}
              onCancel={() => setEditingId(null)}
            />
          ) : (
            <button
              type="button"
              onClick={() => setEditingId("new")}
              className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-sage bg-mist/40 px-3 py-4 text-sm font-medium text-moss-deep transition-colors hover:bg-mist"
            >
              <span aria-hidden className="text-base leading-none">+</span>
              Add pomodoro
            </button>
          )}
        </div>
      </section>
    </div>
  );
}

import type { PomodoroPreset } from "@/context/PomodoroSettingsContext";

type PresetDurationsProps = {
  preset: PomodoroPreset;
  showLongBreak?: boolean;
};

const PILL = "rounded-md px-1.5 py-0.5 text-[11px] font-medium tabular-nums";

// Focus durations use the green palette, breaks the butter yellow one —
// matching the timer's phase colors.
export function PresetDurations({ preset, showLongBreak = false }: PresetDurationsProps) {
  return (
    <span className="flex flex-wrap gap-1">
      <span className={`${PILL} bg-sage-soft text-moss-deep`}>
        {preset.focusMinutes}m focus
      </span>
      <span className={`${PILL} bg-butter-soft text-honey-deep`}>
        {preset.shortBreakMinutes}m break
      </span>
      {showLongBreak && (
        <span className={`${PILL} bg-butter text-honey-deep`}>
          {preset.longBreakOptions.join("/")}m long
        </span>
      )}
    </span>
  );
}

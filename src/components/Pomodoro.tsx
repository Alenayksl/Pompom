"use client";

import { useEffect, useRef, useState } from "react";
import {
  playBreakCompleteSound,
  playFocusCompleteSound,
  unlockAudio,
} from "@/lib/sounds";
import { usePomodoroSettings } from "@/context/PomodoroSettingsContext";

type TimerPhase = "focus" | "short-break" | "long-break" | "long-choice";

const PHASE_TITLES: Record<Exclude<TimerPhase, "long-choice">, string> = {
  focus: "Focus",
  "short-break": "Short break",
  "long-break": "Long break",
};

const POMODOROS_BEFORE_LONG_BREAK = 8;

function deadlineIn(seconds: number) {
  return Date.now() + seconds * 1000;
}

function formatTime(seconds: number) {
  const minutes = Math.floor(seconds / 60).toString().padStart(2, "0");
  const remainingSeconds = (seconds % 60).toString().padStart(2, "0");
  return `${minutes}:${remainingSeconds}`;
}

type PomodoroProps = {
  onFocusComplete?: () => void;
  onLongBreakComplete?: () => void;
  onReset?: () => void;
};

export function Pomodoro({
  onFocusComplete,
  onLongBreakComplete,
  onReset,
}: PomodoroProps) {
  const { activePreset } = usePomodoroSettings();
  const focusSeconds = activePreset.focusMinutes * 60;
  const shortBreakSeconds = activePreset.shortBreakMinutes * 60;

  const [phase, setPhase] = useState<TimerPhase>("focus");
  const [secondsLeft, setSecondsLeft] = useState(focusSeconds);
  const [isRunning, setIsRunning] = useState(false);
  const [completedPomodoros, setCompletedPomodoros] = useState(0);
  // Wall-clock end of the running phase; background tabs throttle timers, so we
  // derive the remaining time from this instead of counting ticks.
  const endsAtRef = useRef<number | null>(null);

  // A new preset takes effect immediately only if the focus timer hasn't been
  // started yet; otherwise it applies from the next phase.
  const [syncedFocusSeconds, setSyncedFocusSeconds] = useState(focusSeconds);
  if (focusSeconds !== syncedFocusSeconds) {
    setSyncedFocusSeconds(focusSeconds);
    if (!isRunning && phase === "focus" && secondsLeft === syncedFocusSeconds) {
      setSecondsLeft(focusSeconds);
    }
  }

  useEffect(() => {
    if (!isRunning || phase === "long-choice") return;

    const interval = window.setInterval(() => {
      const endsAt = endsAtRef.current;
      if (endsAt === null) return;

      const remaining = Math.ceil((endsAt - Date.now()) / 1000);
      if (remaining > 0) {
        setSecondsLeft(remaining);
        return;
      }

      if (phase === "focus") {
        playFocusCompleteSound();
        const nextCompleted = completedPomodoros + 1;
        setCompletedPomodoros(nextCompleted);
        onFocusComplete?.();
        if (nextCompleted === POMODOROS_BEFORE_LONG_BREAK) {
          endsAtRef.current = null;
          setPhase("long-choice");
          setIsRunning(false);
          setSecondsLeft(0);
          return;
        }
        endsAtRef.current = deadlineIn(shortBreakSeconds);
        setPhase("short-break");
        setSecondsLeft(shortBreakSeconds);
        return;
      }

      playBreakCompleteSound();
      if (phase === "long-break") {
        onLongBreakComplete?.();
        setCompletedPomodoros(0);
      }
      endsAtRef.current = deadlineIn(focusSeconds);
      setPhase("focus");
      setSecondsLeft(focusSeconds);
    }, 250);

    return () => window.clearInterval(interval);
  }, [
    completedPomodoros,
    focusSeconds,
    isRunning,
    onFocusComplete,
    onLongBreakComplete,
    phase,
    shortBreakSeconds,
  ]);

  const isIdle = !isRunning && phase === "focus" && secondsLeft === focusSeconds;

  useEffect(() => {
    if (isIdle) return;

    const originalTitle = document.title;
    document.title =
      phase === "long-choice"
        ? `Long break time! | pomPom`
        : `${isRunning ? "" : "⏸ "}${formatTime(secondsLeft)} · ${PHASE_TITLES[phase]} | pomPom`;

    return () => {
      document.title = originalTitle;
    };
  }, [isIdle, isRunning, phase, secondsLeft]);

  function toggleRunning() {
    if (isRunning) {
      endsAtRef.current = null;
      setIsRunning(false);
      return;
    }
    unlockAudio();
    endsAtRef.current = deadlineIn(secondsLeft);
    setIsRunning(true);
  }

  function resetTimer() {
    endsAtRef.current = null;
    setIsRunning(false);
    setPhase("focus");
    setSecondsLeft(focusSeconds);
    setCompletedPomodoros(0);
    onReset?.();
  }

  function chooseLongBreak(minutes: number) {
    unlockAudio();
    endsAtRef.current = deadlineIn(minutes * 60);
    setPhase("long-break");
    setSecondsLeft(minutes * 60);
    setIsRunning(true);
    setCompletedPomodoros(0);
  }

  const phaseLabel =
    phase === "focus"
      ? "Focus"
      : phase === "short-break"
        ? "Short break"
        : phase === "long-break"
          ? "Long break"
          : "Choose a long break";

  return (
    <section className="rounded-2xl border border-border-soft bg-panel p-4 shadow-[0_1px_0_rgba(92,107,82,0.04)]">
      <h2 className="mb-3 text-sm font-semibold text-moss-deep">Pomodoro</h2>
      <div className="flex flex-col items-center gap-4">
        <div className="flex h-28 w-28 items-center justify-center rounded-full border-4 border-sage-soft bg-mist">
          <div className="text-center">
            <p className="text-2xl font-semibold tabular-nums tracking-tight text-soil">{formatTime(secondsLeft)}</p>
            <p className="text-[10px] font-medium uppercase tracking-wider text-soil-muted">{phaseLabel}</p>
          </div>
        </div>

        {phase === "long-choice" ? (
          <div className="w-full rounded-xl bg-sage-soft/60 p-3 text-center">
            <p className="mb-2 text-xs font-medium text-soil">{POMODOROS_BEFORE_LONG_BREAK} pomodoros complete. Choose a long break.</p>
            <div className="flex gap-2">
              {activePreset.longBreakOptions.map((minutes) => (
                <button
                  key={minutes}
                  type="button"
                  onClick={() => chooseLongBreak(minutes)}
                  className="flex-1 rounded-xl bg-moss px-2 py-2 text-sm font-medium text-cream transition-colors hover:bg-moss-deep"
                >
                  {minutes} min
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex w-full gap-2">
            <button
              type="button"
              onClick={toggleRunning}
              className="flex-1 rounded-xl bg-moss px-3 py-2 text-sm font-medium text-cream transition-colors hover:bg-moss-deep"
            >
              {isRunning ? "Pause" : "Start"}
            </button>
            <button
              type="button"
              onClick={resetTimer}
              className="flex-1 rounded-xl border border-border-soft bg-cream px-3 py-2 text-sm font-medium text-soil-muted transition-colors hover:bg-mist"
            >
              Reset
            </button>
          </div>
        )}

        <p className="text-xs text-soil-muted">
          {completedPomodoros}/{POMODOROS_BEFORE_LONG_BREAK} pomodoros
        </p>
      </div>
    </section>
  );
}

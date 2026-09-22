"use client";

import { useEffect, useState } from "react";

type TimerPhase = "focus" | "short-break" | "long-break" | "long-choice";

const FOCUS_SECONDS = 25 * 60;
const SHORT_BREAK_SECONDS = 5 * 60;
const LONG_BREAK_OPTIONS = [15, 30] as const;
const POMODOROS_BEFORE_LONG_BREAK = 8;

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
  const [phase, setPhase] = useState<TimerPhase>("focus");
  const [secondsLeft, setSecondsLeft] = useState(FOCUS_SECONDS);
  const [isRunning, setIsRunning] = useState(false);
  const [completedPomodoros, setCompletedPomodoros] = useState(0);

  useEffect(() => {
    if (!isRunning || phase === "long-choice") return;

    const interval = window.setInterval(() => {
      if (secondsLeft > 1) {
        setSecondsLeft(secondsLeft - 1);
        return;
      }

      if (phase === "focus") {
        const nextCompleted = completedPomodoros + 1;
        setCompletedPomodoros(nextCompleted);
        onFocusComplete?.();
        if (nextCompleted === POMODOROS_BEFORE_LONG_BREAK) {
          setPhase("long-choice");
          setIsRunning(false);
          setSecondsLeft(0);
          return;
        }
        setPhase("short-break");
        setSecondsLeft(SHORT_BREAK_SECONDS);
        return;
      }

      if (phase === "long-break") {
        onLongBreakComplete?.();
        setCompletedPomodoros(0);
      }
      setPhase("focus");
      setSecondsLeft(FOCUS_SECONDS);
    }, 1000);

    return () => window.clearInterval(interval);
  }, [
    completedPomodoros,
    isRunning,
    onFocusComplete,
    onLongBreakComplete,
    phase,
    secondsLeft,
  ]);

  function resetTimer() {
    setIsRunning(false);
    setPhase("focus");
    setSecondsLeft(FOCUS_SECONDS);
    setCompletedPomodoros(0);
    onReset?.();
  }

  function chooseLongBreak(minutes: number) {
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
            <p className="mb-2 text-xs font-medium text-soil">Four pomodoros complete. Choose a long break.</p>
            <div className="flex gap-2">
              {LONG_BREAK_OPTIONS.map((minutes) => (
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
              onClick={() => setIsRunning((running) => !running)}
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

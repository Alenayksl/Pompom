"use client";

import { useMemo } from "react";
import { useCalendar } from "@/context/CalendarContext";
import type { CalendarEvent } from "@/types/calendar";

type CalendarPanelProps = {
  isClosing: boolean;
  onClose: () => void;
};

function dayKey(date: Date) {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

function formatDayHeading(date: Date) {
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);

  if (dayKey(date) === dayKey(today)) return "Today";
  if (dayKey(date) === dayKey(tomorrow)) return "Tomorrow";
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  }).format(date);
}

export function formatEventTime(
  event: CalendarEvent,
  { withDay = false }: { withDay?: boolean } = {},
) {
  const time = new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
  const day = withDay ? `${formatDayHeading(event.start)} · ` : "";

  if (event.allDay) return `${day}All day`;
  return `${day}${time.format(event.start)} – ${time.format(event.end)}`;
}

export function CalendarPanel({ isClosing, onClose }: CalendarPanelProps) {
  const { status, events, isFetching, error, connect, disconnect, refresh } =
    useCalendar();

  const days = useMemo(() => {
    const groups = new Map<string, { date: Date; events: CalendarEvent[] }>();
    for (const event of events) {
      // Multi-day all-day events are listed on their first day only
      const key = dayKey(event.start);
      const group = groups.get(key) ?? { date: event.start, events: [] };
      group.events.push(event);
      groups.set(key, group);
    }
    return [...groups.values()];
  }, [events]);

  return (
    <div
      className={`h-full shrink-0 overflow-hidden ${
        isClosing ? "calendar-panel-exit" : "calendar-panel-enter"
      }`}
    >
      <section className="flex h-full w-[26rem] flex-col border-r border-border-soft bg-cream-deep">
        <header className="flex items-start justify-between gap-3 border-b border-border-soft px-5 py-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-soil-muted">
              Google Calendar
            </p>
            <h2 className="mt-1 text-lg font-semibold text-soil">This week</h2>
          </div>
          <div className="flex items-center gap-2">
            {status === "connected" ? (
              <button
                type="button"
                onClick={refresh}
                disabled={isFetching}
                className="rounded-lg border border-border-soft bg-panel px-2.5 py-1.5 text-xs font-medium text-soil-muted transition-colors hover:bg-mist hover:text-soil disabled:opacity-60"
              >
                {isFetching ? "Loading..." : "Refresh"}
              </button>
            ) : null}
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-border-soft bg-panel px-2.5 py-1.5 text-xs font-medium text-soil-muted transition-colors hover:bg-mist hover:text-soil"
            >
              Close
            </button>
          </div>
        </header>

        {error ? (
          <p className="mx-5 mt-4 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        ) : null}

        {status === "connected" ? (
          <>
            <div className="flex flex-1 flex-col gap-5 overflow-y-auto px-5 py-4">
              {days.length === 0 ? (
                <div className="flex flex-1 items-center justify-center rounded-xl border border-dashed border-sage bg-mist/40 px-3 py-8">
                  <p className="text-center text-sm text-soil-muted">
                    {isFetching
                      ? "Loading your events..."
                      : "Nothing scheduled for the next 7 days"}
                  </p>
                </div>
              ) : (
                days.map((day) => (
                  <div key={dayKey(day.date)}>
                    <h3 className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-soil-muted">
                      {formatDayHeading(day.date)}
                    </h3>
                    <ul className="flex flex-col gap-2">
                      {day.events.map((event) => (
                        <li key={event.id}>
                          <a
                            href={event.htmlLink ?? undefined}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex gap-3 rounded-xl border border-border-soft bg-panel px-3 py-2.5 transition-colors hover:border-sage hover:bg-mist/40"
                          >
                            <span
                              aria-hidden
                              className="w-1 shrink-0 rounded-full bg-moss"
                            />
                            <span className="min-w-0">
                              <span className="block truncate text-sm font-medium text-soil">
                                {event.title}
                              </span>
                              <span className="block text-xs text-soil-muted">
                                {formatEventTime(event)}
                              </span>
                              {event.location ? (
                                <span className="mt-0.5 block truncate text-[11px] text-soil-muted">
                                  {event.location}
                                </span>
                              ) : null}
                            </span>
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))
              )}
            </div>

            <footer className="flex items-center justify-between gap-2 border-t border-border-soft px-5 py-3">
              <a
                href="https://calendar.google.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-medium text-moss-deep underline-offset-2 hover:underline"
              >
                Open Google Calendar
              </a>
              <button
                type="button"
                onClick={disconnect}
                className="rounded-md px-2 py-1 text-xs text-soil-muted transition-colors hover:bg-mist hover:text-soil"
              >
                Disconnect
              </button>
            </footer>
          </>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 px-8 text-center">
            <p className="text-sm text-soil-muted">
              Connect your Google Calendar to see this week&apos;s events next
              to your focus sessions. Pompom only reads your events.
            </p>
            <button
              type="button"
              onClick={connect}
              disabled={status !== "disconnected"}
              className="rounded-xl bg-moss px-4 py-2 text-sm font-medium text-cream transition-colors hover:bg-moss-deep disabled:opacity-60"
            >
              {status === "disconnected"
                ? "Connect Google Calendar"
                : "Connecting..."}
            </button>
          </div>
        )}
      </section>
    </div>
  );
}

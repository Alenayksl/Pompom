"use client";

import { isCalendarConfigured, useCalendar } from "@/context/CalendarContext";
import { usePanels } from "@/context/PanelsContext";
import { formatEventTime } from "@/components/CalendarPanel";

export function Calendar() {
  const { status, upcomingEvents } = useCalendar();
  const { panels, togglePanel } = usePanels();
  const { calendar } = panels;
  const active = calendar.isOpen && !calendar.isClosing;

  let emptyMessage: string | null = null;
  if (!isCalendarConfigured) return null;

  if (status === "disconnected") {
    emptyMessage = "Not connected — click to link Google Calendar";
  } else if (status === "loading" || status === "connecting") {
    emptyMessage = "Connecting...";
  } else if (upcomingEvents.length === 0) {
    emptyMessage = "Nothing scheduled this week";
  }

  return (
    <button
      type="button"
      onClick={() => togglePanel("calendar")}
      aria-expanded={active}
      className={`flex shrink-0 flex-col rounded-2xl border bg-panel p-4 text-left shadow-[0_1px_0_rgba(92,107,82,0.04)] transition-colors hover:border-sage hover:bg-mist/40 ${
        active ? "border-sage bg-mist/30" : "border-border-soft"
      }`}
    >
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-moss-deep">Calendar</h2>
        <span className="text-[10px] font-medium uppercase tracking-wider text-soil-muted">
          {active ? "Close" : "Open"}
        </span>
      </div>

      {emptyMessage ? (
        <p className="line-clamp-2 min-h-0 overflow-hidden text-xs leading-snug text-soil-muted">
          {emptyMessage}
        </p>
      ) : (
        <ul className="flex flex-1 flex-col gap-2 overflow-hidden">
          {upcomingEvents.map((event) => (
            <li
              key={event.id}
              className="flex items-start gap-2 rounded-lg bg-mist/60 px-2.5 py-2"
            >
              <span
                aria-hidden
                className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-moss"
              />
              <span className="min-w-0">
                <span className="line-clamp-1 text-sm leading-snug text-soil">
                  {event.title}
                </span>
                <span className="block text-[11px] text-soil-muted">
                  {formatEventTime(event, { withDay: true })}
                </span>
              </span>
            </li>
          ))}
        </ul>
      )}
    </button>
  );
}

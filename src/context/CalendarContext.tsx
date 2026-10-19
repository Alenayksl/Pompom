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
import type { CalendarEvent, GoogleCalendarApiEvent } from "@/types/calendar";

const GIS_SCRIPT_SRC = "https://accounts.google.com/gsi/client";
const CALENDAR_SCOPE = "https://www.googleapis.com/auth/calendar.readonly";
const EVENTS_URL =
  "https://www.googleapis.com/calendar/v3/calendars/primary/events";
export const CALENDAR_TOKEN_KEY = "pompom-google-calendar-token";
const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

// Without a client ID the calendar is left out of the UI entirely
export const isCalendarConfigured = Boolean(GOOGLE_CLIENT_ID);
const DAYS_AHEAD = 7;

// Minimal typings for the Google Identity Services token client
type TokenResponse = {
  access_token?: string;
  expires_in?: number;
  error?: string;
  error_description?: string;
};

type TokenClient = {
  requestAccessToken: (overrides?: { prompt?: string }) => void;
};

type GoogleAccounts = {
  oauth2: {
    initTokenClient: (config: {
      client_id: string;
      scope: string;
      callback: (response: TokenResponse) => void;
      error_callback?: (error: { type: string; message?: string }) => void;
    }) => TokenClient;
    revoke: (token: string, done?: () => void) => void;
  };
};

declare global {
  interface Window {
    google?: { accounts: GoogleAccounts };
  }
}

type StoredToken = {
  accessToken: string;
  expiresAt: number;
};

export type CalendarStatus =
  | "loading"
  | "disconnected"
  | "connecting"
  | "connected";

type CalendarContextValue = {
  status: CalendarStatus;
  events: CalendarEvent[];
  upcomingEvents: CalendarEvent[];
  isFetching: boolean;
  error: string | null;
  connect: () => void;
  disconnect: () => void;
  refresh: () => void;
};

const CalendarContext = createContext<CalendarContextValue | null>(null);

function loadStoredToken(): StoredToken | null {
  try {
    const raw = sessionStorage.getItem(CALENDAR_TOKEN_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredToken;
    if (parsed.accessToken && parsed.expiresAt > Date.now()) return parsed;
  } catch {
    /* ignore */
  }
  sessionStorage.removeItem(CALENDAR_TOKEN_KEY);
  return null;
}

function loadGisScript(): Promise<void> {
  if (window.google?.accounts?.oauth2) return Promise.resolve();

  return new Promise((resolve, reject) => {
    let script = document.querySelector<HTMLScriptElement>(
      `script[src="${GIS_SCRIPT_SRC}"]`,
    );
    if (!script) {
      script = document.createElement("script");
      script.src = GIS_SCRIPT_SRC;
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }
    script.addEventListener("load", () => resolve(), { once: true });
    script.addEventListener(
      "error",
      () => reject(new Error("Could not load Google sign-in.")),
      { once: true },
    );
  });
}

function toEvent(item: GoogleCalendarApiEvent): CalendarEvent | null {
  const startRaw = item.start?.dateTime ?? item.start?.date;
  const endRaw = item.end?.dateTime ?? item.end?.date ?? startRaw;
  if (!startRaw || !endRaw || item.status === "cancelled") return null;

  const allDay = !item.start?.dateTime;
  // All-day dates ("2026-10-16") parse as UTC midnight; read them as local days
  const parse = (value: string) =>
    allDay ? new Date(`${value}T00:00:00`) : new Date(value);

  return {
    id: item.id,
    title: item.summary?.trim() || "(No title)",
    start: parse(startRaw),
    end: parse(endRaw),
    allDay,
    location: item.location ?? null,
    htmlLink: item.htmlLink ?? null,
  };
}

export function CalendarProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<CalendarStatus>(
    isCalendarConfigured ? "loading" : "disconnected",
  );
  const [token, setToken] = useState<StoredToken | null>(null);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [reloadCount, setReloadCount] = useState(0);
  const [loadedKey, setLoadedKey] = useState<string | null>(null);
  const [fetchedAt, setFetchedAt] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const tokenClientRef = useRef<TokenClient | null>(null);

  const clearToken = useCallback(() => {
    sessionStorage.removeItem(CALENDAR_TOKEN_KEY);
    setToken(null);
    setEvents([]);
    setStatus("disconnected");
  }, []);

  useEffect(() => {
    const clientId = GOOGLE_CLIENT_ID;
    if (!clientId) return;
    let cancelled = false;

    loadGisScript()
      .then(() => {
        if (cancelled || !window.google) return;
        tokenClientRef.current = window.google.accounts.oauth2.initTokenClient({
          client_id: clientId,
          scope: CALENDAR_SCOPE,
          callback: (response) => {
            if (response.error || !response.access_token) {
              setError(
                response.error_description ??
                  "Google Calendar access was not granted.",
              );
              setStatus("disconnected");
              return;
            }
            const next: StoredToken = {
              accessToken: response.access_token,
              expiresAt: Date.now() + (response.expires_in ?? 3600) * 1000,
            };
            sessionStorage.setItem(CALENDAR_TOKEN_KEY, JSON.stringify(next));
            setError(null);
            setToken(next);
            setStatus("connected");
          },
          error_callback: (err) => {
            // Popup closed or blocked
            setError(
              err.type === "popup_closed"
                ? null
                : (err.message ?? "Google sign-in failed."),
            );
            setStatus("disconnected");
          },
        });

        const stored = loadStoredToken();
        setToken(stored);
        setStatus(stored ? "connected" : "disconnected");
      })
      .catch((err: Error) => {
        if (cancelled) return;
        setError(err.message);
        setStatus("disconnected");
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // Each (token, reload) pair is one fetch; it is in flight until it lands
  const fetchKey = token ? `${token.accessToken}:${reloadCount}` : null;
  const isFetching = fetchKey !== null && loadedKey !== fetchKey;

  useEffect(() => {
    if (!token || !fetchKey) return;
    let cancelled = false;

    const timeMin = new Date();
    timeMin.setHours(0, 0, 0, 0);
    const timeMax = new Date(timeMin);
    timeMax.setDate(timeMax.getDate() + DAYS_AHEAD);

    const params = new URLSearchParams({
      timeMin: timeMin.toISOString(),
      timeMax: timeMax.toISOString(),
      singleEvents: "true",
      orderBy: "startTime",
      maxResults: "100",
    });

    fetch(`${EVENTS_URL}?${params}`, {
      headers: { Authorization: `Bearer ${token.accessToken}` },
    })
      .then(async (res) => {
        if (cancelled) return;
        if (res.status === 401) {
          clearToken();
          setError("Your Google session expired. Connect again.");
          return;
        }
        if (!res.ok) throw new Error(`Google Calendar error (${res.status})`);

        const data = (await res.json()) as { items?: GoogleCalendarApiEvent[] };
        if (cancelled) return;
        setEvents(
          (data.items ?? [])
            .map(toEvent)
            .filter((event): event is CalendarEvent => event !== null),
        );
        setFetchedAt(Date.now());
        setError(null);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Could not load events.");
      })
      .finally(() => {
        if (!cancelled) setLoadedKey(fetchKey);
      });

    return () => {
      cancelled = true;
    };
  }, [token, fetchKey, clearToken]);

  // Drop the token when it expires so the UI asks to reconnect
  useEffect(() => {
    if (!token) return;
    const timer = window.setTimeout(
      clearToken,
      Math.max(token.expiresAt - Date.now(), 0),
    );
    return () => window.clearTimeout(timer);
  }, [token, clearToken]);

  const connect = useCallback(() => {
    if (!tokenClientRef.current) return;
    setError(null);
    setStatus("connecting");
    tokenClientRef.current.requestAccessToken({ prompt: "" });
  }, []);

  const disconnect = useCallback(() => {
    if (token) window.google?.accounts.oauth2.revoke(token.accessToken);
    setError(null);
    clearToken();
  }, [token, clearToken]);

  const refresh = useCallback(() => {
    setReloadCount((count) => count + 1);
  }, []);

  const upcomingEvents = useMemo(
    () =>
      events.filter((event) => event.end.getTime() > fetchedAt).slice(0, 1),
    [events, fetchedAt],
  );

  const value = useMemo(
    () => ({
      status,
      events,
      upcomingEvents,
      isFetching,
      error,
      connect,
      disconnect,
      refresh,
    }),
    [status, events, upcomingEvents, isFetching, error, connect, disconnect, refresh],
  );

  return (
    <CalendarContext.Provider value={value}>
      {children}
    </CalendarContext.Provider>
  );
}

export function useCalendar() {
  const ctx = useContext(CalendarContext);
  if (!ctx) {
    throw new Error("useCalendar must be used within CalendarProvider");
  }
  return ctx;
}

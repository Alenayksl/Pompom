export type CalendarEvent = {
  id: string;
  title: string;
  start: Date;
  end: Date;
  allDay: boolean;
  location: string | null;
  htmlLink: string | null;
};

// Subset of the Google Calendar API v3 Event resource that Pompom reads
export type GoogleCalendarApiEvent = {
  id: string;
  status?: string;
  summary?: string;
  location?: string;
  htmlLink?: string;
  start?: { date?: string; dateTime?: string };
  end?: { date?: string; dateTime?: string };
};

import { http } from "./http";
import type { CalendarEvent } from "../types";

export function getCalendarEvents(): Promise<CalendarEvent[]> {
  return http.get<CalendarEvent[]>("/calendar-events");
}

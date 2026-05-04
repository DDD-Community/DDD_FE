import { parseDate, type CalendarDate } from "@internationalized/date"

export const toCalendarDate = (value: string): CalendarDate | null => {
  if (!value) return null
  const ymd = value.slice(0, 10)
  try {
    return parseDate(ymd)
  } catch {
    return null
  }
}

export const toDateRangeValue = (
  start: string,
  end: string,
): { start: CalendarDate; end: CalendarDate } | null => {
  const s = toCalendarDate(start)
  const e = toCalendarDate(end)
  if (!s || !e) return null
  return { start: s, end: e }
}

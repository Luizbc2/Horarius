export type ZonedDateParts = {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
};

const formatterCache = new Map<string, Intl.DateTimeFormat>();

const getFormatter = (timeZone: string): Intl.DateTimeFormat => {
  const existing = formatterCache.get(timeZone);
  if (existing) return existing;
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    calendar: "gregory",
    numberingSystem: "latn",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  });
  formatterCache.set(timeZone, formatter);
  return formatter;
};

export const normalizeTimeZone = (timeZone: string, fallback = "America/Sao_Paulo"): string => {
  try {
    new Intl.DateTimeFormat("en", { timeZone }).format();
    return timeZone;
  } catch {
    return fallback;
  }
};

export const getZonedDateParts = (date: Date, timeZone: string): ZonedDateParts => {
  const values = Object.fromEntries(
    getFormatter(normalizeTimeZone(timeZone))
      .formatToParts(date)
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, Number(part.value)]),
  );
  return {
    year: values.year,
    month: values.month,
    day: values.day,
    hour: values.hour,
    minute: values.minute,
  };
};

export const getZonedDateKey = (date: Date, timeZone: string): string => {
  const { year, month, day } = getZonedDateParts(date, timeZone);
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
};

export const zonedDateTimeToUtc = (parts: ZonedDateParts, timeZone: string): Date => {
  const targetTimestamp = Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute);
  let candidate = new Date(targetTimestamp);

  for (let attempt = 0; attempt < 3; attempt += 1) {
    const current = getZonedDateParts(candidate, timeZone);
    const currentTimestamp = Date.UTC(current.year, current.month - 1, current.day, current.hour, current.minute);
    const difference = currentTimestamp - targetTimestamp;
    if (difference === 0) break;
    candidate = new Date(candidate.getTime() - difference);
  }

  return candidate;
};

export const getZonedDayRange = (dateValue: string, timeZone: string): { startsAt: Date; endsAt: Date } | null => {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateValue);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const calendarDate = new Date(Date.UTC(year, month - 1, day));
  if (
    calendarDate.getUTCFullYear() !== year ||
    calendarDate.getUTCMonth() !== month - 1 ||
    calendarDate.getUTCDate() !== day
  ) return null;

  const nextDate = new Date(Date.UTC(year, month - 1, day + 1));
  return {
    startsAt: zonedDateTimeToUtc({ year, month, day, hour: 0, minute: 0 }, timeZone),
    endsAt: zonedDateTimeToUtc({
      year: nextDate.getUTCFullYear(),
      month: nextDate.getUTCMonth() + 1,
      day: nextDate.getUTCDate(),
      hour: 0,
      minute: 0,
    }, timeZone),
  };
};

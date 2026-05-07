export type EventScheduleType =
  | "SINGLE_DAY"
  | "DAILY_RANGE"
  | "MONTHLY_DAY"
  | "MONTHLY_ORDINAL_WEEKDAY";

export type EventOrdinal =
  | "EVERY"
  | "EVERY_OTHER"
  | "SECOND_AND_FOURTH"
  | "FIRST_THIRD_AND_FIFTH"
  | "FIRST"
  | "SECOND"
  | "THIRD"
  | "FOURTH"
  | "LAST";

export type EventMonthSelector = "EVERY" | "EVEN" | "ODD";

export type EventWeekday =
  | "MONDAY"
  | "TUESDAY"
  | "WEDNESDAY"
  | "THURSDAY"
  | "FRIDAY"
  | "SATURDAY"
  | "SUNDAY";

export interface RecurringEventLike {
  date?: string | null;
  endDate?: string | null;
  isYearly?: boolean | null;
  year?: number | null;
  isMultiDay?: boolean | null;
  scheduleType?: EventScheduleType | null;
  startsOn?: string | null;
  endsOn?: string | null;
  monthlyOrdinal?: EventOrdinal | null;
  monthlyWeekday?: EventWeekday | null;
  monthlyMonthSelector?: EventMonthSelector | null;
}

export interface EventOccurrence {
  date: string;
  marker?: "Start" | "End";
}

const ORDINAL_LABELS: Record<EventOrdinal, string> = {
  EVERY: "every",
  EVERY_OTHER: "every other",
  SECOND_AND_FOURTH: "second and fourth",
  FIRST_THIRD_AND_FIFTH: "first, third and fifth",
  FIRST: "first",
  SECOND: "second",
  THIRD: "third",
  FOURTH: "fourth",
  LAST: "last",
};

const WEEKDAY_LABELS: Record<EventWeekday, string> = {
  MONDAY: "Monday",
  TUESDAY: "Tuesday",
  WEDNESDAY: "Wednesday",
  THURSDAY: "Thursday",
  FRIDAY: "Friday",
  SATURDAY: "Saturday",
  SUNDAY: "Sunday",
};

const WEEKDAY_TO_JS_DAY: Record<EventWeekday, number> = {
  SUNDAY: 0,
  MONDAY: 1,
  TUESDAY: 2,
  WEDNESDAY: 3,
  THURSDAY: 4,
  FRIDAY: 5,
  SATURDAY: 6,
};

const MONTH_SELECTOR_LABELS: Record<EventMonthSelector, string> = {
  EVERY: "every month",
  EVEN: "even months",
  ODD: "odd months",
};

export const EVENT_SCHEDULE_TYPES: {
  value: EventScheduleType;
  label: string;
}[] = [
  { value: "SINGLE_DAY", label: "Single-Day Event" },
  { value: "DAILY_RANGE", label: "Every day between start and end" },
  { value: "MONTHLY_DAY", label: "On selected day(s) of each month" },
  {
    value: "MONTHLY_ORDINAL_WEEKDAY",
    label: "On selected weekday of selected months",
  },
];

export const EVENT_ORDINAL_OPTIONS: { value: EventOrdinal; label: string }[] =
  Object.entries(ORDINAL_LABELS).map(([value, label]) => ({
    value: value as EventOrdinal,
    label,
  }));

export const EVENT_WEEKDAY_OPTIONS: { value: EventWeekday; label: string }[] =
  Object.entries(WEEKDAY_LABELS).map(([value, label]) => ({
    value: value as EventWeekday,
    label,
  }));

export const EVENT_MONTH_SELECTOR_OPTIONS: {
  value: EventMonthSelector;
  label: string;
}[] = Object.entries(MONTH_SELECTOR_LABELS).map(([value, label]) => ({
  value: value as EventMonthSelector,
  label,
}));

export const isDateOnly = (value?: string | null) =>
  !!value && /^\d{4}-\d{2}-\d{2}$/.test(value);

export const toDateOnly = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const getMonthDay = (dateOnly?: string | null) => {
  if (!dateOnly) return "";
  if (isDateOnly(dateOnly)) return dateOnly.slice(5);
  return dateOnly;
};

export const parseDateOnly = (dateOnly: string) => {
  const [year, month, day] = dateOnly.split("-").map(Number);
  return new Date(year, month - 1, day);
};

export const resolveLegacyDate = (
  monthDay: string | null | undefined,
  eventYear: number | null | undefined,
  targetYear: number
) => {
  if (!monthDay) return null;
  if (isDateOnly(monthDay)) return monthDay;
  return `${eventYear ?? targetYear}-${monthDay}`;
};

export const getEffectiveScheduleType = (
  event: RecurringEventLike
): EventScheduleType =>
  event.scheduleType ?? (event.isMultiDay ? "DAILY_RANGE" : "SINGLE_DAY");

export const expandEventOccurrences = (
  event: RecurringEventLike,
  targetYear: number
): EventOccurrence[] => {
  const scheduleType = getEffectiveScheduleType(event);

  if (scheduleType === "SINGLE_DAY") {
    const startsOn =
      event.startsOn ?? resolveLegacyDate(event.date, event.year, targetYear);
    if (!startsOn) return [];

    const occurrenceDate = event.isYearly
      ? `${targetYear}-${getMonthDay(startsOn)}`
      : startsOn;
    return occurrenceDate.startsWith(`${targetYear}-`)
      ? [{ date: occurrenceDate }]
      : [];
  }

  if (scheduleType === "DAILY_RANGE") {
    const startsOn =
      event.startsOn ?? resolveLegacyDate(event.date, event.year, targetYear);
    const endsOn =
      event.endsOn ??
      resolveLegacyDate(event.endDate, event.year, targetYear) ??
      startsOn;

    if (!startsOn || !endsOn) return [];

    const rangeStart = event.isYearly
      ? `${targetYear}-${getMonthDay(startsOn)}`
      : startsOn;
    const rangeEnd = event.isYearly
      ? `${targetYear}-${getMonthDay(endsOn)}`
      : endsOn;

    return expandDateRange(rangeStart, rangeEnd).filter((occurrence) =>
      occurrence.date.startsWith(`${targetYear}-`)
    );
  }

  const startsOn = event.startsOn ?? `${targetYear}-01-01`;
  const endsOn = event.endsOn ?? `${targetYear}-12-31`;

  if (scheduleType === "MONTHLY_DAY") {
    return expandMonthlyDayOccurrences({
      startsOn,
      endsOn,
      ordinal: event.monthlyOrdinal ?? "FIRST",
      targetYear,
    });
  }

  if (!event.monthlyWeekday) return [];

  return expandMonthlyWeekdayOccurrences({
    startsOn,
    endsOn,
    ordinal: event.monthlyOrdinal ?? "FIRST",
    weekday: event.monthlyWeekday,
    monthSelector: event.monthlyMonthSelector ?? "EVERY",
    targetYear,
  });
};

export const formatEventSchedule = (
  event: RecurringEventLike,
  targetYear?: number
) => {
  const scheduleType = getEffectiveScheduleType(event);
  const year = targetYear ?? event.year ?? new Date().getFullYear();

  if (scheduleType === "SINGLE_DAY") {
    const occurrence = expandEventOccurrences(event, year)[0];
    return occurrence ? formatDisplayDate(occurrence.date, !event.isYearly) : "";
  }

  if (scheduleType === "DAILY_RANGE") {
    const occurrences = expandEventOccurrences(event, year);
    if (!occurrences.length) return "";
    return `${formatDisplayDate(occurrences[0].date, !event.isYearly)} - ${formatDisplayDate(
      occurrences[occurrences.length - 1].date,
      !event.isYearly
    )}`;
  }

  if (scheduleType === "MONTHLY_DAY") {
    const ordinal = event.monthlyOrdinal ?? "FIRST";
    return `${capitalize(ORDINAL_LABELS[ordinal])} day(s) of each month`;
  }

  const ordinal = event.monthlyOrdinal ?? "FIRST";
  const weekday = event.monthlyWeekday
    ? WEEKDAY_LABELS[event.monthlyWeekday]
    : "weekday";
  const monthSelector =
    MONTH_SELECTOR_LABELS[event.monthlyMonthSelector ?? "EVERY"];
  return `Every ${ORDINAL_LABELS[ordinal]} ${weekday} of ${monthSelector}`;
};

const capitalize = (value: string) =>
  value.charAt(0).toUpperCase() + value.slice(1);

export const formatDisplayDate = (dateOnly: string, includeYear = true) => {
  const [year, month, day] = dateOnly.split("-");
  return includeYear ? `${month}/${day}/${year}` : `${month}/${day}`;
};

const expandDateRange = (startsOn: string, endsOn: string): EventOccurrence[] => {
  const start = parseDateOnly(startsOn);
  const end = parseDateOnly(endsOn);
  if (start > end) return [];

  const occurrences: EventOccurrence[] = [];
  for (
    const current = new Date(start);
    current <= end;
    current.setDate(current.getDate() + 1)
  ) {
    const date = toDateOnly(current);
    occurrences.push({
      date,
      marker:
        date === startsOn ? "Start" : date === endsOn ? "End" : undefined,
    });
  }
  return occurrences;
};

const expandMonthlyDayOccurrences = ({
  startsOn,
  endsOn,
  ordinal,
  targetYear,
}: {
  startsOn: string;
  endsOn: string;
  ordinal: EventOrdinal;
  targetYear: number;
}) => {
  const start = parseDateOnly(startsOn);
  const end = parseDateOnly(endsOn);
  const occurrences: EventOccurrence[] = [];

  for (let month = 1; month <= 12; month++) {
    const daysInMonth = new Date(targetYear, month, 0).getDate();
    for (const day of getOrdinalMonthDays(ordinal, daysInMonth)) {
      const date = `${targetYear}-${String(month).padStart(2, "0")}-${String(
        day
      ).padStart(2, "0")}`;
      const parsed = parseDateOnly(date);
      if (parsed >= start && parsed <= end) occurrences.push({ date });
    }
  }

  return occurrences;
};

const expandMonthlyWeekdayOccurrences = ({
  startsOn,
  endsOn,
  ordinal,
  weekday,
  monthSelector,
  targetYear,
}: {
  startsOn: string;
  endsOn: string;
  ordinal: EventOrdinal;
  weekday: EventWeekday;
  monthSelector: EventMonthSelector;
  targetYear: number;
}) => {
  const start = parseDateOnly(startsOn);
  const end = parseDateOnly(endsOn);
  const occurrences: EventOccurrence[] = [];

  for (let month = 1; month <= 12; month++) {
    if (!matchesMonthSelector(month, monthSelector)) continue;
    const matchingDays = getWeekdayMonthDays(targetYear, month, weekday);

    for (const day of selectOrdinalDays(matchingDays, ordinal)) {
      const date = `${targetYear}-${String(month).padStart(2, "0")}-${String(
        day
      ).padStart(2, "0")}`;
      const parsed = parseDateOnly(date);
      if (parsed >= start && parsed <= end) occurrences.push({ date });
    }
  }

  return occurrences;
};

const matchesMonthSelector = (
  month: number,
  selector: EventMonthSelector
) => {
  if (selector === "EVEN") return month % 2 === 0;
  if (selector === "ODD") return month % 2 === 1;
  return true;
};

const getOrdinalMonthDays = (ordinal: EventOrdinal, daysInMonth: number) => {
  if (ordinal === "EVERY") {
    return Array.from({ length: daysInMonth }, (_, index) => index + 1);
  }
  if (ordinal === "EVERY_OTHER") {
    return Array.from({ length: daysInMonth }, (_, index) => index + 1).filter(
      (day) => day % 2 === 1
    );
  }
  if (ordinal === "SECOND_AND_FOURTH") return [2, 4];
  if (ordinal === "FIRST_THIRD_AND_FIFTH") return [1, 3, 5];
  if (ordinal === "LAST") return [daysInMonth];

  const ordinalDayMap: Record<Exclude<EventOrdinal, "EVERY" | "EVERY_OTHER" | "SECOND_AND_FOURTH" | "FIRST_THIRD_AND_FIFTH" | "LAST">, number> = {
    FIRST: 1,
    SECOND: 2,
    THIRD: 3,
    FOURTH: 4,
  };
  return [ordinalDayMap[ordinal]];
};

const getWeekdayMonthDays = (
  year: number,
  month: number,
  weekday: EventWeekday
) => {
  const jsDay = WEEKDAY_TO_JS_DAY[weekday];
  const daysInMonth = new Date(year, month, 0).getDate();
  const days: number[] = [];

  for (let day = 1; day <= daysInMonth; day++) {
    if (new Date(year, month - 1, day).getDay() === jsDay) {
      days.push(day);
    }
  }

  return days;
};

const selectOrdinalDays = (days: number[], ordinal: EventOrdinal) => {
  if (ordinal === "EVERY") return days;
  if (ordinal === "EVERY_OTHER") {
    return days.filter((_, index) => index % 2 === 0);
  }
  if (ordinal === "SECOND_AND_FOURTH") {
    return [days[1], days[3]].filter((day): day is number => Boolean(day));
  }
  if (ordinal === "FIRST_THIRD_AND_FIFTH") {
    return [days[0], days[2], days[4]].filter((day): day is number =>
      Boolean(day)
    );
  }
  if (ordinal === "LAST") return days.length ? [days[days.length - 1]] : [];

  const ordinalIndexMap: Record<Exclude<EventOrdinal, "EVERY" | "EVERY_OTHER" | "SECOND_AND_FOURTH" | "FIRST_THIRD_AND_FIFTH" | "LAST">, number> = {
    FIRST: 0,
    SECOND: 1,
    THIRD: 2,
    FOURTH: 3,
  };
  const day = days[ordinalIndexMap[ordinal]];
  return day ? [day] : [];
};

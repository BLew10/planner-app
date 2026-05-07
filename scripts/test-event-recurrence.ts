import assert from "node:assert/strict";
import {
  expandEventOccurrences,
  formatEventSchedule,
  RecurringEventLike,
} from "../src/lib/events/recurrence";

type TestCase = {
  name: string;
  event: RecurringEventLike;
  year?: number;
  expected: string[];
};

const dates = (event: RecurringEventLike, year = 2026) =>
  expandEventOccurrences(event, year).map((occurrence) => occurrence.date);

const runOccurrenceCases = (cases: TestCase[]) => {
  for (const testCase of cases) {
    assert.deepEqual(
      dates(testCase.event, testCase.year),
      testCase.expected,
      testCase.name
    );
  }
};

runOccurrenceCases([
  {
    name: "single-day one-time event only appears in its stored year",
    event: {
      scheduleType: "SINGLE_DAY",
      startsOn: "2026-07-04",
      isYearly: false,
    },
    expected: ["2026-07-04"],
  },
  {
    name: "single-day yearly event uses target year with stored month/day",
    event: {
      scheduleType: "SINGLE_DAY",
      startsOn: "2026-07-04",
      isYearly: true,
    },
    year: 2027,
    expected: ["2027-07-04"],
  },
  {
    name: "daily range includes every date between start and end",
    event: {
      scheduleType: "DAILY_RANGE",
      startsOn: "2026-05-10",
      endsOn: "2026-05-12",
    },
    expected: ["2026-05-10", "2026-05-11", "2026-05-12"],
  },
  {
    name: "daily range can cross month boundaries",
    event: {
      scheduleType: "DAILY_RANGE",
      startsOn: "2026-01-30",
      endsOn: "2026-02-02",
    },
    expected: ["2026-01-30", "2026-01-31", "2026-02-01", "2026-02-02"],
  },
  {
    name: "daily range filters to the selected export year",
    event: {
      scheduleType: "DAILY_RANGE",
      startsOn: "2025-12-30",
      endsOn: "2026-01-02",
    },
    expected: ["2026-01-01", "2026-01-02"],
  },
  {
    name: "monthly day every means every day-of-month in range",
    event: {
      scheduleType: "MONTHLY_DAY",
      startsOn: "2026-02-01",
      endsOn: "2026-02-05",
      monthlyOrdinal: "EVERY",
    },
    expected: [
      "2026-02-01",
      "2026-02-02",
      "2026-02-03",
      "2026-02-04",
      "2026-02-05",
    ],
  },
  {
    name: "monthly day every other means odd day-of-month positions",
    event: {
      scheduleType: "MONTHLY_DAY",
      startsOn: "2026-02-01",
      endsOn: "2026-02-07",
      monthlyOrdinal: "EVERY_OTHER",
    },
    expected: ["2026-02-01", "2026-02-03", "2026-02-05", "2026-02-07"],
  },
  {
    name: "monthly day second and fourth means 2nd and 4th day of month",
    event: {
      scheduleType: "MONTHLY_DAY",
      startsOn: "2026-04-01",
      endsOn: "2026-04-30",
      monthlyOrdinal: "SECOND_AND_FOURTH",
    },
    expected: ["2026-04-02", "2026-04-04"],
  },
  {
    name: "monthly day first third and fifth means 1st, 3rd, and 5th day",
    event: {
      scheduleType: "MONTHLY_DAY",
      startsOn: "2026-04-01",
      endsOn: "2026-04-30",
      monthlyOrdinal: "FIRST_THIRD_AND_FIFTH",
    },
    expected: ["2026-04-01", "2026-04-03", "2026-04-05"],
  },
  {
    name: "monthly day last honors leap year February",
    event: {
      scheduleType: "MONTHLY_DAY",
      startsOn: "2024-02-01",
      endsOn: "2024-02-29",
      monthlyOrdinal: "LAST",
    },
    year: 2024,
    expected: ["2024-02-29"],
  },
  {
    name: "monthly weekday first Monday of every month",
    event: {
      scheduleType: "MONTHLY_ORDINAL_WEEKDAY",
      startsOn: "2026-01-01",
      endsOn: "2026-03-31",
      monthlyOrdinal: "FIRST",
      monthlyWeekday: "MONDAY",
      monthlyMonthSelector: "EVERY",
    },
    expected: ["2026-01-05", "2026-02-02", "2026-03-02"],
  },
  {
    name: "monthly weekday last Friday of every month",
    event: {
      scheduleType: "MONTHLY_ORDINAL_WEEKDAY",
      startsOn: "2026-01-01",
      endsOn: "2026-03-31",
      monthlyOrdinal: "LAST",
      monthlyWeekday: "FRIDAY",
      monthlyMonthSelector: "EVERY",
    },
    expected: ["2026-01-30", "2026-02-27", "2026-03-27"],
  },
  {
    name: "monthly weekday second and fourth Tuesday",
    event: {
      scheduleType: "MONTHLY_ORDINAL_WEEKDAY",
      startsOn: "2026-01-01",
      endsOn: "2026-01-31",
      monthlyOrdinal: "SECOND_AND_FOURTH",
      monthlyWeekday: "TUESDAY",
      monthlyMonthSelector: "EVERY",
    },
    expected: ["2026-01-13", "2026-01-27"],
  },
  {
    name: "monthly weekday first third and fifth Thursday",
    event: {
      scheduleType: "MONTHLY_ORDINAL_WEEKDAY",
      startsOn: "2026-01-01",
      endsOn: "2026-01-31",
      monthlyOrdinal: "FIRST_THIRD_AND_FIFTH",
      monthlyWeekday: "THURSDAY",
      monthlyMonthSelector: "EVERY",
    },
    expected: ["2026-01-01", "2026-01-15", "2026-01-29"],
  },
  {
    name: "monthly weekday only includes even months",
    event: {
      scheduleType: "MONTHLY_ORDINAL_WEEKDAY",
      startsOn: "2026-01-01",
      endsOn: "2026-06-30",
      monthlyOrdinal: "FIRST",
      monthlyWeekday: "SUNDAY",
      monthlyMonthSelector: "EVEN",
    },
    expected: ["2026-02-01", "2026-04-05", "2026-06-07"],
  },
  {
    name: "monthly weekday only includes odd months",
    event: {
      scheduleType: "MONTHLY_ORDINAL_WEEKDAY",
      startsOn: "2026-01-01",
      endsOn: "2026-05-31",
      monthlyOrdinal: "FIRST",
      monthlyWeekday: "SATURDAY",
      monthlyMonthSelector: "ODD",
    },
    expected: ["2026-01-03", "2026-03-07", "2026-05-02"],
  },
]);

assert.equal(
  formatEventSchedule({
    scheduleType: "SINGLE_DAY",
    startsOn: "2026-07-04",
    isYearly: false,
  }),
  "07/04/2026",
  "formats single-day schedules"
);

assert.equal(
  formatEventSchedule({
    scheduleType: "DAILY_RANGE",
    startsOn: "2026-05-10",
    endsOn: "2026-05-12",
  }),
  "05/10/2026 - 05/12/2026",
  "formats daily ranges"
);

assert.equal(
  formatEventSchedule({
    scheduleType: "MONTHLY_DAY",
    monthlyOrdinal: "SECOND_AND_FOURTH",
  }),
  "Second and fourth day(s) of each month",
  "formats monthly day schedules"
);

assert.equal(
  formatEventSchedule({
    scheduleType: "MONTHLY_ORDINAL_WEEKDAY",
    monthlyOrdinal: "FIRST",
    monthlyWeekday: "FRIDAY",
    monthlyMonthSelector: "ODD",
  }),
  "Every first Friday of odd months",
  "formats monthly weekday schedules"
);

console.log("Event recurrence unit tests passed");

-- CreateEnum
CREATE TYPE "EventScheduleType" AS ENUM ('SINGLE_DAY', 'DAILY_RANGE', 'MONTHLY_DAY', 'MONTHLY_ORDINAL_WEEKDAY');

-- CreateEnum
CREATE TYPE "EventOrdinal" AS ENUM ('EVERY', 'EVERY_OTHER', 'SECOND_AND_FOURTH', 'FIRST_THIRD_AND_FIFTH', 'FIRST', 'SECOND', 'THIRD', 'FOURTH', 'LAST');

-- CreateEnum
CREATE TYPE "EventMonthSelector" AS ENUM ('EVERY', 'EVEN', 'ODD');

-- CreateEnum
CREATE TYPE "EventWeekday" AS ENUM ('MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY');

-- AlterTable
ALTER TABLE "Event"
ADD COLUMN "scheduleType" "EventScheduleType",
ADD COLUMN "startsOn" TEXT,
ADD COLUMN "endsOn" TEXT,
ADD COLUMN "monthlyOrdinal" "EventOrdinal",
ADD COLUMN "monthlyWeekday" "EventWeekday",
ADD COLUMN "monthlyMonthSelector" "EventMonthSelector";

-- Backfill legacy event rows into the new schedule fields.
UPDATE "Event"
SET
  "scheduleType" = CASE
    WHEN "isMultiDay" = true THEN 'DAILY_RANGE'::"EventScheduleType"
    ELSE 'SINGLE_DAY'::"EventScheduleType"
  END,
  "startsOn" = CASE
    WHEN "year" IS NOT NULL THEN "year"::text || '-' || "date"
    ELSE NULL
  END,
  "endsOn" = CASE
    WHEN "isMultiDay" = true AND "endDate" IS NOT NULL AND "year" IS NOT NULL THEN "year"::text || '-' || "endDate"
    ELSE NULL
  END;

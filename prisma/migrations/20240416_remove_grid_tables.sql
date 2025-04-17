-- First, ensure data has been migrated to CalendarLayout
INSERT INTO "CalendarLayout" (id, "layoutId", "calendarId", "calendarYear", "isDeleted", "userId")
SELECT id, "layoutId", "calendarId", "calendarYear", "isDeleted", "userId"
FROM "GridConfiguration"
ON CONFLICT DO NOTHING;

-- Then, ensure data has been migrated to AdPlacement
INSERT INTO "AdPlacement" (id, "layoutId", "advertisementId", position, x, y, width, height)
SELECT 
    id, 
    "layoutId", 
    "advertisementId",
    SPLIT_PART(cells[1], '-', 1) as position,
    CAST(SPLIT_PART(cells[1], '-', 2) AS FLOAT) as x,
    CAST(SPLIT_PART(cells[1], '-', 3) AS FLOAT) as y,
    CAST(SPLIT_PART(cells[1], '-', 4) AS FLOAT) as width,
    CAST(SPLIT_PART(cells[1], '-', 5) AS FLOAT) as height
FROM "GridAssignment"
WHERE array_length(cells, 1) > 0
ON CONFLICT DO NOTHING;

-- Drop foreign key constraints first
ALTER TABLE IF EXISTS "GridConfiguration" DROP CONSTRAINT IF EXISTS "GridConfiguration_userId_fkey";
ALTER TABLE IF EXISTS "GridConfiguration" DROP CONSTRAINT IF EXISTS "GridConfiguration_calendarId_fkey";
ALTER TABLE IF EXISTS "GridConfiguration" DROP CONSTRAINT IF EXISTS "GridConfiguration_layoutId_fkey";

ALTER TABLE IF EXISTS "GridAssignment" DROP CONSTRAINT IF EXISTS "GridAssignment_layoutId_fkey";
ALTER TABLE IF EXISTS "GridAssignment" DROP CONSTRAINT IF EXISTS "GridAssignment_advertisementId_fkey";

-- Finally, drop the tables
DROP TABLE IF EXISTS "GridAssignment";
DROP TABLE IF EXISTS "GridConfiguration"; 
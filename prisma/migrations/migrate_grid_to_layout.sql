-- Move data from GridConfiguration to CalendarLayout
INSERT INTO "CalendarLayout" (id, "layoutId", "calendarId", "calendarYear", "isDeleted", "userId")
SELECT id, "layoutId", "calendarId", "calendarYear", "isDeleted", "userId"
FROM "GridConfiguration"
ON CONFLICT DO NOTHING;

-- Move data from GridAssignment to AdPlacement
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

-- Drop old tables
DROP TABLE IF EXISTS "GridAssignment";
DROP TABLE IF EXISTS "GridConfiguration"; 
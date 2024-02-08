/*
  Warnings:

  - Added the required column `name` to the `CalendarEdition` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "CalendarEdition" ADD COLUMN     "name" TEXT NOT NULL;

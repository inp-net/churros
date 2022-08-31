/*
  Warnings:

  - Made the column `firstName` on table `UserCandidate` required. This step will fail if there are existing NULL values in that column.
  - Made the column `lastName` on table `UserCandidate` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "UserCandidate" ALTER COLUMN "firstName" SET NOT NULL,
ALTER COLUMN "firstName" SET DEFAULT '',
ALTER COLUMN "lastName" SET NOT NULL,
ALTER COLUMN "lastName" SET DEFAULT '';

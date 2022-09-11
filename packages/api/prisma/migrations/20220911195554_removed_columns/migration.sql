/*
  Warnings:

  - You are about to drop the column `biography` on the `UserCandidate` table. All the data in the column will be lost.
  - You are about to drop the column `nickname` on the `UserCandidate` table. All the data in the column will be lost.
  - You are about to drop the column `pictureFile` on the `UserCandidate` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "UserCandidate" DROP COLUMN "biography",
DROP COLUMN "nickname",
DROP COLUMN "pictureFile";

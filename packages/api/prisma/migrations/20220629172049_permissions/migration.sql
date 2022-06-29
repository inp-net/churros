/*
  Warnings:

  - Made the column `title` on table `ClubMember` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "ClubMember" ALTER COLUMN "title" SET NOT NULL,
ALTER COLUMN "title" SET DEFAULT '';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "admin" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "canEditClubs" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "canEditUsers" BOOLEAN NOT NULL DEFAULT false;

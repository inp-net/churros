/*
  Warnings:

  - You are about to drop the column `canAddMembers` on the `ClubMember` table. All the data in the column will be lost.
  - You are about to drop the column `canPostArticles` on the `ClubMember` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ClubMember" DROP COLUMN "canAddMembers",
DROP COLUMN "canPostArticles",
ADD COLUMN     "canEditArticles" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "canEditMembers" BOOLEAN NOT NULL DEFAULT false;

/*
  Warnings:

  - You are about to drop the column `notifiedAt` on the `Article` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Article" DROP COLUMN "notifiedAt";

-- AlterTable
ALTER TABLE "EventManagerInvite" ALTER COLUMN "id" SET DEFAULT nanoid('eminvite:');

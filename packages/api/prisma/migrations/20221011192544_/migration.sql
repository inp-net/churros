/*
  Warnings:

  - You are about to drop the column `biography` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Group" ADD COLUMN     "address" VARCHAR(255) NOT NULL DEFAULT '',
ADD COLUMN     "description" VARCHAR(255) NOT NULL DEFAULT '',
ADD COLUMN     "email" VARCHAR(255) NOT NULL DEFAULT '',
ADD COLUMN     "longDescription" TEXT NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE "User" DROP COLUMN "biography",
ADD COLUMN     "description" VARCHAR(255) NOT NULL DEFAULT '';

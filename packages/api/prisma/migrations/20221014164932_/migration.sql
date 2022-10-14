/*
  Warnings:

  - You are about to drop the column `slug` on the `Group` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[uid]` on the table `Group` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `uid` to the `Group` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Group_slug_key";

-- AlterTable
ALTER TABLE "Group" RENAME COLUMN "slug"
TO "uid";

-- CreateIndex
CREATE UNIQUE INDEX "Group_uid_key" ON "Group"("uid");

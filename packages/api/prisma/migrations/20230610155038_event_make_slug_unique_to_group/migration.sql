/*
  Warnings:

  - A unique constraint covering the columns `[groupId,slug]` on the table `Event` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Event_groupId_slug_key" ON "Event"("groupId", "slug");

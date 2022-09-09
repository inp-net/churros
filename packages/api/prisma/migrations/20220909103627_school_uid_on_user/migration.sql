/*
  Warnings:

  - A unique constraint covering the columns `[schoolEmail]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[schoolServer,schoolUid]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "schoolEmail" VARCHAR(255),
ADD COLUMN     "schoolServer" VARCHAR(255),
ADD COLUMN     "schoolUid" VARCHAR(255);

-- CreateIndex
CREATE UNIQUE INDEX "User_schoolEmail_key" ON "User"("schoolEmail");

-- CreateIndex
CREATE UNIQUE INDEX "User_schoolServer_schoolUid_key" ON "User"("schoolServer", "schoolUid");

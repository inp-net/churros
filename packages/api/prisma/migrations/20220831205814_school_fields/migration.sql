/*
  Warnings:

  - You are about to drop the column `schoolLdapUid` on the `UserCandidate` table. All the data in the column will be lost.
  - You are about to drop the column `schoolUserUid` on the `UserCandidate` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[schoolEmail]` on the table `UserCandidate` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[schoolServer,schoolUid]` on the table `UserCandidate` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "UserCandidate_schoolLdapUid_schoolUserUid_key";

-- AlterTable
ALTER TABLE "UserCandidate" DROP COLUMN "schoolLdapUid",
DROP COLUMN "schoolUserUid",
ADD COLUMN     "schoolEmail" VARCHAR(255),
ADD COLUMN     "schoolServer" VARCHAR(255),
ADD COLUMN     "schoolUid" VARCHAR(255);

-- CreateIndex
CREATE UNIQUE INDEX "UserCandidate_schoolEmail_key" ON "UserCandidate"("schoolEmail");

-- CreateIndex
CREATE UNIQUE INDEX "UserCandidate_schoolServer_schoolUid_key" ON "UserCandidate"("schoolServer", "schoolUid");

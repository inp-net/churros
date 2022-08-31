/*
  Warnings:

  - A unique constraint covering the columns `[schoolLdapUid,schoolUserUid]` on the table `UserCandidate` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "UserCandidate" ADD COLUMN     "schoolLdapUid" VARCHAR(255),
ADD COLUMN     "schoolUserUid" VARCHAR(255);

-- CreateIndex
CREATE UNIQUE INDEX "UserCandidate_schoolLdapUid_schoolUserUid_key" ON "UserCandidate"("schoolLdapUid", "schoolUserUid");

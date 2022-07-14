/*
  Warnings:

  - The primary key for the `ClubMember` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - Added the required column `schoolId` to the `Club` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Club" ADD COLUMN     "schoolId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "ClubMember" DROP CONSTRAINT "ClubMember_pkey",
ADD CONSTRAINT "ClubMember_pkey" PRIMARY KEY ("clubId", "memberId");

-- AddForeignKey
ALTER TABLE "Club" ADD CONSTRAINT "Club_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

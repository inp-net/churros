/*
  Warnings:

  - You are about to drop the `_ClubToUser` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_ClubToUser" DROP CONSTRAINT "_ClubToUser_A_fkey";

-- DropForeignKey
ALTER TABLE "_ClubToUser" DROP CONSTRAINT "_ClubToUser_B_fkey";

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "nickname" SET DEFAULT '';

-- DropTable
DROP TABLE "_ClubToUser";

-- CreateTable
CREATE TABLE "ClubMember" (
    "memberId" INTEGER NOT NULL,
    "clubId" INTEGER NOT NULL,
    "title" VARCHAR(255),
    "president" BOOLEAN NOT NULL DEFAULT false,
    "treasurer" BOOLEAN NOT NULL DEFAULT false,
    "canAddMembers" BOOLEAN NOT NULL DEFAULT false,
    "canPostArticles" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ClubMember_pkey" PRIMARY KEY ("memberId","clubId")
);

-- AddForeignKey
ALTER TABLE "ClubMember" ADD CONSTRAINT "ClubMember_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClubMember" ADD CONSTRAINT "ClubMember_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "Club"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

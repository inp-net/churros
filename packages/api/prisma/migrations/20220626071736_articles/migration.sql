-- DropForeignKey
ALTER TABLE "ClubMember" DROP CONSTRAINT "ClubMember_clubId_fkey";

-- DropForeignKey
ALTER TABLE "ClubMember" DROP CONSTRAINT "ClubMember_memberId_fkey";

-- DropForeignKey
ALTER TABLE "Credential" DROP CONSTRAINT "Credential_userId_fkey";

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "nickname" SET DEFAULT '';

-- CreateTable
CREATE TABLE "Article" (
    "id" SERIAL NOT NULL,
    "authorId" INTEGER,
    "clubId" INTEGER NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "body" TEXT NOT NULL,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "publishedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Article_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Credential" ADD CONSTRAINT "Credential_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClubMember" ADD CONSTRAINT "ClubMember_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClubMember" ADD CONSTRAINT "ClubMember_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "Club"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Article" ADD CONSTRAINT "Article_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Article" ADD CONSTRAINT "Article_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "Club"("id") ON DELETE CASCADE ON UPDATE CASCADE;

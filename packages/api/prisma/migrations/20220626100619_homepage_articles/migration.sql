-- AlterTable
ALTER TABLE "Article" ADD COLUMN     "homepage" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "nickname" SET DEFAULT '';

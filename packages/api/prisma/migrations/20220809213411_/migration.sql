/*
  Warnings:

  - You are about to drop the column `links` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `ContactChannel` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "LinkType" AS ENUM ('Facebook', 'Instagram', 'Telegram', 'Twitter');

-- AlterTable
ALTER TABLE "User" DROP COLUMN "links";

-- DropTable
DROP TABLE "ContactChannel";

-- CreateTable
CREATE TABLE "UserLink" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "type" "LinkType" NOT NULL,
    "value" VARCHAR(255) NOT NULL,

    CONSTRAINT "UserLink_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "UserLink" ADD CONSTRAINT "UserLink_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

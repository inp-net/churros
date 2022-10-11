/*
  Warnings:

  - You are about to drop the `UserLink` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `linkCollectionId` to the `Group` table without a default value. This is not possible if the table is not empty.
  - Added the required column `linkCollectionId` to the `StudentAssociation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `linkCollectionId` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "UserLink" DROP CONSTRAINT "UserLink_userId_fkey";

-- AlterTable
ALTER TABLE "Group" ADD COLUMN     "linkCollectionId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "StudentAssociation" ADD COLUMN     "linkCollectionId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "linkCollectionId" INTEGER NOT NULL;

-- DropTable
DROP TABLE "UserLink";

-- CreateTable
CREATE TABLE "LinkCollection" (
    "id" SERIAL NOT NULL,

    CONSTRAINT "LinkCollection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Link" (
    "id" SERIAL NOT NULL,
    "collectionId" INTEGER NOT NULL,
    "type" "LinkType" NOT NULL,
    "value" VARCHAR(255) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Link_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_linkCollectionId_fkey" FOREIGN KEY ("linkCollectionId") REFERENCES "LinkCollection"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Link" ADD CONSTRAINT "Link_collectionId_fkey" FOREIGN KEY ("collectionId") REFERENCES "LinkCollection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentAssociation" ADD CONSTRAINT "StudentAssociation_linkCollectionId_fkey" FOREIGN KEY ("linkCollectionId") REFERENCES "LinkCollection"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Group" ADD CONSTRAINT "Group_linkCollectionId_fkey" FOREIGN KEY ("linkCollectionId") REFERENCES "LinkCollection"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

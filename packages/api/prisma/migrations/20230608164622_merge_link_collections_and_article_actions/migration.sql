/*
  Warnings:

  - You are about to drop the column `type` on the `Link` table. All the data in the column will be lost.
  - You are about to drop the `ArticleAction` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `linkCollectionId` to the `Article` table without a default value. This is not possible if the table is not empty.
  - Added the required column `linkCollectionId` to the `Event` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `Link` table without a default value. This is not possible if the table is not empty.
  - Added the required column `linkCollectionId` to the `Ticket` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "ArticleAction" DROP CONSTRAINT "ArticleAction_articleId_fkey";

-- DropForeignKey
ALTER TABLE "ArticleAction" DROP CONSTRAINT "ArticleAction_eventId_fkey";

-- AlterTable
ALTER TABLE "Article" ADD COLUMN     "linkCollectionId" INTEGER NOT NULL DEFAULT 0;

-- Create an empty link collection for each article, and set the article's linkCollectionId to the new collection's id
WITH new_link_collections AS (
  INSERT INTO "LinkCollection" DEFAULT VALUES RETURNING *
)
UPDATE "Article" SET "linkCollectionId" = new_link_collections.id FROM new_link_collections;

-- Drop the default value
ALTER TABLE "Article" ALTER COLUMN "linkCollectionId" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "linkCollectionId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Link" ADD COLUMN     "name" VARCHAR(255) NOT NULL DEFAULT '';

-- Set name of all Facebook links to "Facebook"
UPDATE "Link" SET "name" = 'Facebook' WHERE "type" = 'Facebook';
-- Same for Twitter, Instagram, and Telegram 
UPDATE "Link" SET "name" = 'Twitter' WHERE "type" = 'Twitter';
UPDATE "Link" SET "name" = 'Instagram' WHERE "type" = 'Instagram';
UPDATE "Link" SET "name" = 'Telegram' WHERE "type" = 'Telegram';

-- Drop default on Link name
ALTER TABLE "Link" ALTER COLUMN "name" DROP DEFAULT;

ALTER TABLE "Link" DROP COLUMN "type";

-- AlterTable
ALTER TABLE "Ticket" ADD COLUMN     "linkCollectionId" INTEGER NOT NULL;

-- DropTable
DROP TABLE "ArticleAction";

-- DropEnum
DROP TYPE "LinkType";

-- AddForeignKey
ALTER TABLE "Article" ADD CONSTRAINT "Article_linkCollectionId_fkey" FOREIGN KEY ("linkCollectionId") REFERENCES "LinkCollection"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_linkCollectionId_fkey" FOREIGN KEY ("linkCollectionId") REFERENCES "LinkCollection"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_linkCollectionId_fkey" FOREIGN KEY ("linkCollectionId") REFERENCES "LinkCollection"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

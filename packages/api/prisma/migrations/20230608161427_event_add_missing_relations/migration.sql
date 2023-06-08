-- DropForeignKey
ALTER TABLE "ArticleAction" DROP CONSTRAINT "ArticleAction_articleId_fkey";

-- AlterTable
ALTER TABLE "ArticleAction" ADD COLUMN     "eventId" INTEGER,
ALTER COLUMN "articleId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "ArticleAction" ADD CONSTRAINT "ArticleAction_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "Article"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArticleAction" ADD CONSTRAINT "ArticleAction_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

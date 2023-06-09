/*
  Warnings:

  - You are about to drop the column `userId` on the `Ticket` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Event" DROP CONSTRAINT "Event_linkCollectionId_fkey";

-- DropForeignKey
ALTER TABLE "Ticket" DROP CONSTRAINT "Ticket_userId_fkey";

-- DropForeignKey
ALTER TABLE "TicketGroup" DROP CONSTRAINT "TicketGroup_authorId_fkey";

-- AlterTable
ALTER TABLE "Ticket" DROP COLUMN "userId",
ALTER COLUMN "authorId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "TicketGroup" ALTER COLUMN "authorId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_linkCollectionId_fkey" FOREIGN KEY ("linkCollectionId") REFERENCES "LinkCollection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TicketGroup" ADD CONSTRAINT "TicketGroup_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

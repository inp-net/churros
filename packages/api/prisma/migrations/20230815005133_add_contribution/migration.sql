/*
  Warnings:

  - You are about to drop the column `studentAssociationId` on the `LydiaTransaction` table. All the data in the column will be lost.
  - You are about to drop the `_StudentAssociationToUser` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[studentAssociationContributionId]` on the table `LydiaTransaction` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "LydiaTransaction" DROP CONSTRAINT "LydiaTransaction_studentAssociationId_fkey";

-- DropForeignKey
ALTER TABLE "_StudentAssociationToUser" DROP CONSTRAINT "_StudentAssociationToUser_A_fkey";

-- DropForeignKey
ALTER TABLE "_StudentAssociationToUser" DROP CONSTRAINT "_StudentAssociationToUser_B_fkey";

-- AlterTable
ALTER TABLE "Announcement" ALTER COLUMN "id" SET DEFAULT nanoid('ann:');

-- AlterTable
ALTER TABLE "Article" ALTER COLUMN "id" SET DEFAULT nanoid('a:');

-- AlterTable
ALTER TABLE "BarWeek" ALTER COLUMN "id" SET DEFAULT nanoid('barweek:');

-- AlterTable
ALTER TABLE "Credential" ALTER COLUMN "id" SET DEFAULT nanoid('credential:');

-- AlterTable
ALTER TABLE "EmailChange" ALTER COLUMN "id" SET DEFAULT nanoid('emailchange:');

-- AlterTable
ALTER TABLE "Event" ALTER COLUMN "id" SET DEFAULT nanoid('e:');

-- AlterTable
ALTER TABLE "GodparentRequest" ALTER COLUMN "id" SET DEFAULT nanoid('godparentreq:');

-- AlterTable
ALTER TABLE "Group" ALTER COLUMN "id" SET DEFAULT nanoid('g:');

-- AlterTable
ALTER TABLE "Link" ALTER COLUMN "id" SET DEFAULT nanoid('link:');

-- AlterTable
ALTER TABLE "LogEntry" ALTER COLUMN "id" SET DEFAULT nanoid('log:');

-- AlterTable
ALTER TABLE "LydiaAccount" ALTER COLUMN "id" SET DEFAULT nanoid('lydia:');

-- AlterTable
ALTER TABLE "LydiaTransaction" DROP COLUMN "studentAssociationId",
ADD COLUMN     "studentAssociationContributionId" TEXT,
ALTER COLUMN "id" SET DEFAULT nanoid('lydiapayment:');

-- AlterTable
ALTER TABLE "Major" ALTER COLUMN "id" SET DEFAULT nanoid('major:');

-- AlterTable
ALTER TABLE "Notification" ALTER COLUMN "id" SET DEFAULT nanoid('notif:');

-- AlterTable
ALTER TABLE "NotificationSetting" ALTER COLUMN "id" SET DEFAULT nanoid('notifsetting:');

-- AlterTable
ALTER TABLE "NotificationSubscription" ALTER COLUMN "id" SET DEFAULT nanoid('notifsub:');

-- AlterTable
ALTER TABLE "PasswordReset" ALTER COLUMN "id" SET DEFAULT nanoid('passreset:');

-- AlterTable
ALTER TABLE "Registration" ALTER COLUMN "id" SET DEFAULT nanoid('r:');

-- AlterTable
ALTER TABLE "School" ALTER COLUMN "id" SET DEFAULT nanoid('school:');

-- AlterTable
ALTER TABLE "StudentAssociation" ALTER COLUMN "id" SET DEFAULT nanoid('ae:');

-- AlterTable
ALTER TABLE "Ticket" ALTER COLUMN "id" SET DEFAULT nanoid('t:');

-- AlterTable
ALTER TABLE "TicketGroup" ALTER COLUMN "id" SET DEFAULT nanoid('tg:');

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "id" SET DEFAULT nanoid('u:');

-- AlterTable
ALTER TABLE "UserCandidate" ALTER COLUMN "id" SET DEFAULT nanoid('candidate:');

-- DropTable
DROP TABLE "_StudentAssociationToUser";

-- CreateTable
CREATE TABLE "Contribution" (
    "id" TEXT NOT NULL DEFAULT nanoid('contribution:'),
    "studentAssociationId" TEXT NOT NULL,
    "transactionId" TEXT,
    "paid" BOOLEAN NOT NULL DEFAULT false,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Contribution_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "LydiaTransaction_studentAssociationContributionId_key" ON "LydiaTransaction"("studentAssociationContributionId");

-- AddForeignKey
ALTER TABLE "Contribution" ADD CONSTRAINT "Contribution_studentAssociationId_fkey" FOREIGN KEY ("studentAssociationId") REFERENCES "StudentAssociation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contribution" ADD CONSTRAINT "Contribution_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LydiaTransaction" ADD CONSTRAINT "LydiaTransaction_studentAssociationContributionId_fkey" FOREIGN KEY ("studentAssociationContributionId") REFERENCES "Contribution"("id") ON DELETE SET NULL ON UPDATE CASCADE;

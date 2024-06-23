/*
  Warnings:

  - You are about to drop the column `studentAssociationId` on the `Contribution` table. All the data in the column will be lost.
  - You are about to drop the column `contributionPrice` on the `StudentAssociation` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[optionId,userId]` on the table `Contribution` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `optionId` to the `Contribution` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Contribution" DROP CONSTRAINT "Contribution_studentAssociationId_fkey";

-- DropIndex
DROP INDEX "Contribution_userId_studentAssociationId_key";

-- AlterTable
ALTER TABLE "Announcement" ALTER COLUMN "id" SET DEFAULT nanoid('ann:');

-- AlterTable
ALTER TABLE "Article" ALTER COLUMN "id" SET DEFAULT nanoid('a:');

-- AlterTable
ALTER TABLE "BarWeek" ALTER COLUMN "id" SET DEFAULT nanoid('barweek:');

-- AlterTable
ALTER TABLE "Contribution" DROP COLUMN "studentAssociationId",
ADD COLUMN     "optionId" TEXT NOT NULL,
ALTER COLUMN "id" SET DEFAULT nanoid('contribution:');

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
ALTER TABLE "LydiaTransaction" ALTER COLUMN "id" SET DEFAULT nanoid('lydiapayment:');

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
ALTER TABLE "StudentAssociation" DROP COLUMN "contributionPrice",
ALTER COLUMN "id" SET DEFAULT nanoid('ae:');

-- AlterTable
ALTER TABLE "Ticket" ALTER COLUMN "id" SET DEFAULT nanoid('t:');

-- AlterTable
ALTER TABLE "TicketGroup" ALTER COLUMN "id" SET DEFAULT nanoid('tg:');

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "id" SET DEFAULT nanoid('u:');

-- AlterTable
ALTER TABLE "UserCandidate" ALTER COLUMN "id" SET DEFAULT nanoid('candidate:');

-- CreateTable
CREATE TABLE "ContributionOption" (
    "id" TEXT NOT NULL DEFAULT nanoid('contributionoption:'),
    "offeredInId" TEXT NOT NULL,
    "lydiaAccountId" TEXT,
    "name" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "ContributionOption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_ContributionOptionToStudentAssociation" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_ContributionOptionToStudentAssociation_AB_unique" ON "_ContributionOptionToStudentAssociation"("A", "B");

-- CreateIndex
CREATE INDEX "_ContributionOptionToStudentAssociation_B_index" ON "_ContributionOptionToStudentAssociation"("B");

-- CreateIndex
CREATE UNIQUE INDEX "Contribution_optionId_userId_key" ON "Contribution"("optionId", "userId");

-- AddForeignKey
ALTER TABLE "Contribution" ADD CONSTRAINT "Contribution_optionId_fkey" FOREIGN KEY ("optionId") REFERENCES "ContributionOption"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContributionOption" ADD CONSTRAINT "ContributionOption_offeredInId_fkey" FOREIGN KEY ("offeredInId") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContributionOption" ADD CONSTRAINT "ContributionOption_lydiaAccountId_fkey" FOREIGN KEY ("lydiaAccountId") REFERENCES "LydiaAccount"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ContributionOptionToStudentAssociation" ADD CONSTRAINT "_ContributionOptionToStudentAssociation_A_fkey" FOREIGN KEY ("A") REFERENCES "ContributionOption"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ContributionOptionToStudentAssociation" ADD CONSTRAINT "_ContributionOptionToStudentAssociation_B_fkey" FOREIGN KEY ("B") REFERENCES "StudentAssociation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

/*
  Warnings:

  - A unique constraint covering the columns `[name,userId,studentAssociationId,groupId,articleId,eventId,ticketId,notificationId,subjectId]` on the table `Link` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('Exercises', 'Practical', 'CourseNotes', 'CourseSlides', 'Summary', 'PracticalExam', 'GradedExercises', 'Exam', 'Miscellaneous');

-- DropIndex
DROP INDEX "Link_name_userId_studentAssociationId_groupId_articleId_eve_key";

-- AlterTable
ALTER TABLE "Announcement" ALTER COLUMN "id" SET DEFAULT nanoid('ann:');

-- AlterTable
ALTER TABLE "Article" ALTER COLUMN "id" SET DEFAULT nanoid('a:');

-- AlterTable
ALTER TABLE "BarWeek" ALTER COLUMN "id" SET DEFAULT nanoid('barweek:');

-- AlterTable
ALTER TABLE "Contribution" ALTER COLUMN "id" SET DEFAULT nanoid('contribution:');

-- AlterTable
ALTER TABLE "ContributionOption" ALTER COLUMN "id" SET DEFAULT nanoid('contributionoption:');

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
ALTER TABLE "Link" ADD COLUMN     "subjectId" TEXT,
ALTER COLUMN "id" SET DEFAULT nanoid('link:');

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
ALTER TABLE "Service" ALTER COLUMN "id" SET DEFAULT nanoid('service:');

-- AlterTable
ALTER TABLE "StudentAssociation" ALTER COLUMN "id" SET DEFAULT nanoid('ae:');

-- AlterTable
ALTER TABLE "Ticket" ALTER COLUMN "id" SET DEFAULT nanoid('t:');

-- AlterTable
ALTER TABLE "TicketGroup" ALTER COLUMN "id" SET DEFAULT nanoid('tg:');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "canAccessDocuments" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "minorId" TEXT,
ALTER COLUMN "id" SET DEFAULT nanoid('u:');

-- AlterTable
ALTER TABLE "UserCandidate" ALTER COLUMN "id" SET DEFAULT nanoid('candidate:');

-- CreateTable
CREATE TABLE "Minor" (
    "id" TEXT NOT NULL DEFAULT nanoid('minor:'),
    "name" TEXT NOT NULL,
    "uid" TEXT NOT NULL,
    "yearTier" INTEGER NOT NULL,

    CONSTRAINT "Minor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subject" (
    "id" TEXT NOT NULL DEFAULT nanoid('subj:'),
    "name" TEXT NOT NULL,
    "uid" TEXT NOT NULL,
    "nextExamAt" TIMESTAMP(3),

    CONSTRAINT "Subject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Document" (
    "id" TEXT NOT NULL DEFAULT nanoid('doc:'),
    "uid" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "schoolYear" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "type" "DocumentType" NOT NULL,
    "paperPaths" TEXT[],
    "solutionPaths" TEXT[],
    "uploaderId" TEXT,

    CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Comment" (
    "id" TEXT NOT NULL DEFAULT nanoid('comment:'),
    "authorId" TEXT,
    "body" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "documentId" TEXT NOT NULL,
    "inReplyToId" TEXT,

    CONSTRAINT "Comment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_MajorToSubject" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_MajorToMinor" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_MinorToSubject" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Minor_uid_key" ON "Minor"("uid");

-- CreateIndex
CREATE UNIQUE INDEX "Subject_uid_key" ON "Subject"("uid");

-- CreateIndex
CREATE UNIQUE INDEX "Document_subjectId_uid_key" ON "Document"("subjectId", "uid");

-- CreateIndex
CREATE UNIQUE INDEX "_MajorToSubject_AB_unique" ON "_MajorToSubject"("A", "B");

-- CreateIndex
CREATE INDEX "_MajorToSubject_B_index" ON "_MajorToSubject"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_MajorToMinor_AB_unique" ON "_MajorToMinor"("A", "B");

-- CreateIndex
CREATE INDEX "_MajorToMinor_B_index" ON "_MajorToMinor"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_MinorToSubject_AB_unique" ON "_MinorToSubject"("A", "B");

-- CreateIndex
CREATE INDEX "_MinorToSubject_B_index" ON "_MinorToSubject"("B");

-- CreateIndex
CREATE UNIQUE INDEX "Link_name_userId_studentAssociationId_groupId_articleId_eve_key" ON "Link"("name", "userId", "studentAssociationId", "groupId", "articleId", "eventId", "ticketId", "notificationId", "subjectId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_minorId_fkey" FOREIGN KEY ("minorId") REFERENCES "Minor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Link" ADD CONSTRAINT "Link_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_uploaderId_fkey" FOREIGN KEY ("uploaderId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_inReplyToId_fkey" FOREIGN KEY ("inReplyToId") REFERENCES "Comment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_MajorToSubject" ADD CONSTRAINT "_MajorToSubject_A_fkey" FOREIGN KEY ("A") REFERENCES "Major"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_MajorToSubject" ADD CONSTRAINT "_MajorToSubject_B_fkey" FOREIGN KEY ("B") REFERENCES "Subject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_MajorToMinor" ADD CONSTRAINT "_MajorToMinor_A_fkey" FOREIGN KEY ("A") REFERENCES "Major"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_MajorToMinor" ADD CONSTRAINT "_MajorToMinor_B_fkey" FOREIGN KEY ("B") REFERENCES "Minor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_MinorToSubject" ADD CONSTRAINT "_MinorToSubject_A_fkey" FOREIGN KEY ("A") REFERENCES "Minor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_MinorToSubject" ADD CONSTRAINT "_MinorToSubject_B_fkey" FOREIGN KEY ("B") REFERENCES "Subject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

/*
  Warnings:

  - You are about to drop the column `notificationId` on the `Link` table. All the data in the column will be lost.
  - You are about to drop the `Notification` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[name,userId,studentAssociationId,groupId,articleId,eventId,ticketId,scheduledNotificationId,subjectId]` on the table `Link` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterEnum
ALTER TYPE "NotificationChannel" ADD VALUE 'Signups';

-- DropForeignKey
ALTER TABLE "Link" DROP CONSTRAINT "Link_notificationId_fkey";

-- DropForeignKey
ALTER TABLE "Notification" DROP CONSTRAINT "Notification_groupId_fkey";

-- DropForeignKey
ALTER TABLE "Notification" DROP CONSTRAINT "Notification_subscriptionId_fkey";

-- DropForeignKey
ALTER TABLE "Notification" DROP CONSTRAINT "Notification_userId_fkey";

-- DropIndex
DROP INDEX "Link_name_userId_studentAssociationId_groupId_articleId_eve_key";

-- AlterTable
ALTER TABLE "Announcement" ALTER COLUMN "id" SET DEFAULT nanoid('ann:');

-- AlterTable
ALTER TABLE "Answer" ALTER COLUMN "id" SET DEFAULT nanoid('answer:');

-- AlterTable
ALTER TABLE "Article" ALTER COLUMN "id" SET DEFAULT nanoid('a:');

-- AlterTable
ALTER TABLE "BarWeek" ALTER COLUMN "id" SET DEFAULT nanoid('barweek:');

-- AlterTable
ALTER TABLE "Comment" ALTER COLUMN "id" SET DEFAULT nanoid('comment:');

-- AlterTable
ALTER TABLE "Contribution" ALTER COLUMN "id" SET DEFAULT nanoid('contribution:');

-- AlterTable
ALTER TABLE "ContributionOption" ALTER COLUMN "id" SET DEFAULT nanoid('contributionoption:');

-- AlterTable
ALTER TABLE "Credential" ALTER COLUMN "id" SET DEFAULT nanoid('credential:');

-- AlterTable
ALTER TABLE "Document" ALTER COLUMN "id" SET DEFAULT nanoid('doc:');

-- AlterTable
ALTER TABLE "EmailChange" ALTER COLUMN "id" SET DEFAULT nanoid('emailchange:');

-- AlterTable
ALTER TABLE "Event" ALTER COLUMN "id" SET DEFAULT nanoid('e:');

-- AlterTable
ALTER TABLE "Form" ALTER COLUMN "id" SET DEFAULT nanoid('form:');

-- AlterTable
ALTER TABLE "FormJump" ALTER COLUMN "id" SET DEFAULT nanoid('formjump:');

-- AlterTable
ALTER TABLE "FormSection" ALTER COLUMN "id" SET DEFAULT nanoid('formsection:');

-- AlterTable
ALTER TABLE "GodparentRequest" ALTER COLUMN "id" SET DEFAULT nanoid('godparentreq:');

-- AlterTable
ALTER TABLE "Group" ALTER COLUMN "id" SET DEFAULT nanoid('g:');

-- AlterTable
ALTER TABLE "Link" DROP COLUMN "notificationId",
ADD COLUMN     "scheduledNotificationId" TEXT,
ADD COLUMN     "sentNotificationId" TEXT,
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
ALTER TABLE "Minor" ALTER COLUMN "id" SET DEFAULT nanoid('minor:');

-- AlterTable
ALTER TABLE "NotificationSubscription" ALTER COLUMN "id" SET DEFAULT nanoid('notifsub:');

-- AlterTable
ALTER TABLE "PasswordReset" ALTER COLUMN "id" SET DEFAULT nanoid('passreset:');

-- AlterTable
ALTER TABLE "PaypalTransaction" ALTER COLUMN "id" SET DEFAULT nanoid('paypalpayment:');

-- AlterTable
ALTER TABLE "Picture" ALTER COLUMN "id" SET DEFAULT nanoid('picfile:');

-- AlterTable
ALTER TABLE "Promotion" ALTER COLUMN "id" SET DEFAULT nanoid('promo:');

-- AlterTable
ALTER TABLE "PromotionCode" ALTER COLUMN "id" SET DEFAULT nanoid('promocode:');

-- AlterTable
ALTER TABLE "Question" ALTER COLUMN "id" SET DEFAULT nanoid('question:');

-- AlterTable
ALTER TABLE "QuickSignup" ALTER COLUMN "id" SET DEFAULT nanoid('quicksignup:', 6);

-- AlterTable
ALTER TABLE "Reaction" ALTER COLUMN "id" SET DEFAULT nanoid('reac:');

-- AlterTable
ALTER TABLE "Registration" ALTER COLUMN "id" SET DEFAULT nanoid('r:');

-- AlterTable
ALTER TABLE "School" ALTER COLUMN "id" SET DEFAULT nanoid('school:'),
ALTER COLUMN "aliasMailDomains" SET DEFAULT ARRAY[]::VARCHAR(255)[];

-- AlterTable
ALTER TABLE "Service" ALTER COLUMN "id" SET DEFAULT nanoid('service:');

-- AlterTable
ALTER TABLE "ShopItem" ALTER COLUMN "id" SET DEFAULT nanoid('shopitem:');

-- AlterTable
ALTER TABLE "ShopItemAnswer" ALTER COLUMN "id" SET DEFAULT nanoid('shopitemanswer:');

-- AlterTable
ALTER TABLE "ShopItemOption" ALTER COLUMN "id" SET DEFAULT nanoid('shopitemoption:');

-- AlterTable
ALTER TABLE "ShopPayment" ALTER COLUMN "id" SET DEFAULT nanoid('shoppayment:');

-- AlterTable
ALTER TABLE "StudentAssociation" ALTER COLUMN "id" SET DEFAULT nanoid('ae:');

-- AlterTable
ALTER TABLE "Subject" ALTER COLUMN "id" SET DEFAULT nanoid('subj:');

-- AlterTable
ALTER TABLE "TeachingUnit" ALTER COLUMN "id" SET DEFAULT nanoid('ue:');

-- AlterTable
ALTER TABLE "ThirdPartyApp" ALTER COLUMN "id" SET DEFAULT nanoid('app:', 30);

-- AlterTable
ALTER TABLE "ThirdPartyCredential" ALTER COLUMN "id" SET DEFAULT nanoid('token:');

-- AlterTable
ALTER TABLE "Ticket" ALTER COLUMN "id" SET DEFAULT nanoid('t:');

-- AlterTable
ALTER TABLE "TicketGroup" ALTER COLUMN "id" SET DEFAULT nanoid('tg:');

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "id" SET DEFAULT nanoid('u:');

-- AlterTable
ALTER TABLE "UserCandidate" ALTER COLUMN "id" SET DEFAULT nanoid('candidate:');

-- DropTable
DROP TABLE "Notification";

-- CreateTable
CREATE TABLE "SentNotification" (
    "id" TEXT NOT NULL DEFAULT nanoid('notif:'),
    "sentAt" TIMESTAMP(3) NOT NULL,
    "subscriptionId" TEXT NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "body" TEXT NOT NULL,
    "goto" TEXT NOT NULL DEFAULT '',
    "pictureFile" TEXT NOT NULL DEFAULT '',
    "channel" "NotificationChannel" NOT NULL DEFAULT 'Other',

    CONSTRAINT "SentNotification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScheduledNotification" (
    "id" TEXT NOT NULL DEFAULT nanoid('schednotif:'),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "scheduledTo" TIMESTAMP(3) NOT NULL,
    "groupMembersOnly" BOOLEAN NOT NULL DEFAULT false,
    "studentAssociationStudentsOnly" BOOLEAN NOT NULL DEFAULT false,
    "title" VARCHAR(255) NOT NULL,
    "body" TEXT NOT NULL,
    "goto" TEXT NOT NULL DEFAULT '',
    "pictureFile" TEXT NOT NULL DEFAULT '',
    "channel" "NotificationChannel" NOT NULL DEFAULT 'Other',
    "groupId" TEXT,
    "vibrate" INTEGER[] DEFAULT ARRAY[]::INTEGER[],
    "eventId" TEXT,
    "articleId" TEXT,

    CONSTRAINT "ScheduledNotification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Link_name_userId_studentAssociationId_groupId_articleId_eve_key" ON "Link"("name", "userId", "studentAssociationId", "groupId", "articleId", "eventId", "ticketId", "scheduledNotificationId", "subjectId");

-- AddForeignKey
ALTER TABLE "Link" ADD CONSTRAINT "Link_scheduledNotificationId_fkey" FOREIGN KEY ("scheduledNotificationId") REFERENCES "ScheduledNotification"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Link" ADD CONSTRAINT "Link_sentNotificationId_fkey" FOREIGN KEY ("sentNotificationId") REFERENCES "SentNotification"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SentNotification" ADD CONSTRAINT "SentNotification_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "NotificationSubscription"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScheduledNotification" ADD CONSTRAINT "ScheduledNotification_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScheduledNotification" ADD CONSTRAINT "ScheduledNotification_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScheduledNotification" ADD CONSTRAINT "ScheduledNotification_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "Article"("id") ON DELETE SET NULL ON UPDATE CASCADE;

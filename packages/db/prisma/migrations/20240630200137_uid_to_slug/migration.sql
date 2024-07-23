/*
 Warnings:
 
 - You are about to drop the column `uid` on the `Article` table. All the data in the column will be lost.
 - You are about to drop the column `uid` on the `BarWeek` table. All the data in the column will be lost.
 - You are about to drop the column `uid` on the `Document` table. All the data in the column will be lost.
 - You are about to drop the column `uid` on the `Event` table. All the data in the column will be lost.
 - You are about to drop the column `uid` on the `Minor` table. All the data in the column will be lost.
 - You are about to drop the column `uid` on the `ShopItem` table. All the data in the column will be lost.
 - You are about to drop the column `uid` on the `Subject` table. All the data in the column will be lost.
 - You are about to drop the column `uid` on the `Ticket` table. All the data in the column will be lost.
 - A unique constraint covering the columns `[groupId,slug]` on the table `Article` will be added. If there are existing duplicate values, this will fail.
 - A unique constraint covering the columns `[subjectId,slug]` on the table `Document` will be added. If there are existing duplicate values, this will fail.
 - A unique constraint covering the columns `[groupId,slug]` on the table `Event` will be added. If there are existing duplicate values, this will fail.
 - A unique constraint covering the columns `[slug,yearTier]` on the table `Minor` will be added. If there are existing duplicate values, this will fail.
 - A unique constraint covering the columns `[groupId,slug]` on the table `ShopItem` will be added. If there are existing duplicate values, this will fail.
 - A unique constraint covering the columns `[slug,yearTier,forApprentices]` on the table `Subject` will be added. If there are existing duplicate values, this will fail.
 - A unique constraint covering the columns `[eventId,ticketGroupId,slug]` on the table `Ticket` will be added. If there are existing duplicate values, this will fail.
 - Added the required column `slug` to the `Article` table without a default value. This is not possible if the table is not empty.
 - Added the required column `slug` to the `BarWeek` table without a default value. This is not possible if the table is not empty.
 - Added the required column `slug` to the `Document` table without a default value. This is not possible if the table is not empty.
 - Added the required column `slug` to the `Event` table without a default value. This is not possible if the table is not empty.
 - Added the required column `slug` to the `Minor` table without a default value. This is not possible if the table is not empty.
 - Added the required column `slug` to the `ShopItem` table without a default value. This is not possible if the table is not empty.
 - Added the required column `slug` to the `Subject` table without a default value. This is not possible if the table is not empty.
 - Added the required column `slug` to the `Ticket` table without a default value. This is not possible if the table is not empty.
 
 */
-- DropIndex
DROP INDEX "Article_groupId_uid_key";

-- DropIndex
DROP INDEX "BarWeek_uid_key";

-- DropIndex
DROP INDEX "Document_subjectId_uid_key";

-- DropIndex
DROP INDEX "Event_groupId_uid_key";

-- DropIndex
DROP INDEX "Minor_uid_yearTier_key";

-- DropIndex
DROP INDEX "ShopItem_groupId_uid_key";

-- DropIndex
DROP INDEX "Subject_uid_yearTier_forApprentices_key";

-- DropIndex
DROP INDEX "Ticket_eventId_ticketGroupId_uid_key";

-- AlterTable
ALTER TABLE
  "Announcement"
ALTER COLUMN
  "id"
SET
  DEFAULT nanoid('ann:');

-- AlterTable
ALTER TABLE
  "Answer"
ALTER COLUMN
  "id"
SET
  DEFAULT nanoid('answer:');

-- AlterTable
ALTER TABLE
  "Article" RENAME COLUMN "uid" TO "slug";

ALTER TABLE
  "Article"
ALTER COLUMN
  "id"
SET
  DEFAULT nanoid('a:');

-- AlterTable
ALTER TABLE
  "BarWeek" RENAME COLUMN "uid" TO "slug";

ALTER TABLE
  "BarWeek"
ALTER COLUMN
  "id"
SET
  DEFAULT nanoid('barweek:');

-- AlterTable
ALTER TABLE
  "Comment"
ALTER COLUMN
  "id"
SET
  DEFAULT nanoid('comment:');

-- AlterTable
ALTER TABLE
  "Contribution"
ALTER COLUMN
  "id"
SET
  DEFAULT nanoid('contribution:');

-- AlterTable
ALTER TABLE
  "ContributionOption"
ALTER COLUMN
  "id"
SET
  DEFAULT nanoid('contributionoption:');

-- AlterTable
ALTER TABLE
  "Credential"
ALTER COLUMN
  "id"
SET
  DEFAULT nanoid('credential:');

-- AlterTable
ALTER TABLE
  "Document" RENAME COLUMN "uid" TO "slug";

ALTER TABLE
  "Document"
ALTER COLUMN
  "id"
SET
  DEFAULT nanoid('doc:');

-- AlterTable
ALTER TABLE
  "EmailChange"
ALTER COLUMN
  "id"
SET
  DEFAULT nanoid('emailchange:');

-- AlterTable
ALTER TABLE
  "Event" RENAME COLUMN "uid" TO "slug";

ALTER TABLE
  "Event"
ALTER COLUMN
  "id"
SET
  DEFAULT nanoid('e:');

-- AlterTable
ALTER TABLE
  "Form"
ALTER COLUMN
  "id"
SET
  DEFAULT nanoid('form:');

-- AlterTable
ALTER TABLE
  "FormJump"
ALTER COLUMN
  "id"
SET
  DEFAULT nanoid('formjump:');

-- AlterTable
ALTER TABLE
  "FormSection"
ALTER COLUMN
  "id"
SET
  DEFAULT nanoid('formsection:');

-- AlterTable
ALTER TABLE
  "GodparentRequest"
ALTER COLUMN
  "id"
SET
  DEFAULT nanoid('godparentreq:');

-- AlterTable
ALTER TABLE
  "Group"
ALTER COLUMN
  "id"
SET
  DEFAULT nanoid('g:');

-- AlterTable
ALTER TABLE
  "Link"
ALTER COLUMN
  "id"
SET
  DEFAULT nanoid('link:');

-- AlterTable
ALTER TABLE
  "LogEntry"
ALTER COLUMN
  "id"
SET
  DEFAULT nanoid('log:');

-- AlterTable
ALTER TABLE
  "LydiaAccount"
ALTER COLUMN
  "id"
SET
  DEFAULT nanoid('lydia:');

-- AlterTable
ALTER TABLE
  "LydiaTransaction"
ALTER COLUMN
  "id"
SET
  DEFAULT nanoid('lydiapayment:');

-- AlterTable
ALTER TABLE
  "Major"
ALTER COLUMN
  "id"
SET
  DEFAULT nanoid('major:');

-- AlterTable
ALTER TABLE
  "Minor" RENAME COLUMN "uid" TO "slug";

ALTER TABLE
  "Minor"
ALTER COLUMN
  "id"
SET
  DEFAULT nanoid('minor:');

-- AlterTable
ALTER TABLE
  "Notification"
ALTER COLUMN
  "id"
SET
  DEFAULT nanoid('notif:');

-- AlterTable
ALTER TABLE
  "NotificationSubscription"
ALTER COLUMN
  "id"
SET
  DEFAULT nanoid('notifsub:');

-- AlterTable
ALTER TABLE
  "Page"
ALTER COLUMN
  "id"
SET
  DEFAULT nanoid('page:');

-- AlterTable
ALTER TABLE
  "PasswordReset"
ALTER COLUMN
  "id"
SET
  DEFAULT nanoid('passreset:');

-- AlterTable
ALTER TABLE
  "PaypalTransaction"
ALTER COLUMN
  "id"
SET
  DEFAULT nanoid('paypalpayment:');

-- AlterTable
ALTER TABLE
  "Picture"
ALTER COLUMN
  "id"
SET
  DEFAULT nanoid('picfile:');

-- AlterTable
ALTER TABLE
  "Promotion"
ALTER COLUMN
  "id"
SET
  DEFAULT nanoid('promo:');

-- AlterTable
ALTER TABLE
  "PromotionCode"
ALTER COLUMN
  "id"
SET
  DEFAULT nanoid('promocode:');

-- AlterTable
ALTER TABLE
  "Question"
ALTER COLUMN
  "id"
SET
  DEFAULT nanoid('question:');

-- AlterTable
ALTER TABLE
  "QuickSignup"
ALTER COLUMN
  "id"
SET
  DEFAULT nanoid('quicksignup:', 6);

-- AlterTable
ALTER TABLE
  "Reaction"
ALTER COLUMN
  "id"
SET
  DEFAULT nanoid('reac:');

-- AlterTable
ALTER TABLE
  "Registration"
ALTER COLUMN
  "id"
SET
  DEFAULT nanoid('r:');

-- AlterTable
ALTER TABLE
  "School"
ALTER COLUMN
  "id"
SET
  DEFAULT nanoid('school:'),
ALTER COLUMN
  "aliasMailDomains"
SET
  DEFAULT ARRAY [ ] :: VARCHAR(255) [ ];

-- AlterTable
ALTER TABLE
  "Service"
ALTER COLUMN
  "id"
SET
  DEFAULT nanoid('service:');

-- AlterTable
ALTER TABLE
  "ShopItem" RENAME COLUMN "uid" TO "slug";

ALTER TABLE
  "ShopItem"
ALTER COLUMN
  "id"
SET
  DEFAULT nanoid('shopitem:');

-- AlterTable
ALTER TABLE
  "ShopItemAnswer"
ALTER COLUMN
  "id"
SET
  DEFAULT nanoid('shopitemanswer:');

-- AlterTable
ALTER TABLE
  "ShopItemOption"
ALTER COLUMN
  "id"
SET
  DEFAULT nanoid('shopitemoption:');

-- AlterTable
ALTER TABLE
  "ShopPayment"
ALTER COLUMN
  "id"
SET
  DEFAULT nanoid('shoppayment:');

-- AlterTable
ALTER TABLE
  "StudentAssociation"
ALTER COLUMN
  "id"
SET
  DEFAULT nanoid('ae:');

-- AlterTable
ALTER TABLE
  "Subject" RENAME COLUMN "uid" TO "slug";

ALTER TABLE
  "Subject"
ALTER COLUMN
  "id"
SET
  DEFAULT nanoid('subj:');

-- AlterTable
ALTER TABLE
  "TeachingUnit"
ALTER COLUMN
  "id"
SET
  DEFAULT nanoid('ue:');

-- AlterTable
ALTER TABLE
  "ThirdPartyApp"
ALTER COLUMN
  "id"
SET
  DEFAULT nanoid('app:', 30);

-- AlterTable
ALTER TABLE
  "ThirdPartyCredential"
ALTER COLUMN
  "id"
SET
  DEFAULT nanoid('token:');

-- AlterTable
ALTER TABLE
  "Ticket" RENAME COLUMN "uid" TO "slug";

ALTER TABLE
  "Ticket"
ALTER COLUMN
  "id"
SET
  DEFAULT nanoid('t:');

-- AlterTable
ALTER TABLE
  "TicketGroup"
ALTER COLUMN
  "id"
SET
  DEFAULT nanoid('tg:');

-- AlterTable
ALTER TABLE
  "User"
ALTER COLUMN
  "id"
SET
  DEFAULT nanoid('u:');

-- AlterTable
ALTER TABLE
  "UserCandidate"
ALTER COLUMN
  "id"
SET
  DEFAULT nanoid('candidate:');

-- CreateIndex
CREATE UNIQUE INDEX "Article_groupId_slug_key" ON "Article"("groupId", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "Document_subjectId_slug_key" ON "Document"("subjectId", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "Event_groupId_slug_key" ON "Event"("groupId", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "Minor_slug_yearTier_key" ON "Minor"("slug", "yearTier");

-- CreateIndex
CREATE UNIQUE INDEX "ShopItem_groupId_slug_key" ON "ShopItem"("groupId", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "Subject_slug_yearTier_forApprentices_key" ON "Subject"("slug", "yearTier", "forApprentices");

-- CreateIndex
CREATE UNIQUE INDEX "Ticket_eventId_ticketGroupId_slug_key" ON "Ticket"("eventId", "ticketGroupId", "slug");

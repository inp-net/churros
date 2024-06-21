-- CreateEnum
CREATE TYPE "QuestionKind" AS ENUM ('Text', 'LongText', 'SelectOne', 'SelectMultiple', 'FileUpload', 'Scale', 'Number', 'Date', 'Time');

-- AlterEnum
ALTER TYPE "CredentialType" ADD VALUE 'Google';

-- AlterTable
ALTER TABLE "Announcement" ALTER COLUMN "id" SET DEFAULT nanoid('ann:');

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
ALTER TABLE "Credential" ADD COLUMN     "refresh" VARCHAR(255),
ALTER COLUMN "id" SET DEFAULT nanoid('credential:');

-- AlterTable
ALTER TABLE "Document" ALTER COLUMN "id" SET DEFAULT nanoid('doc:');

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
ALTER TABLE "Minor" ALTER COLUMN "id" SET DEFAULT nanoid('minor:');

-- AlterTable
ALTER TABLE "Notification" ALTER COLUMN "id" SET DEFAULT nanoid('notif:');

-- AlterTable
ALTER TABLE "NotificationSubscription" ALTER COLUMN "id" SET DEFAULT nanoid('notifsub:');

-- AlterTable
ALTER TABLE "PasswordReset" ALTER COLUMN "id" SET DEFAULT nanoid('passreset:');

-- AlterTable
ALTER TABLE "PaypalTransaction" ALTER COLUMN "id" SET DEFAULT nanoid('paypalpayment:');

-- AlterTable
ALTER TABLE "Promotion" ALTER COLUMN "id" SET DEFAULT nanoid('promo:');

-- AlterTable
ALTER TABLE "PromotionCode" ALTER COLUMN "id" SET DEFAULT nanoid('promocode:');

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

-- CreateTable
CREATE TABLE "Form" (
    "id" TEXT NOT NULL DEFAULT nanoid('form:'),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" TEXT,
    "visibility" "Visibility" NOT NULL,
    "groupId" TEXT NOT NULL,
    "eventId" TEXT,
    "opensAt" TIMESTAMP(3),
    "closesAt" TIMESTAMP(3),
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT NOT NULL,
    "search" tsvector NOT NULL DEFAULT ''::tsvector,
    "linkedGoogleSheetId" TEXT,

    CONSTRAINT "Form_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FormSection" (
    "id" TEXT NOT NULL DEFAULT nanoid('formsection:'),
    "order" INTEGER NOT NULL,
    "formId" TEXT NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "FormSection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FormJump" (
    "id" TEXT NOT NULL DEFAULT nanoid('formjump:'),
    "questionId" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,

    CONSTRAINT "FormJump_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Question" (
    "id" TEXT NOT NULL DEFAULT nanoid('question:'),
    "sectionId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT NOT NULL,
    "type" "QuestionKind" NOT NULL,
    "mandatory" BOOLEAN NOT NULL DEFAULT false,
    "anonymous" BOOLEAN NOT NULL DEFAULT false,
    "options" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "scaleStart" INTEGER,
    "scaleEnd" INTEGER,
    "allowOptionOther" BOOLEAN NOT NULL DEFAULT false,
    "allowedFiletypes" TEXT[] DEFAULT ARRAY[]::TEXT[],

    CONSTRAINT "Question_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Answer" (
    "id" TEXT NOT NULL DEFAULT nanoid('answer:'),
    "questionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" TEXT,
    "answer" TEXT[],
    "number" DOUBLE PRECISION,
    "bookingId" TEXT,
    "search" tsvector NOT NULL DEFAULT ''::tsvector,

    CONSTRAINT "Answer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_completedForms" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_partiallyCompletedForms" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_restrictedTo" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE INDEX "Form_search_idx" ON "Form" USING GIN ("search");

-- CreateIndex
CREATE UNIQUE INDEX "FormSection_formId_order_key" ON "FormSection"("formId", "order");

-- CreateIndex
CREATE UNIQUE INDEX "Question_sectionId_order_key" ON "Question"("sectionId", "order");

-- CreateIndex
CREATE UNIQUE INDEX "Answer_bookingId_key" ON "Answer"("bookingId");

-- CreateIndex
CREATE INDEX "Answer_search_idx" ON "Answer" USING GIN ("search");

-- CreateIndex
CREATE UNIQUE INDEX "Answer_questionId_createdById_key" ON "Answer"("questionId", "createdById");

-- CreateIndex
CREATE UNIQUE INDEX "_completedForms_AB_unique" ON "_completedForms"("A", "B");

-- CreateIndex
CREATE INDEX "_completedForms_B_index" ON "_completedForms"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_partiallyCompletedForms_AB_unique" ON "_partiallyCompletedForms"("A", "B");

-- CreateIndex
CREATE INDEX "_partiallyCompletedForms_B_index" ON "_partiallyCompletedForms"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_restrictedTo_AB_unique" ON "_restrictedTo"("A", "B");

-- CreateIndex
CREATE INDEX "_restrictedTo_B_index" ON "_restrictedTo"("B");

-- AddForeignKey
ALTER TABLE "Form" ADD CONSTRAINT "Form_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Form" ADD CONSTRAINT "Form_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Form" ADD CONSTRAINT "Form_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormSection" ADD CONSTRAINT "FormSection_formId_fkey" FOREIGN KEY ("formId") REFERENCES "Form"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormJump" ADD CONSTRAINT "FormJump_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormJump" ADD CONSTRAINT "FormJump_targetId_fkey" FOREIGN KEY ("targetId") REFERENCES "FormSection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "FormSection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Answer" ADD CONSTRAINT "Answer_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Answer" ADD CONSTRAINT "Answer_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Answer" ADD CONSTRAINT "Answer_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Registration"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_completedForms" ADD CONSTRAINT "_completedForms_A_fkey" FOREIGN KEY ("A") REFERENCES "Form"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_completedForms" ADD CONSTRAINT "_completedForms_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_partiallyCompletedForms" ADD CONSTRAINT "_partiallyCompletedForms_A_fkey" FOREIGN KEY ("A") REFERENCES "Form"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_partiallyCompletedForms" ADD CONSTRAINT "_partiallyCompletedForms_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_restrictedTo" ADD CONSTRAINT "_restrictedTo_A_fkey" FOREIGN KEY ("A") REFERENCES "FormSection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_restrictedTo" ADD CONSTRAINT "_restrictedTo_B_fkey" FOREIGN KEY ("B") REFERENCES "Group"("id") ON DELETE CASCADE ON UPDATE CASCADE;


-- Answer
CREATE OR REPLACE FUNCTION update_answer_search() RETURNS TRIGGER AS $$
DECLARE
    
createdby_email text := '';
createdby_schoolEmail text := '';
createdby_firstName text := '';
createdby_lastName text := '';
BEGIN
    
createdby_email = (
            SELECT "email"
            FROM "User"
            WHERE "User"."id" = NEW."createdById"
        );
createdby_schoolEmail = (
            SELECT "schoolEmail"
            FROM "User"
            WHERE "User"."id" = NEW."createdById"
        );
createdby_firstName = (
            SELECT "firstName"
            FROM "User"
            WHERE "User"."id" = NEW."createdById"
        );
createdby_lastName = (
            SELECT "lastName"
            FROM "User"
            WHERE "User"."id" = NEW."createdById"
        );

    NEW."search" := setweight(to_tsvector('french', coalesce(NEW."createdById"::text, '')), 'A') || setweight(to_tsvector('french', coalesce(NEW."bookingId"::text, '')), 'A') || setweight(to_tsvector('french', coalesce(createdby_email::text, '')), 'A') || setweight(to_tsvector('french', coalesce(createdby_schoolEmail::text, '')), 'A') || setweight(to_tsvector('french', coalesce(NEW."questionId"::text, '')), 'B') || setweight(to_tsvector('french', coalesce(createdby_firstName::text, '')), 'B') || setweight(to_tsvector('french', coalesce(createdby_lastName::text, '')), 'B');

    RETURN NEW;
END $$ LANGUAGE plpgsql;

CREATE TRIGGER update_answer_search_trigger before INSERT OR UPDATE ON "Answer" FOR EACH ROW EXECUTE PROCEDURE update_answer_search();

-- Form
CREATE OR REPLACE FUNCTION update_form_search() RETURNS TRIGGER AS $$
DECLARE
    

BEGIN
    


    NEW."search" := setweight(to_tsvector('french', coalesce(NEW."title"::text, '')), 'A') || setweight(to_tsvector('french', coalesce(NEW."description"::text, '')), 'B') || setweight(to_tsvector('french', coalesce(NEW."createdById"::text, '')), 'C') || setweight(to_tsvector('french', coalesce(NEW."groupId"::text, '')), 'C') || setweight(to_tsvector('french', coalesce(NEW."eventId"::text, '')), 'C') || setweight(to_tsvector('french', coalesce(NEW."linkedGoogleSheetId"::text, '')), 'D');

    RETURN NEW;
END $$ LANGUAGE plpgsql;

CREATE TRIGGER update_form_search_trigger before INSERT OR UPDATE ON "Form" FOR EACH ROW EXECUTE PROCEDURE update_form_search();

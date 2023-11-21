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
ALTER TABLE "Credential" ALTER COLUMN "id" SET DEFAULT nanoid('credential:');

-- AlterTable
ALTER TABLE "Document" ADD COLUMN     "search" tsvector NOT NULL DEFAULT ''::tsvector,
ALTER COLUMN "id" SET DEFAULT nanoid('doc:');

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
ALTER TABLE "Reaction" ALTER COLUMN "id" SET DEFAULT nanoid('reac:');

-- AlterTable
ALTER TABLE "Registration" ADD COLUMN     "search" tsvector NOT NULL DEFAULT ''::tsvector,
ALTER COLUMN "id" SET DEFAULT nanoid('r:');

-- AlterTable
ALTER TABLE "School" ALTER COLUMN "id" SET DEFAULT nanoid('school:');

-- AlterTable
ALTER TABLE "Service" ALTER COLUMN "id" SET DEFAULT nanoid('service:');

-- AlterTable
ALTER TABLE "StudentAssociation" ALTER COLUMN "id" SET DEFAULT nanoid('ae:');

-- AlterTable
ALTER TABLE "Subject" ALTER COLUMN "id" SET DEFAULT nanoid('subj:');

-- AlterTable
ALTER TABLE "TeachingUnit" ALTER COLUMN "id" SET DEFAULT nanoid('ue:');

-- AlterTable
ALTER TABLE "Ticket" ALTER COLUMN "id" SET DEFAULT nanoid('t:');

-- AlterTable
ALTER TABLE "TicketGroup" ALTER COLUMN "id" SET DEFAULT nanoid('tg:');

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "id" SET DEFAULT nanoid('u:');

-- AlterTable
ALTER TABLE "UserCandidate" ALTER COLUMN "id" SET DEFAULT nanoid('candidate:');

-- CreateIndex
CREATE INDEX "Document_search_idx" ON "Document" USING GIN ("search");

-- CreateIndex
CREATE INDEX "Registration_search_idx" ON "Registration" USING GIN ("search");



-- Registration
CREATE OR REPLACE FUNCTION update_registration_search() RETURNS TRIGGER AS $$
DECLARE
    author_firstName text := '';
author_lastName text := '';
ticket_name text := '';
ticket_description text := '';
author_graduationYear text := '';
ticket_price text := '';
BEGIN
    author_firstName := (
                SELECT "firstName"
                FROM "User"
                WHERE "User"."id" = NEW."authorId"
            );
            
author_lastName := (
                SELECT "lastName"
                FROM "User"
                WHERE "User"."id" = NEW."authorId"
            );
            
ticket_name := (
                SELECT "name"
                FROM "Ticket"
                WHERE "Ticket"."id" = NEW."ticketId"
            );
            
ticket_description := (
                SELECT "description"
                FROM "Ticket"
                WHERE "Ticket"."id" = NEW."ticketId"
            );
            
author_graduationYear := (
                SELECT "graduationYear"
                FROM "User"
                WHERE "User"."id" = NEW."authorId"
            );
            
ticket_price := (
                SELECT "price"
                FROM "Ticket"
                WHERE "Ticket"."id" = NEW."ticketId"
            );
            

    NEW."search" := setweight(to_tsvector('french', coalesce(author_firstName::text, '')), 'A')||setweight(to_tsvector('french', coalesce(author_lastName::text, '')), 'A')||setweight(to_tsvector('french', coalesce(ticket_name::text, '')), 'B')||setweight(to_tsvector('french', coalesce(ticket_description::text, '')), 'C')||setweight(to_tsvector('french', coalesce(author_graduationYear::text, '')), 'C')||setweight(to_tsvector('french', coalesce(ticket_price::text, '')), 'D');

    RETURN NEW;
END $$ LANGUAGE plpgsql;

CREATE TRIGGER update_registration_search_trigger before INSERT OR UPDATE ON "Registration" FOR EACH ROW EXECUTE PROCEDURE update_registration_search();




-- Document
CREATE OR REPLACE FUNCTION update_document_search() RETURNS TRIGGER AS $$
DECLARE
    subject_name text := '';
uploader_firstName text := '';
uploader_lastName text := '';
BEGIN
    subject_name := (
                SELECT "name"
                FROM "Subject"
                WHERE "Subject"."id" = NEW."subjectId"
            );
            
uploader_firstName := (
                SELECT "firstName"
                FROM "User"
                WHERE "User"."id" = NEW."uploaderId"
            );
            
uploader_lastName := (
                SELECT "lastName"
                FROM "User"
                WHERE "User"."id" = NEW."uploaderId"
            );
            

    NEW."search" := setweight(to_tsvector('french', coalesce(NEW."title"::text, '')), 'A')||setweight(to_tsvector('french', coalesce(NEW."description"::text, '')), 'B')||setweight(to_tsvector('french', coalesce(subject_name::text, '')), 'B')||setweight(to_tsvector('french', coalesce(uploader_firstName::text, '')), 'C')||setweight(to_tsvector('french', coalesce(uploader_lastName::text, '')), 'C');

    RETURN NEW;
END $$ LANGUAGE plpgsql;

CREATE TRIGGER update_document_search_trigger before INSERT OR UPDATE ON "Document" FOR EACH ROW EXECUTE PROCEDURE update_document_search();

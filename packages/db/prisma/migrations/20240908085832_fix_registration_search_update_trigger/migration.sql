/*
  Warnings:

  - You are about to drop the column `price` on the `Registration` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Announcement" ALTER COLUMN "id" SET DEFAULT nanoid('ann:');

-- AlterTable
ALTER TABLE "Answer" ALTER COLUMN "id" SET DEFAULT nanoid('answer:');

-- AlterTable
ALTER TABLE "Article" ALTER COLUMN "id" SET DEFAULT nanoid('a:');

-- AlterTable
ALTER TABLE "BarWeek" ALTER COLUMN "id" SET DEFAULT nanoid('barweek:');

-- AlterTable
ALTER TABLE "Bookmark" ALTER COLUMN "id" SET DEFAULT nanoid('bookmark:');

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
ALTER TABLE "EmailChange" ALTER COLUMN "id" SET DEFAULT nanoid('emailchange:'),
ALTER COLUMN "token" SET DEFAULT nanoid('', 30);

-- AlterTable
ALTER TABLE "Event" ALTER COLUMN "id" SET DEFAULT nanoid('e:');

-- AlterTable
ALTER TABLE "EventManager" ALTER COLUMN "id" SET DEFAULT nanoid('em:');

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
ALTER TABLE "Page" ALTER COLUMN "id" SET DEFAULT nanoid('page:');

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
ALTER TABLE "Registration" DROP COLUMN "price",
ALTER COLUMN "id" SET DEFAULT nanoid('r:');

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
ALTER TABLE "Theme" ALTER COLUMN "id" SET DEFAULT nanoid('theme:');

-- AlterTable
ALTER TABLE "ThemeValue" ALTER COLUMN "id" SET DEFAULT nanoid('themeval:');

-- AlterTable
ALTER TABLE "Ticket" ALTER COLUMN "id" SET DEFAULT nanoid('t:');

-- AlterTable
ALTER TABLE "TicketGroup" ALTER COLUMN "id" SET DEFAULT nanoid('tg:');

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "id" SET DEFAULT nanoid('u:');

-- AlterTable
ALTER TABLE "UserCandidate" ALTER COLUMN "id" SET DEFAULT nanoid('candidate:');

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
            

    NEW."search" := setweight(to_tsvector('french', coalesce(author_firstName::text, '')), 'A')||setweight(to_tsvector('french', coalesce(author_lastName::text, '')), 'A')||setweight(to_tsvector('french', coalesce(ticket_name::text, '')), 'B')||setweight(to_tsvector('french', coalesce(ticket_description::text, '')), 'C')||setweight(to_tsvector('french', coalesce(author_graduationYear::text, '')), 'C');

    RETURN NEW;
END $$ LANGUAGE plpgsql;

CREATE TRIGGER update_registration_search_trigger before INSERT OR UPDATE ON "Registration" FOR EACH ROW EXECUTE PROCEDURE update_registration_search();

-- AlterTable
ALTER TABLE "Announcement" ALTER COLUMN "id" SET DEFAULT nanoid('ann:');

-- AlterTable
ALTER TABLE "Article" ADD COLUMN     "groupName" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "search" tsvector NOT NULL DEFAULT ''::tsvector,
ALTER COLUMN "id" SET DEFAULT nanoid('a:');

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
ALTER TABLE "Event" ADD COLUMN     "coOrganizersNames" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "groupName" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "search" tsvector NOT NULL DEFAULT ''::tsvector,
ALTER COLUMN "id" SET DEFAULT nanoid('e:');

-- AlterTable
ALTER TABLE "GodparentRequest" ALTER COLUMN "id" SET DEFAULT nanoid('godparentreq:');

-- AlterTable
ALTER TABLE "Group" ADD COLUMN     "search" tsvector NOT NULL DEFAULT ''::tsvector,
ALTER COLUMN "id" SET DEFAULT nanoid('g:');

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
ALTER TABLE "Registration" ALTER COLUMN "id" SET DEFAULT nanoid('r:');

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
ALTER TABLE "User" ADD COLUMN     "majorShortName" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "search" tsvector NOT NULL DEFAULT ''::tsvector,
ALTER COLUMN "id" SET DEFAULT nanoid('u:');

-- AlterTable
ALTER TABLE "UserCandidate" ALTER COLUMN "id" SET DEFAULT nanoid('candidate:');

-- CreateIndex
CREATE INDEX "Article_search_idx" ON "Article" USING GIN ("search");

-- CreateIndex
CREATE INDEX "Event_search_idx" ON "Event" USING GIN ("search");

-- CreateIndex
CREATE INDEX "Group_search_idx" ON "Group" USING GIN ("search");

-- CreateIndex
CREATE INDEX "User_search_idx" ON "User" USING GIN ("search");

-- See ../../../src/fulltextsearch.sql
-------------------------
-- Pre-computed fields --
-------------------------
-- For foreign fields, we pre-compute them onto the table, since generated columns can't use fields from other tables.
-- User.major.shortName
CREATE
OR replace FUNCTION update_major_short_name_on_user() returns TRIGGER AS $$ BEGIN
	-- Update "majorShortName" in every user that has majorId = new."id"
	UPDATE
		"User"
	SET
		"majorShortName" = NEW."shortName"
	WHERE
		"majorId" = NEW."id";

RETURN NEW;

END $$ LANGUAGE plpgsql;

CREATE TRIGGER precompute_majort_short_name_on_user after
INSERT
	OR
UPDATE
	ON "Major" FOR each ROW EXECUTE PROCEDURE update_major_short_name_on_user();

-- Event.group.name
CREATE
OR replace FUNCTION update_group_name_on_event() returns TRIGGER AS $$ BEGIN
	-- Update "groupName" in every event that has groupId = new."id"
	UPDATE
		"Event"
	SET
		"groupName" = NEW."name"
	WHERE
		"groupId" = NEW."id";

RETURN NEW;

END $$ LANGUAGE plpgsql;

CREATE TRIGGER precompute_group_name_on_event after
INSERT
	OR
UPDATE
	ON "Group" FOR each ROW EXECUTE PROCEDURE update_group_name_on_event();

-- Article.group.name
CREATE
OR replace FUNCTION update_group_name_on_article() returns TRIGGER AS $$ BEGIN
	-- Update "groupName" in every article that has groupId = new."id"
	UPDATE
		"Article"
	SET
		"groupName" = NEW."name"
	WHERE
		"groupId" = NEW."id";

RETURN NEW;

END $$ LANGUAGE plpgsql;

CREATE TRIGGER precompute_group_name_on_article after
INSERT
	OR
UPDATE
	ON "Group" FOR each ROW EXECUTE PROCEDURE update_group_name_on_article();

-- Event.coOrganizers[].names
-- CREATE
-- OR replace FUNCTION update_co_organizers_names_on_event returns TRIGGER AS $$ BEGIN BEGIN
-- 	-- Set "coOrganizersNames" on every event that has an entry in _coOrganizer with the group new
-- 	-- TODO
-- END $$ LANGUAGE plpgsql;
-- CREATE TRIGGER precompute_co_organizers_names_on_event after
-- INSERT
-- 	OR
-- UPDATE
-- 	ON "User" FOR each ROW EXECUTE PROCEDURE update_co_organizers_names_on_event();
---------------------------------
-- Generated columns & indexes --
---------------------------------
-- We can't have nice things since prisma breaks generated columns, see https://github.com/prisma/prisma/issues/15654
-- So we're using triggers instead.
--
-- Group
CREATE
OR replace FUNCTION update_group_search() returns TRIGGER AS $$ BEGIN
	NEW."search" := setweight(to_tsvector('english', NEW."name"), 'A') || setweight(to_tsvector('english', NEW."description"), 'B') || setweight(to_tsvector('english', NEW."email"), 'B') || setweight(to_tsvector('english', NEW."website"), 'C') || setweight(to_tsvector('english', NEW."uid"), 'D');

RETURN NEW;

END $$ LANGUAGE plpgsql;

CREATE TRIGGER update_group_search_trigger before
INSERT
	OR
UPDATE
	ON "Group" FOR each ROW EXECUTE PROCEDURE update_group_search();

-- User
-- drop the one generated by prisma
CREATE
OR replace FUNCTION update_user_search() returns TRIGGER AS $$ BEGIN
	NEW."search" := setweight(to_tsvector('english', NEW."lastName"), 'A') || setweight(to_tsvector('english', NEW."firstName"), 'A') || setweight(to_tsvector('english', NEW."nickname"), 'B') || setweight(to_tsvector('english', NEW."email"), 'B') || setweight(to_tsvector('english', NEW."phone"), 'B') || setweight(to_tsvector('english', NEW."uid"), 'C') || setweight(
		to_tsvector('english', NEW."graduationYear" :: text),
		'D'
	) || setweight(
		to_tsvector('english', NEW."majorShortName"),
		'D'
	) || setweight(to_tsvector('english', NEW."description"), 'D');

RETURN NEW;

END $$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_search_trigger before
INSERT
	OR
UPDATE
	ON "User" FOR each ROW EXECUTE PROCEDURE update_user_search();

-- Event
-- drop the one generated by prisma
CREATE
OR replace FUNCTION update_event_search() returns TRIGGER AS $$ BEGIN
	NEW."search" := setweight(to_tsvector('english', NEW."title"), 'A') || setweight(to_tsvector('english', NEW."description"), 'B') || setweight(to_tsvector('english', NEW."groupName"), 'C') || setweight(
		to_tsvector('english', NEW."coOrganizersNames"),
		'C'
	) || setweight(to_tsvector('english', NEW."location"), 'D');

RETURN NEW;

END $$ LANGUAGE plpgsql;

CREATE TRIGGER update_event_search_trigger before
INSERT
	OR
UPDATE
	ON "Event" FOR each ROW EXECUTE PROCEDURE update_event_search();

-- Article
-- drop the one generated by prisma
CREATE
OR replace FUNCTION update_article_search() returns TRIGGER AS $$ BEGIN
	NEW."search" := setweight(to_tsvector('english', NEW."title"), 'A') || setweight(to_tsvector('english', NEW."body"), 'B') || setweight(to_tsvector('english', NEW."groupName"), 'C');

RETURN NEW;

END $$ LANGUAGE plpgsql;

CREATE TRIGGER update_article_search_trigger before
INSERT
	OR
UPDATE
	ON "Article" FOR each ROW EXECUTE PROCEDURE update_article_search();

---------------------------------
-- Generated columns & indexes --
---------------------------------
-- We can't have nice things since prisma breaks generated columns, see https://github.com/prisma/prisma/issues/15654
-- So we're using triggers instead.
-- This also allows us to query fields on tother tables, sth generated columns can't do.
--
-- Group
CREATE
OR replace FUNCTION update_group_search() returns TRIGGER AS $$ BEGIN
	NEW."search" := setweight(to_tsvector('french', NEW."name"), 'A') || setweight(to_tsvector('french', NEW."description"), 'B') || setweight(to_tsvector('french', NEW."email"), 'B') || setweight(to_tsvector('french', NEW."website"), 'C') || setweight(to_tsvector('french', NEW."uid"), 'D');

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
OR replace FUNCTION update_user_search() returns TRIGGER AS $$
DECLARE
	major_short_name text := '';

BEGIN
	major_short_name := (
		SELECT
			"shortName"
		FROM
			"Major"
		WHERE
			"Major"."id" = NEW."majorId"
	);

NEW."search" := setweight(to_tsvector('french', NEW."lastName"), 'A') || setweight(to_tsvector('french', NEW."firstName"), 'A') || setweight(to_tsvector('french', NEW."nickname"), 'B') || setweight(to_tsvector('french', NEW."email"), 'B') || setweight(to_tsvector('french', NEW."phone"), 'B') || setweight(to_tsvector('french', NEW."uid"), 'C') || setweight(
	to_tsvector('french', NEW."graduationYear" :: text),
	'D'
) || setweight(
	to_tsvector('french', coalesce(major_short_name, '')),
	'D'
) || setweight(to_tsvector('french', NEW."description"), 'D');

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
OR replace FUNCTION update_event_search() returns TRIGGER AS $$
DECLARE
	group_name text := '';

co_organizers_names text := '';

BEGIN
	group_name := (
		SELECT
			"name"
		FROM
			"Group"
		WHERE
			"Group"."id" = NEW."groupId"
	);

co_organizers_names := (
	SELECT
		COALESCE(string_agg("name", ' '), '')
	FROM
		"Group"
		JOIN "_coOrganizer" ON "A" = NEW."id"
	WHERE
		"_coOrganizer"."B" = NEW."groupId"
);

NEW."search" := setweight(to_tsvector('french', NEW."title"), 'A') || setweight(to_tsvector('french', NEW."description"), 'B') || setweight(to_tsvector('french', group_name), 'C') || setweight(
	to_tsvector('french', co_organizers_names),
	'C'
) || setweight(to_tsvector('french', NEW."location"), 'D');

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
OR replace FUNCTION update_article_search() returns TRIGGER AS $$
DECLARE
	group_name text := '';

BEGIN
	group_name := (
		SELECT
			"name"
		FROM
			"Group"
		WHERE
			"Group"."id" = NEW."groupId"
	);

NEW."search" := setweight(to_tsvector('french', NEW."title"), 'A') || setweight(to_tsvector('french', NEW."body"), 'B') || setweight(to_tsvector('french', group_name), 'C');

RETURN NEW;

END $$ LANGUAGE plpgsql;

CREATE TRIGGER update_article_search_trigger before
INSERT
	OR
UPDATE
	ON "Article" FOR each ROW EXECUTE PROCEDURE update_article_search();



-- Registration
CREATE OR REPLACE FUNCTION update_registration_search() RETURNS TRIGGER AS $$
DECLARE
author_firstName text := '';
author_lastName text := '';
internalbeneficiary_firstName text := '';
internalbeneficiary_lastName text := '';
ticket_name text := '';
ticket_description text := '';
author_graduationYear text := '';
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

internalbeneficiary_firstName := (
                SELECT "firstName"
                FROM "User"
                WHERE "User"."id" = NEW."internalBeneficiaryId"
            );

internalbeneficiary_lastName := (
                SELECT "lastName"
                FROM "User"
                WHERE "User"."id" = NEW."internalBeneficiaryId"
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
            

    NEW."search" := setweight(to_tsvector('french', coalesce(author_firstName::text, '')), 'A')||setweight(to_tsvector('french', coalesce(author_lastName::text, '')), 'A')||setweight(to_tsvector('french', coalesce(internalbeneficiary_firstName::text, '')), 'A')||setweight(to_tsvector('french', coalesce(internalbeneficiary_lastName::text, '')), 'A')||setweight(to_tsvector('french', coalesce(ticket_name::text, '')), 'B')||setweight(to_tsvector('french', coalesce(ticket_description::text, '')), 'C')||setweight(to_tsvector('french', coalesce(author_graduationYear::text, '')), 'C');




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

-- Form
CREATE OR REPLACE FUNCTION update_form_search() RETURNS TRIGGER AS $$
DECLARE
    

BEGIN
    


    NEW."search" := setweight(to_tsvector('french', coalesce(NEW."title"::text, '')), 'A') || setweight(to_tsvector('french', coalesce(NEW."description"::text, '')), 'B') || setweight(to_tsvector('french', coalesce(NEW."createdById"::text, '')), 'C') || setweight(to_tsvector('french', coalesce(NEW."groupId"::text, '')), 'C') || setweight(to_tsvector('french', coalesce(NEW."eventId"::text, '')), 'C') || setweight(to_tsvector('french', coalesce(NEW."linkedGoogleSheetId"::text, '')), 'D');

    RETURN NEW;
END $$ LANGUAGE plpgsql;

CREATE TRIGGER update_form_search_trigger before INSERT OR UPDATE ON "Form" FOR EACH ROW EXECUTE PROCEDURE update_form_search();

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

-- Page.search updating
CREATE OR REPLACE FUNCTION update_page_search() RETURNS TRIGGER AS $$
DECLARE
    

BEGIN
    


    NEW."search" := setweight(to_tsvector('french', coalesce(NEW."path"::text, '')), 'A') || setweight(to_tsvector('french', coalesce(NEW."title"::text, '')), 'B') || setweight(to_tsvector('french', coalesce(NEW."id"::text, '')), 'C');

    RETURN NEW;
END $$ LANGUAGE plpgsql;

CREATE TRIGGER update_page_search_trigger before INSERT OR UPDATE ON "Page" FOR EACH ROW EXECUTE PROCEDURE update_page_search();

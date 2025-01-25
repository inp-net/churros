-- AlterTable
ALTER TABLE "Registration" ADD COLUMN     "authorFullName" VARCHAR(255) DEFAULT '',
ADD COLUMN     "internalBeneficiaryFullName" VARCHAR(255) DEFAULT '';

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

    NEW."authorFullName" := author_firstName || ' ' || author_lastName;
    NEW."internalBeneficiaryFullName" := internalbeneficiary_firstName || ' ' || internalbeneficiary_lastName;

    RETURN NEW;
END $$ LANGUAGE plpgsql;

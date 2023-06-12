CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE OR REPLACE FUNCTION NANOID(PREFIX TEXT DEFAULT 
'', SIZE INT DEFAULT 16, ALPHABET TEXT DEFAULT '0123456789abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyz'
) RETURNS TEXT LANGUAGE PLPGSQL VOLATILE AS $$ 
	DECLARE idBuilder text := '';
	counter int := 0;
	bytes bytea;
	alphabetIndex int;
	alphabetArray text[];
	alphabetLength int;
	mask int;
	step int;
	BEGIN alphabetArray := regexp_split_to_array(alphabet, '');
	alphabetLength := array_length(alphabetArray, 1);
	mask := (
	    2 << cast(
	        floor(
	            log(alphabetLength - 1) / log(2)
	        ) as int
	    )
	) - 1;
	step := cast(ceil(1.6 * mask * size / alphabetLength) AS int);
	while true loop bytes := gen_random_bytes(step);
	while counter < step loop alphabetIndex := (get_byte(bytes, counter) & mask) + 1;
	if alphabetIndex <= alphabetLength then idBuilder := idBuilder || alphabetArray [alphabetIndex];
	if length(idBuilder) = size then return PREFIX || idBuilder;
	end if;
	end if;
	counter := counter + 1;
	end loop;
	counter := 0;
	end loop;
	END 
$$; 

-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- CreateEnum
CREATE TYPE "CredentialType" AS ENUM ('Password', 'Token');

-- CreateEnum
CREATE TYPE "GroupType" AS ENUM ('Association', 'Club', 'Group', 'Integration', 'StudentAssociationSection');

-- CreateEnum
CREATE TYPE "EventVisibility" AS ENUM ('Private', 'Unlisted', 'Restricted', 'Public');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('Lydia', 'Card', 'Transfer', 'Check', 'Cash', 'Other');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL DEFAULT nanoid('u:'),
    "uid" VARCHAR(255) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "schoolServer" VARCHAR(255),
    "schoolUid" VARCHAR(255),
    "schoolEmail" VARCHAR(255),
    "email" VARCHAR(255) NOT NULL,
    "firstName" VARCHAR(255) NOT NULL,
    "lastName" VARCHAR(255) NOT NULL,
    "majorId" TEXT NOT NULL,
    "graduationYear" INTEGER NOT NULL,
    "address" VARCHAR(255) NOT NULL DEFAULT '',
    "birthday" TIMESTAMP(3),
    "description" VARCHAR(255) NOT NULL DEFAULT '',
    "nickname" VARCHAR(255) NOT NULL DEFAULT '',
    "phone" VARCHAR(255) NOT NULL DEFAULT '',
    "pictureFile" VARCHAR(255) NOT NULL DEFAULT '',
    "linkCollectionId" TEXT NOT NULL,
    "admin" BOOLEAN NOT NULL DEFAULT false,
    "canEditUsers" BOOLEAN NOT NULL DEFAULT false,
    "canEditGroups" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserCandidate" (
    "id" TEXT NOT NULL DEFAULT nanoid('uc:'),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "email" VARCHAR(255) NOT NULL,
    "token" TEXT NOT NULL,
    "emailValidated" BOOLEAN NOT NULL DEFAULT false,
    "schoolServer" VARCHAR(255),
    "schoolUid" VARCHAR(255),
    "schoolEmail" VARCHAR(255),
    "firstName" VARCHAR(255) NOT NULL DEFAULT '',
    "lastName" VARCHAR(255) NOT NULL DEFAULT '',
    "majorId" TEXT,
    "graduationYear" INTEGER,
    "password" VARCHAR(255) NOT NULL DEFAULT '',
    "address" VARCHAR(255) NOT NULL DEFAULT '',
    "birthday" TIMESTAMP(3),
    "phone" VARCHAR(255) NOT NULL DEFAULT '',

    CONSTRAINT "UserCandidate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LinkCollection" (
    "id" TEXT NOT NULL DEFAULT nanoid('links:'),

    CONSTRAINT "LinkCollection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Link" (
    "id" TEXT NOT NULL DEFAULT nanoid('link:'),
    "collectionId" TEXT NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "value" VARCHAR(255) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Link_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Major" (
    "id" TEXT NOT NULL DEFAULT nanoid('major:'),
    "name" VARCHAR(255) NOT NULL,

    CONSTRAINT "Major_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "School" (
    "id" TEXT NOT NULL DEFAULT nanoid('school:'),
    "name" VARCHAR(255) NOT NULL,
    "color" VARCHAR(7) NOT NULL,

    CONSTRAINT "School_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Credential" (
    "id" TEXT NOT NULL DEFAULT nanoid('c:'),
    "userId" TEXT NOT NULL,
    "type" "CredentialType" NOT NULL,
    "value" VARCHAR(255) NOT NULL,
    "userAgent" VARCHAR(255) NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),

    CONSTRAINT "Credential_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudentAssociation" (
    "id" TEXT NOT NULL DEFAULT nanoid('ae:'),
    "schoolId" TEXT NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "year" INTEGER NOT NULL,
    "linkCollectionId" TEXT NOT NULL,

    CONSTRAINT "StudentAssociation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Group" (
    "id" TEXT NOT NULL DEFAULT nanoid('g:'),
    "uid" VARCHAR(255) NOT NULL,
    "parentId" TEXT,
    "familyId" TEXT,
    "schoolId" TEXT,
    "studentAssociationId" TEXT,
    "pictureFile" VARCHAR(255) NOT NULL DEFAULT '',
    "name" VARCHAR(255) NOT NULL,
    "type" "GroupType" NOT NULL,
    "color" VARCHAR(7) NOT NULL,
    "selfJoinable" BOOLEAN NOT NULL DEFAULT false,
    "address" VARCHAR(255) NOT NULL DEFAULT '',
    "description" VARCHAR(255) NOT NULL DEFAULT '',
    "email" VARCHAR(255) NOT NULL DEFAULT '',
    "longDescription" TEXT NOT NULL DEFAULT '',
    "linkCollectionId" TEXT NOT NULL,

    CONSTRAINT "Group_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GroupMember" (
    "groupId" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "title" VARCHAR(255) NOT NULL DEFAULT '',
    "president" BOOLEAN NOT NULL DEFAULT false,
    "treasurer" BOOLEAN NOT NULL DEFAULT false,
    "vicePresident" BOOLEAN NOT NULL DEFAULT false,
    "secretary" BOOLEAN NOT NULL DEFAULT false,
    "canEditMembers" BOOLEAN NOT NULL DEFAULT false,
    "canEditArticles" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GroupMember_pkey" PRIMARY KEY ("groupId","memberId")
);

-- CreateTable
CREATE TABLE "Article" (
    "id" TEXT NOT NULL DEFAULT nanoid('a:'),
    "authorId" TEXT,
    "groupId" TEXT NOT NULL,
    "uid" VARCHAR(255) NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "body" TEXT NOT NULL,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "homepage" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "publishedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "eventId" TEXT,
    "linkCollectionId" TEXT NOT NULL,

    CONSTRAINT "Article_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Image" (
    "id" TEXT NOT NULL DEFAULT nanoid('img:'),
    "articleId" TEXT NOT NULL,
    "path" VARCHAR(255) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "position" INTEGER NOT NULL,
    "alt" VARCHAR(255) NOT NULL DEFAULT '',

    CONSTRAINT "Image_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Event" (
    "id" TEXT NOT NULL DEFAULT nanoid('e:'),
    "authorId" TEXT,
    "groupId" TEXT NOT NULL,
    "contactMail" TEXT NOT NULL,
    "description" VARCHAR(255) NOT NULL,
    "uid" VARCHAR(255) NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "startsAt" TIMESTAMP(3) NOT NULL,
    "endsAt" TIMESTAMP(3) NOT NULL,
    "location" VARCHAR(255) NOT NULL DEFAULT '',
    "visibility" "EventVisibility" NOT NULL,
    "lydiaAccountId" TEXT,
    "linkCollectionId" TEXT NOT NULL,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventManager" (
    "eventId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "canVerifyRegistrations" BOOLEAN NOT NULL DEFAULT true,
    "canEdit" BOOLEAN NOT NULL DEFAULT false,
    "canEditPermissions" BOOLEAN NOT NULL DEFAULT false
);

-- CreateTable
CREATE TABLE "TicketGroup" (
    "id" TEXT NOT NULL DEFAULT nanoid('tg:'),
    "eventId" TEXT NOT NULL,
    "authorId" TEXT,
    "name" VARCHAR(255) NOT NULL,
    "capacity" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "TicketGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Ticket" (
    "id" TEXT NOT NULL DEFAULT nanoid('t:'),
    "eventId" TEXT NOT NULL,
    "authorId" TEXT,
    "ticketGroupId" TEXT,
    "name" VARCHAR(255) NOT NULL,
    "description" VARCHAR(255) NOT NULL,
    "opensAt" TIMESTAMP(3),
    "closesAt" TIMESTAMP(3),
    "price" DOUBLE PRECISION NOT NULL,
    "capacity" INTEGER NOT NULL DEFAULT 0,
    "allowedPaymentMethods" "PaymentMethod"[] DEFAULT ARRAY[]::"PaymentMethod"[],
    "openToPromotions" INTEGER[] DEFAULT ARRAY[]::INTEGER[],
    "openToAlumni" BOOLEAN DEFAULT false,
    "openToExternal" BOOLEAN DEFAULT false,
    "openToNonAEContributors" BOOLEAN DEFAULT false,
    "godsonLimit" INTEGER NOT NULL DEFAULT 0,
    "onlyManagersCanProvide" BOOLEAN NOT NULL DEFAULT false,
    "linkCollectionId" TEXT NOT NULL,

    CONSTRAINT "Ticket_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Registration" (
    "id" TEXT NOT NULL DEFAULT nanoid('r:'),
    "ticketId" TEXT NOT NULL,
    "beneficiary" TEXT NOT NULL DEFAULT '',
    "authorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "paymentMethod" "PaymentMethod" NOT NULL,
    "paid" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Registration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LogEntry" (
    "id" TEXT NOT NULL DEFAULT nanoid('log:'),
    "happenedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT,
    "area" VARCHAR(255) NOT NULL,
    "message" TEXT NOT NULL,

    CONSTRAINT "LogEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LydiaAccount" (
    "id" TEXT NOT NULL DEFAULT nanoid('lydia:'),
    "groupId" TEXT NOT NULL,
    "name" VARCHAR(255) NOT NULL DEFAULT '',
    "uid" TEXT NOT NULL,
    "privateToken" VARCHAR(255) NOT NULL DEFAULT '',
    "vendorToken" VARCHAR(255) NOT NULL DEFAULT '',

    CONSTRAINT "LydiaAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BarWeek" (
    "id" TEXT NOT NULL DEFAULT nanoid('barweek:'),
    "uid" TEXT NOT NULL,
    "startsAt" TIMESTAMP(3) NOT NULL,
    "endsAt" TIMESTAMP(3) NOT NULL,
    "description" VARCHAR(255) NOT NULL DEFAULT '',

    CONSTRAINT "BarWeek_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_MajorToSchool" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_SchoolToTicket" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_GroupToTicket" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_BarWeekToGroup" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "User_uid_key" ON "User"("uid");

-- CreateIndex
CREATE UNIQUE INDEX "User_schoolEmail_key" ON "User"("schoolEmail");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_schoolServer_schoolUid_key" ON "User"("schoolServer", "schoolUid");

-- CreateIndex
CREATE UNIQUE INDEX "UserCandidate_email_key" ON "UserCandidate"("email");

-- CreateIndex
CREATE UNIQUE INDEX "UserCandidate_token_key" ON "UserCandidate"("token");

-- CreateIndex
CREATE UNIQUE INDEX "UserCandidate_schoolEmail_key" ON "UserCandidate"("schoolEmail");

-- CreateIndex
CREATE UNIQUE INDEX "UserCandidate_schoolServer_schoolUid_key" ON "UserCandidate"("schoolServer", "schoolUid");

-- CreateIndex
CREATE UNIQUE INDEX "StudentAssociation_name_key" ON "StudentAssociation"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Group_uid_key" ON "Group"("uid");

-- CreateIndex
CREATE UNIQUE INDEX "Article_groupId_uid_key" ON "Article"("groupId", "uid");

-- CreateIndex
CREATE UNIQUE INDEX "Image_articleId_position_key" ON "Image"("articleId", "position");

-- CreateIndex
CREATE UNIQUE INDEX "Event_groupId_uid_key" ON "Event"("groupId", "uid");

-- CreateIndex
CREATE UNIQUE INDEX "EventManager_eventId_userId_key" ON "EventManager"("eventId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "Registration_ticketId_beneficiary_key" ON "Registration"("ticketId", "beneficiary");

-- CreateIndex
CREATE UNIQUE INDEX "LydiaAccount_uid_key" ON "LydiaAccount"("uid");

-- CreateIndex
CREATE UNIQUE INDEX "BarWeek_uid_key" ON "BarWeek"("uid");

-- CreateIndex
CREATE UNIQUE INDEX "_MajorToSchool_AB_unique" ON "_MajorToSchool"("A", "B");

-- CreateIndex
CREATE INDEX "_MajorToSchool_B_index" ON "_MajorToSchool"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_SchoolToTicket_AB_unique" ON "_SchoolToTicket"("A", "B");

-- CreateIndex
CREATE INDEX "_SchoolToTicket_B_index" ON "_SchoolToTicket"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_GroupToTicket_AB_unique" ON "_GroupToTicket"("A", "B");

-- CreateIndex
CREATE INDEX "_GroupToTicket_B_index" ON "_GroupToTicket"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_BarWeekToGroup_AB_unique" ON "_BarWeekToGroup"("A", "B");

-- CreateIndex
CREATE INDEX "_BarWeekToGroup_B_index" ON "_BarWeekToGroup"("B");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_majorId_fkey" FOREIGN KEY ("majorId") REFERENCES "Major"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_linkCollectionId_fkey" FOREIGN KEY ("linkCollectionId") REFERENCES "LinkCollection"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserCandidate" ADD CONSTRAINT "UserCandidate_majorId_fkey" FOREIGN KEY ("majorId") REFERENCES "Major"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Link" ADD CONSTRAINT "Link_collectionId_fkey" FOREIGN KEY ("collectionId") REFERENCES "LinkCollection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Credential" ADD CONSTRAINT "Credential_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentAssociation" ADD CONSTRAINT "StudentAssociation_linkCollectionId_fkey" FOREIGN KEY ("linkCollectionId") REFERENCES "LinkCollection"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentAssociation" ADD CONSTRAINT "StudentAssociation_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Group" ADD CONSTRAINT "Group_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Group"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Group" ADD CONSTRAINT "Group_familyId_fkey" FOREIGN KEY ("familyId") REFERENCES "Group"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Group" ADD CONSTRAINT "Group_linkCollectionId_fkey" FOREIGN KEY ("linkCollectionId") REFERENCES "LinkCollection"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Group" ADD CONSTRAINT "Group_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Group" ADD CONSTRAINT "Group_studentAssociationId_fkey" FOREIGN KEY ("studentAssociationId") REFERENCES "StudentAssociation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroupMember" ADD CONSTRAINT "GroupMember_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroupMember" ADD CONSTRAINT "GroupMember_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Article" ADD CONSTRAINT "Article_linkCollectionId_fkey" FOREIGN KEY ("linkCollectionId") REFERENCES "LinkCollection"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Article" ADD CONSTRAINT "Article_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Article" ADD CONSTRAINT "Article_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Article" ADD CONSTRAINT "Article_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Image" ADD CONSTRAINT "Image_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "Article"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_lydiaAccountId_fkey" FOREIGN KEY ("lydiaAccountId") REFERENCES "LydiaAccount"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_linkCollectionId_fkey" FOREIGN KEY ("linkCollectionId") REFERENCES "LinkCollection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventManager" ADD CONSTRAINT "EventManager_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventManager" ADD CONSTRAINT "EventManager_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TicketGroup" ADD CONSTRAINT "TicketGroup_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TicketGroup" ADD CONSTRAINT "TicketGroup_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_linkCollectionId_fkey" FOREIGN KEY ("linkCollectionId") REFERENCES "LinkCollection"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_ticketGroupId_fkey" FOREIGN KEY ("ticketGroupId") REFERENCES "TicketGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Registration" ADD CONSTRAINT "Registration_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "Ticket"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Registration" ADD CONSTRAINT "Registration_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LogEntry" ADD CONSTRAINT "LogEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LydiaAccount" ADD CONSTRAINT "LydiaAccount_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_MajorToSchool" ADD CONSTRAINT "_MajorToSchool_A_fkey" FOREIGN KEY ("A") REFERENCES "Major"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_MajorToSchool" ADD CONSTRAINT "_MajorToSchool_B_fkey" FOREIGN KEY ("B") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_SchoolToTicket" ADD CONSTRAINT "_SchoolToTicket_A_fkey" FOREIGN KEY ("A") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_SchoolToTicket" ADD CONSTRAINT "_SchoolToTicket_B_fkey" FOREIGN KEY ("B") REFERENCES "Ticket"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_GroupToTicket" ADD CONSTRAINT "_GroupToTicket_A_fkey" FOREIGN KEY ("A") REFERENCES "Group"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_GroupToTicket" ADD CONSTRAINT "_GroupToTicket_B_fkey" FOREIGN KEY ("B") REFERENCES "Ticket"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BarWeekToGroup" ADD CONSTRAINT "_BarWeekToGroup_A_fkey" FOREIGN KEY ("A") REFERENCES "BarWeek"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BarWeekToGroup" ADD CONSTRAINT "_BarWeekToGroup_B_fkey" FOREIGN KEY ("B") REFERENCES "Group"("id") ON DELETE CASCADE ON UPDATE CASCADE;

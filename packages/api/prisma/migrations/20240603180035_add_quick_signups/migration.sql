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
ALTER TABLE "Picture" ALTER COLUMN "id" SET DEFAULT nanoid('picfile:');

-- AlterTable
ALTER TABLE "Promotion" ALTER COLUMN "id" SET DEFAULT nanoid('promo:');

-- AlterTable
ALTER TABLE "PromotionCode" ALTER COLUMN "id" SET DEFAULT nanoid('promocode:');

-- AlterTable
ALTER TABLE "Question" ALTER COLUMN "id" SET DEFAULT nanoid('question:');

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
ALTER TABLE "UserCandidate" ADD COLUMN     "quickSignupId" TEXT,
ALTER COLUMN "id" SET DEFAULT nanoid('candidate:');

-- CreateTable
CREATE TABLE "QuickSignup" (
    "id" TEXT NOT NULL DEFAULT nanoid('quicksignup:', 6),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "validUntil" TIMESTAMP(3) NOT NULL,
    "schoolId" TEXT NOT NULL,

    CONSTRAINT "QuickSignup_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "UserCandidate" ADD CONSTRAINT "UserCandidate_quickSignupId_fkey" FOREIGN KEY ("quickSignupId") REFERENCES "QuickSignup"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuickSignup" ADD CONSTRAINT "QuickSignup_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;

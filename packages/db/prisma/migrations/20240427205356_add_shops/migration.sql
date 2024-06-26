/*
  Warnings:

  - A unique constraint covering the columns `[shopPaymentId]` on the table `LydiaTransaction` will be added. If there are existing duplicate values, this will fail.

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
ALTER TABLE "LydiaTransaction" ADD COLUMN     "shopPaymentId" TEXT,
ALTER COLUMN "id" SET DEFAULT nanoid('lydiapayment:');

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
CREATE TABLE "Picture" (
    "id" TEXT NOT NULL DEFAULT nanoid('picfile:'),
    "path" VARCHAR(255) NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Picture_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShopItem" (
    "id" TEXT NOT NULL DEFAULT nanoid('shopitem:'),
    "uid" TEXT NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "price" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "max" INTEGER NOT NULL DEFAULT 0,
    "visibility" "Visibility" NOT NULL DEFAULT 'Private',
    "archived" BOOLEAN NOT NULL DEFAULT false,
    "description" TEXT NOT NULL DEFAULT '',
    "startsAt" TIMESTAMP(3),
    "endsAt" TIMESTAMP(3),
    "lydiaAccountId" TEXT,
    "groupId" TEXT NOT NULL,
    "allowedPaymentMethods" "PaymentMethod"[] DEFAULT ARRAY[]::"PaymentMethod"[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ShopItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShopPayment" (
    "id" TEXT NOT NULL DEFAULT nanoid('shoppayment:'),
    "shopItemId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "paid" BOOLEAN NOT NULL DEFAULT false,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "totalPrice" DOUBLE PRECISION NOT NULL,
    "paymentMethod" "PaymentMethod" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ShopPayment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShopItemOption" (
    "id" TEXT NOT NULL DEFAULT nanoid('shopitemoption:'),
    "name" VARCHAR(255) NOT NULL,
    "shopItemId" TEXT NOT NULL,
    "options" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "required" BOOLEAN NOT NULL DEFAULT false,
    "otherToggle" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "ShopItemOption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShopItemAnswer" (
    "id" TEXT NOT NULL DEFAULT nanoid('shopitemanswer:'),
    "shopPaymentId" TEXT NOT NULL,
    "option" TEXT[] DEFAULT ARRAY[]::TEXT[],

    CONSTRAINT "ShopItemAnswer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_PictureToShopItem" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "ShopItem_groupId_uid_key" ON "ShopItem"("groupId", "uid");

-- CreateIndex
CREATE UNIQUE INDEX "ShopItemAnswer_shopPaymentId_key" ON "ShopItemAnswer"("shopPaymentId");

-- CreateIndex
CREATE UNIQUE INDEX "_PictureToShopItem_AB_unique" ON "_PictureToShopItem"("A", "B");

-- CreateIndex
CREATE INDEX "_PictureToShopItem_B_index" ON "_PictureToShopItem"("B");

-- CreateIndex
CREATE UNIQUE INDEX "LydiaTransaction_shopPaymentId_key" ON "LydiaTransaction"("shopPaymentId");

-- AddForeignKey
ALTER TABLE "LydiaTransaction" ADD CONSTRAINT "LydiaTransaction_shopPaymentId_fkey" FOREIGN KEY ("shopPaymentId") REFERENCES "ShopPayment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShopItem" ADD CONSTRAINT "ShopItem_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShopItem" ADD CONSTRAINT "ShopItem_lydiaAccountId_fkey" FOREIGN KEY ("lydiaAccountId") REFERENCES "LydiaAccount"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShopPayment" ADD CONSTRAINT "ShopPayment_shopItemId_fkey" FOREIGN KEY ("shopItemId") REFERENCES "ShopItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShopPayment" ADD CONSTRAINT "ShopPayment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShopItemOption" ADD CONSTRAINT "ShopItemOption_shopItemId_fkey" FOREIGN KEY ("shopItemId") REFERENCES "ShopItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShopItemAnswer" ADD CONSTRAINT "ShopItemAnswer_shopPaymentId_fkey" FOREIGN KEY ("shopPaymentId") REFERENCES "ShopPayment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PictureToShopItem" ADD CONSTRAINT "_PictureToShopItem_A_fkey" FOREIGN KEY ("A") REFERENCES "Picture"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PictureToShopItem" ADD CONSTRAINT "_PictureToShopItem_B_fkey" FOREIGN KEY ("B") REFERENCES "ShopItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- DropForeignKey
ALTER TABLE "Answer" DROP CONSTRAINT "Answer_createdById_fkey";

-- DropForeignKey
ALTER TABLE "Document" DROP CONSTRAINT "Document_uploaderId_fkey";

-- DropForeignKey
ALTER TABLE "GodparentRequest" DROP CONSTRAINT "GodparentRequest_godchildId_fkey";

-- DropForeignKey
ALTER TABLE "GodparentRequest" DROP CONSTRAINT "GodparentRequest_godparentId_fkey";

-- DropForeignKey
ALTER TABLE "Notification" DROP CONSTRAINT "Notification_userId_fkey";

-- DropForeignKey
ALTER TABLE "PromotionCode" DROP CONSTRAINT "PromotionCode_claimedById_fkey";

-- DropForeignKey
ALTER TABLE "PromotionCode" DROP CONSTRAINT "PromotionCode_promotionId_fkey";

-- DropForeignKey
ALTER TABLE "Registration" DROP CONSTRAINT "Registration_authorId_fkey";

-- AlterTable
ALTER TABLE "EventManagerInvite" ALTER COLUMN "id" SET DEFAULT nanoid('eminvite:');

-- AddForeignKey
ALTER TABLE "GodparentRequest" ADD CONSTRAINT "GodparentRequest_godchildId_fkey" FOREIGN KEY ("godchildId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GodparentRequest" ADD CONSTRAINT "GodparentRequest_godparentId_fkey" FOREIGN KEY ("godparentId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Registration" ADD CONSTRAINT "Registration_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_uploaderId_fkey" FOREIGN KEY ("uploaderId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PromotionCode" ADD CONSTRAINT "PromotionCode_claimedById_fkey" FOREIGN KEY ("claimedById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PromotionCode" ADD CONSTRAINT "PromotionCode_promotionId_fkey" FOREIGN KEY ("promotionId") REFERENCES "Promotion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Answer" ADD CONSTRAINT "Answer_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

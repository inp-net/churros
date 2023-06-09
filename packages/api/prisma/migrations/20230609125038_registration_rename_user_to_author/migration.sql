/*
  Warnings:

  - You are about to drop the column `price` on the `Registration` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Registration` table. All the data in the column will be lost.
  - Added the required column `authorId` to the `Registration` table without a default value. This is not possible if the table is not empty.
  - Made the column `paymentMethod` on table `Registration` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterEnum
ALTER TYPE "PaymentMethod" ADD VALUE 'Other';

-- DropForeignKey
ALTER TABLE "Registration" DROP CONSTRAINT "Registration_userId_fkey";

-- AlterTable
ALTER TABLE "Registration" DROP COLUMN "price",
DROP COLUMN "userId",
ADD COLUMN     "authorId" INTEGER NOT NULL,
ADD COLUMN     "paid" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "paymentMethod" SET NOT NULL;

-- AlterTable
ALTER TABLE "Ticket" ADD COLUMN     "allowedPaymentMethods" "PaymentMethod"[] DEFAULT ARRAY[]::"PaymentMethod"[];

-- AddForeignKey
ALTER TABLE "Registration" ADD CONSTRAINT "Registration_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

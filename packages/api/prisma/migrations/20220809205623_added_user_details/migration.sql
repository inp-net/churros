/*
  Warnings:

  - A unique constraint covering the columns `[email]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `email` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `graduationYear` to the `User` table without a default value. This is not possible if the table is not empty.
  - Made the column `pictureFile` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "address" VARCHAR(255) NOT NULL DEFAULT '',
ADD COLUMN     "biography" VARCHAR(255) NOT NULL DEFAULT '',
ADD COLUMN     "birthday" TIMESTAMP(3),
ADD COLUMN     "email" VARCHAR(255) NOT NULL,
ADD COLUMN     "graduationYear" INTEGER NOT NULL,
ADD COLUMN     "links" VARCHAR(255)[],
ADD COLUMN     "phone" VARCHAR(255) NOT NULL DEFAULT '',
ALTER COLUMN "pictureFile" SET NOT NULL,
ALTER COLUMN "pictureFile" SET DEFAULT '';

-- CreateTable
CREATE TABLE "ContactChannel" (
    "id" SERIAL NOT NULL,

    CONSTRAINT "ContactChannel_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

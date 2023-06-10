/*
  Warnings:

  - You are about to drop the column `description` on the `LydiaAccount` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "LydiaAccount" DROP COLUMN "description",
ADD COLUMN     "name" VARCHAR(255) NOT NULL DEFAULT '';

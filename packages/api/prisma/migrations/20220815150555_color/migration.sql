/*
  Warnings:

  - Added the required column `color` to the `Group` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Group" ADD COLUMN     "color" VARCHAR(7) NOT NULL;

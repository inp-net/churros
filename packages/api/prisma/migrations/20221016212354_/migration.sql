/*
  Warnings:

  - Made the column `familyId` on table `Group` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
CREATE SEQUENCE "group_familyid_seq";
ALTER TABLE "Group" ALTER COLUMN "familyId" SET NOT NULL,
ALTER COLUMN "familyId" SET DEFAULT nextval('group_familyid_seq');
ALTER SEQUENCE "group_familyid_seq" OWNED BY "Group"."familyId";

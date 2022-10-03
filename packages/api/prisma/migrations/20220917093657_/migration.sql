/*
  Warnings:

  - The values [StudentOrganizationSection] on the enum `GroupType` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `studentOrganizationId` on the `Group` table. All the data in the column will be lost.
  - You are about to drop the `StudentOrganization` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "GroupType_new" AS ENUM ('Association', 'Club', 'Group', 'Integration', 'StudentAssociationSection');
ALTER TABLE "Group" ALTER COLUMN "type" TYPE "GroupType_new" USING ("type"::text::"GroupType_new");
ALTER TYPE "GroupType" RENAME TO "GroupType_old";
ALTER TYPE "GroupType_new" RENAME TO "GroupType";
DROP TYPE "GroupType_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "Group" DROP CONSTRAINT "Group_studentOrganizationId_fkey";

-- DropForeignKey
ALTER TABLE "StudentOrganization" DROP CONSTRAINT "StudentOrganization_schoolId_fkey";

-- AlterTable
ALTER TABLE "Group" DROP COLUMN "studentOrganizationId",
ADD COLUMN     "studentAssociationId" INTEGER;

-- DropTable
DROP TABLE "StudentOrganization";

-- CreateTable
CREATE TABLE "StudentAssociation" (
    "id" SERIAL NOT NULL,
    "schoolId" INTEGER NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "year" INTEGER NOT NULL,

    CONSTRAINT "StudentAssociation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "StudentAssociation_name_key" ON "StudentAssociation"("name");

-- AddForeignKey
ALTER TABLE "StudentAssociation" ADD CONSTRAINT "StudentAssociation_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Group" ADD CONSTRAINT "Group_studentAssociationId_fkey" FOREIGN KEY ("studentAssociationId") REFERENCES "StudentAssociation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

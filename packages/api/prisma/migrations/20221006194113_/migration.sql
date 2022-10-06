-- AlterTable
ALTER TABLE "Group" ADD COLUMN     "familyId" INTEGER,
ADD COLUMN     "parentId" INTEGER;

-- AddForeignKey
ALTER TABLE "Group" ADD CONSTRAINT "Group_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Group"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

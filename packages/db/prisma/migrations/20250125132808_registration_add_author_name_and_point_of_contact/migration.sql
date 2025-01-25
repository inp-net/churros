-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "enforcePointOfContact" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Registration" ADD COLUMN     "authorName" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "pointOfContactId" TEXT;

-- AddForeignKey
ALTER TABLE "Registration" ADD CONSTRAINT "Registration_pointOfContactId_fkey" FOREIGN KEY ("pointOfContactId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

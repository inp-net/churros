-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "showCapacity" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "EventManagerInvite" ALTER COLUMN "id" SET DEFAULT nanoid('eminvite:');

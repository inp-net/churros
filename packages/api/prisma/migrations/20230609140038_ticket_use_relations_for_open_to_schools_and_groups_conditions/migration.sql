/*
  Warnings:

  - You are about to drop the column `openToGroups` on the `Ticket` table. All the data in the column will be lost.
  - You are about to drop the column `openToSchool` on the `Ticket` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Ticket" DROP COLUMN "openToGroups",
DROP COLUMN "openToSchool";

-- CreateTable
CREATE TABLE "_SchoolToTicket" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_GroupToTicket" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_SchoolToTicket_AB_unique" ON "_SchoolToTicket"("A", "B");

-- CreateIndex
CREATE INDEX "_SchoolToTicket_B_index" ON "_SchoolToTicket"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_GroupToTicket_AB_unique" ON "_GroupToTicket"("A", "B");

-- CreateIndex
CREATE INDEX "_GroupToTicket_B_index" ON "_GroupToTicket"("B");

-- AddForeignKey
ALTER TABLE "_SchoolToTicket" ADD CONSTRAINT "_SchoolToTicket_A_fkey" FOREIGN KEY ("A") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_SchoolToTicket" ADD CONSTRAINT "_SchoolToTicket_B_fkey" FOREIGN KEY ("B") REFERENCES "Ticket"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_GroupToTicket" ADD CONSTRAINT "_GroupToTicket_A_fkey" FOREIGN KEY ("A") REFERENCES "Group"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_GroupToTicket" ADD CONSTRAINT "_GroupToTicket_B_fkey" FOREIGN KEY ("B") REFERENCES "Ticket"("id") ON DELETE CASCADE ON UPDATE CASCADE;

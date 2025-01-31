/*
  Warnings:

  - You are about to drop the `_shares` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_shares" DROP CONSTRAINT "_shares_A_fkey";

-- DropForeignKey
ALTER TABLE "_shares" DROP CONSTRAINT "_shares_B_fkey";

-- DropTable
DROP TABLE "_shares";

-- CreateTable
CREATE TABLE "_articleShares" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_articleShares_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_eventShares" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_eventShares_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_articleShares_B_index" ON "_articleShares"("B");

-- CreateIndex
CREATE INDEX "_eventShares_B_index" ON "_eventShares"("B");

-- AddForeignKey
ALTER TABLE "_articleShares" ADD CONSTRAINT "_articleShares_A_fkey" FOREIGN KEY ("A") REFERENCES "Article"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_articleShares" ADD CONSTRAINT "_articleShares_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_eventShares" ADD CONSTRAINT "_eventShares_A_fkey" FOREIGN KEY ("A") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_eventShares" ADD CONSTRAINT "_eventShares_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

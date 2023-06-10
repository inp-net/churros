-- CreateTable
CREATE TABLE "BarWeek" (
    "id" SERIAL NOT NULL,
    "startsAt" TIMESTAMP(3) NOT NULL,
    "endsAt" TIMESTAMP(3) NOT NULL,
    "description" VARCHAR(255) NOT NULL DEFAULT '',

    CONSTRAINT "BarWeek_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_BarWeekToGroup" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_BarWeekToGroup_AB_unique" ON "_BarWeekToGroup"("A", "B");

-- CreateIndex
CREATE INDEX "_BarWeekToGroup_B_index" ON "_BarWeekToGroup"("B");

-- AddForeignKey
ALTER TABLE "_BarWeekToGroup" ADD CONSTRAINT "_BarWeekToGroup_A_fkey" FOREIGN KEY ("A") REFERENCES "BarWeek"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BarWeekToGroup" ADD CONSTRAINT "_BarWeekToGroup_B_fkey" FOREIGN KEY ("B") REFERENCES "Group"("id") ON DELETE CASCADE ON UPDATE CASCADE;

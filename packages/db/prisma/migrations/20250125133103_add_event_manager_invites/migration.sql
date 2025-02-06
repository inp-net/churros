-- CreateTable
CREATE TABLE "EventManagerInvite" (
    "id" TEXT NOT NULL DEFAULT nanoid('eminvite:'),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "capacity" INTEGER,
    "code" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3),
    "eventId" TEXT NOT NULL,
    "canVerifyRegistrations" BOOLEAN NOT NULL DEFAULT true,
    "canEdit" BOOLEAN NOT NULL DEFAULT false,
    "canEditPermissions" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "EventManagerInvite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_eventManagerInviteUses" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "EventManagerInvite_code_key" ON "EventManagerInvite"("code");

-- CreateIndex
CREATE UNIQUE INDEX "_eventManagerInviteUses_AB_unique" ON "_eventManagerInviteUses"("A", "B");

-- CreateIndex
CREATE INDEX "_eventManagerInviteUses_B_index" ON "_eventManagerInviteUses"("B");

-- AddForeignKey
ALTER TABLE "EventManagerInvite" ADD CONSTRAINT "EventManagerInvite_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_eventManagerInviteUses" ADD CONSTRAINT "_eventManagerInviteUses_A_fkey" FOREIGN KEY ("A") REFERENCES "EventManagerInvite"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_eventManagerInviteUses" ADD CONSTRAINT "_eventManagerInviteUses_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

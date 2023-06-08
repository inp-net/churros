-- AddForeignKey
ALTER TABLE "LydiaAccount" ADD CONSTRAINT "LydiaAccount_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

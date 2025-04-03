-- CreateIndex
CREATE INDEX "Article_eventId_idx" ON "Article"("eventId");

-- CreateIndex
CREATE INDEX "Article_visibility_publishedAt_idx" ON "Article"("visibility", "publishedAt" DESC);

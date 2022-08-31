-- CreateTable
CREATE TABLE "UserCandidate" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "email" VARCHAR(255) NOT NULL,
    "token" TEXT NOT NULL,
    "emailValidated" BOOLEAN NOT NULL DEFAULT false,
    "firstName" VARCHAR(255),
    "lastName" VARCHAR(255),
    "majorId" INTEGER,
    "graduationYear" INTEGER,
    "address" VARCHAR(255) NOT NULL DEFAULT '',
    "biography" VARCHAR(255) NOT NULL DEFAULT '',
    "birthday" TIMESTAMP(3),
    "nickname" VARCHAR(255) NOT NULL DEFAULT '',
    "phone" VARCHAR(255) NOT NULL DEFAULT '',
    "pictureFile" VARCHAR(255) NOT NULL DEFAULT '',

    CONSTRAINT "UserCandidate_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserCandidate_email_key" ON "UserCandidate"("email");

-- CreateIndex
CREATE UNIQUE INDEX "UserCandidate_token_key" ON "UserCandidate"("token");

-- AddForeignKey
ALTER TABLE "UserCandidate" ADD CONSTRAINT "UserCandidate_majorId_fkey" FOREIGN KEY ("majorId") REFERENCES "Major"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

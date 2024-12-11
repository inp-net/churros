-- DropIndex
DROP INDEX "GodparentRequest_id_key"; -- y'avait @id @unique, alors que @id implique déjà @unique

-- AlterTable
ALTER TABLE "School" ALTER COLUMN "aliasMailDomains" SET DEFAULT ARRAY[]::TEXT[], -- le @default([]) sur un varchar cause systématiquement une migration
ALTER COLUMN "aliasMailDomains" SET DATA TYPE TEXT[]; 

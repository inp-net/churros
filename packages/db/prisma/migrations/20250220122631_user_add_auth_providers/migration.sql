-- CreateEnum
CREATE TYPE "AuthProvider" AS ENUM ('OAuth', 'Local', 'LDAP');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "authProviders" "AuthProvider"[] DEFAULT ARRAY[]::"AuthProvider"[];

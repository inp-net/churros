/*
  Warnings:

  - The values [Comments] on the enum `NotificationChannel` will be removed. If these variants are still used in the database, this will fail.

*/

-- Handle the warning: remove the Comments channel element from the arrays

UPDATE "User" 
SET "enabledNotificationChannels" = array_remove("enabledNotificationChannels", 'Comments'::"NotificationChannel")
WHERE "enabledNotificationChannels" @> ARRAY['Comments'::"NotificationChannel"];

DELETE FROM "Notification"
WHERE "channel" = 'Comments'::"NotificationChannel";

-- AlterEnum
BEGIN;
CREATE TYPE "NotificationChannel_new" AS ENUM ('Articles', 'Shotguns', 'Permissions', 'GroupBoard', 'GodparentRequests', 'Mandatory', 'Other');
ALTER TABLE "Notification" ALTER COLUMN "channel" DROP DEFAULT;
ALTER TABLE "User" ALTER COLUMN "enabledNotificationChannels" DROP DEFAULT;
ALTER TABLE "User" ALTER COLUMN "enabledNotificationChannels" TYPE "NotificationChannel_new"[] USING ("enabledNotificationChannels"::text::"NotificationChannel_new"[]);
ALTER TABLE "Notification" ALTER COLUMN "channel" TYPE "NotificationChannel_new" USING ("channel"::text::"NotificationChannel_new");
ALTER TYPE "NotificationChannel" RENAME TO "NotificationChannel_old";
ALTER TYPE "NotificationChannel_new" RENAME TO "NotificationChannel";
DROP TYPE "NotificationChannel_old";
ALTER TABLE "Notification" ALTER COLUMN "channel" SET DEFAULT 'Other';
ALTER TABLE "User" ALTER COLUMN "enabledNotificationChannels" SET DEFAULT ARRAY['Articles', 'Shotguns', 'Permissions', 'GroupBoard', 'GodparentRequests', 'Other']::"NotificationChannel"[];
COMMIT;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "enabledNotificationChannels" SET DEFAULT ARRAY['Articles', 'Shotguns', 'Permissions', 'GroupBoard', 'GodparentRequests', 'Other']::"NotificationChannel"[];

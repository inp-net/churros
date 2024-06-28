import type { NotificationChannel as NotificationChannelPrisma } from '@churros/db/prisma';

export function serverCanSendNotificationToUser(
  subscriptionOwner: { enabledNotificationChannels: NotificationChannelPrisma[] },
  channel: NotificationChannelPrisma,
): boolean {
  return (
    subscriptionOwner.enabledNotificationChannels.includes(channel) ||
    subscriptionOwner.enabledNotificationChannels.length === 0
  );
}

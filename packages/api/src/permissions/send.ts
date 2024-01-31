import type { NotificationChannel as NotificationChannelPrisma } from '@prisma/client';

export function canSendNotificationToUser(
  subscriptionOwner: { enabledNotificationChannels: NotificationChannelPrisma[] },
  channel: NotificationChannelPrisma,
): boolean {
  return (
    subscriptionOwner.enabledNotificationChannels.includes(channel) ||
    subscriptionOwner.enabledNotificationChannels.length === 0
  );
}

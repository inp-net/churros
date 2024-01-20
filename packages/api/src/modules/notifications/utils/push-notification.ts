import type { NotificationChannel } from '@prisma/client';

export type PushNotification = {
  title: string;
  actions?: Array<{ action: string; title: string; icon?: string }>;
  badge?: string;
  icon?: string;
  image?: string;
  body: string;
  renotify?: boolean;
  requireInteraction?: boolean;
  silent?: boolean;
  tag?: string;
  timestamp?: number;
  vibrate?: number[];
  data: {
    group: string | undefined;
    channel: NotificationChannel;
    subscriptionName?: string;
    goto: string;
  };
};

import { builder } from '#lib';

import * as PrismaTypes from '@centraverse/db/prisma';

// TODO rename to NotificationChannelType
export const NotificationChannel = builder.enumType(PrismaTypes.NotificationChannel, {
  name: 'NotificationChannel',
});

import { builder } from '#lib';

import * as PrismaTypes from '@prisma/client';

// TODO rename to NotificationChannelType
export const NotificationChannel = builder.enumType(PrismaTypes.NotificationChannel, {
  name: 'NotificationChannel',
});

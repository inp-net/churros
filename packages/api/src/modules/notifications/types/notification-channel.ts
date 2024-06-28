import { builder } from '#lib';

import * as PrismaTypes from '@churros/db/prisma';

// TODO rename to NotificationChannelType
export const NotificationChannel = builder.enumType(PrismaTypes.NotificationChannel, {
  name: 'NotificationChannel',
});

import { builder } from '#lib';
import {} from '#modules/global';
import * as PrismaTypes from '@prisma/client';
import {} from '../index.js';

// TODO rename to NotificationChannelType
export const NotificationChannel = builder.enumType(PrismaTypes.NotificationChannel, {
  name: 'NotificationChannel',
});

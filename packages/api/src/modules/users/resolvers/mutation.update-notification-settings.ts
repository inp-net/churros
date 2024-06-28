import { builder, objectValuesFlat, prisma } from '#lib';

import { NotificationChannel } from '@churros/db/prisma';
import { userIsAdminOf } from '../../../permissions/index.js';

builder.mutationField('updateNotificationSettings', (t) =>
  t.field({
    type: [NotificationChannel],
    args: {
      uid: t.arg.string(),
      enabledChannels: t.arg({ type: [NotificationChannel] }),
    },
    async authScopes(_, { uid }, { user }) {
      const studentAssociationIds = objectValuesFlat(
        await prisma.user.findUniqueOrThrow({
          where: { id: user?.id },
          select: {
            major: {
              select: { schools: { select: { studentAssociations: { select: { id: true } } } } },
            },
          },
        }),
      );

      return Boolean(userIsAdminOf(user, studentAssociationIds) || uid === user?.uid);
    },
    async resolve(_query, { uid, enabledChannels }) {
      const { enabledNotificationChannels } = await prisma.user.update({
        where: { uid },
        data: {
          enabledNotificationChannels: { set: enabledChannels },
        },
      });
      return enabledNotificationChannels;
    },
  }),
);

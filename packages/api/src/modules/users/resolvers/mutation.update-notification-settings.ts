import { builder, prisma } from '#lib';

import { NotificationChannel } from '@prisma/client';

builder.mutationField('updateNotificationSettings', (t) =>
  t.field({
    type: [NotificationChannel],
    args: {
      uid: t.arg.string(),
      enabledChannels: t.arg({ type: [NotificationChannel] }),
    },
    authScopes(_, { uid }, { user }) {
      return Boolean(user?.canEditUsers || uid === user?.uid);
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

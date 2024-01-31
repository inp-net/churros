import { builder, prisma } from '#lib';

import { NotificationType } from '../index.js';

builder.queryField('notification', (t) =>
  t.prismaField({
    type: NotificationType,
    args: {
      id: t.arg.id(),
    },
    authScopes: { loggedIn: true },
    async resolve(query, _, { id }, { user }) {
      return prisma.notification.findFirstOrThrow({
        ...query,
        where: { id, subscription: { ownerId: user?.id } },
      });
    },
  }),
);

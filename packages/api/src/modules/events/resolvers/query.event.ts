import { builder, prisma } from '#lib';

import { userCanAccessEvent } from '#permissions';
import { EventType } from '../index.js';

builder.queryField('event', (t) =>
  t.prismaField({
    type: EventType,
    args: {
      uid: t.arg.string(),
      groupUid: t.arg.string(),
    },
    smartSubscription: true,
    async authScopes(_, { uid, groupUid }, { user }) {
      const event = await prisma.event.findFirstOrThrow({
        where: { uid, group: { uid: groupUid } },
        include: {
          coOrganizers: { include: { studentAssociation: { include: { school: true } } } },
          group: { include: { studentAssociation: { include: { school: true } } } },
          managers: { include: { user: true } },
          tickets: true,
        },
      });
      return userCanAccessEvent(event, user);
    },
    resolve: async (query, _, { uid, groupUid }) =>
      prisma.event.findFirstOrThrow({ ...query, where: { uid, group: { uid: groupUid } } }),
  }),
);

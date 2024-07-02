import { builder, prisma } from '#lib';
import { UIDScalar } from '#modules/global';

import { userCanAccessEvent } from '#permissions';
import { EventType } from '../index.js';

builder.queryField('event', (t) =>
  t.prismaField({
    type: EventType,
    args: {
      slug: t.arg.string(),
      group: t.arg({ type: UIDScalar }),
    },
    smartSubscription: true,
    async authScopes(_, { slug, group: groupUid }, { user }) {
      const event = await prisma.event.findFirstOrThrow({
        where: { slug, group: { uid: groupUid } },
        include: {
          coOrganizers: { include: { studentAssociation: { include: { school: true } } } },
          group: { include: { studentAssociation: { include: { school: true } } } },
          managers: { include: { user: true } },
          tickets: true,
        },
      });
      return userCanAccessEvent(event, user);
    },
    resolve: async (query, _, { slug, group }) =>
      prisma.event.findFirstOrThrow({ ...query, where: { slug, group: { uid: group } } }),
  }),
);

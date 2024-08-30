import { builder, ensureGlobalId, prisma } from '#lib';
import { LocalID } from '#modules/global';
import { canAccessEvent, EventType } from '../index.js';

builder.queryField('event', (t) =>
  t.prismaField({
    type: EventType,
    args: {
      id: t.arg({ type: LocalID }),
    },
    smartSubscription: true,
    async authScopes(_, { id }, { user }) {
      const event = await prisma.event.findUniqueOrThrow({
        where: { id: ensureGlobalId(id, 'Event') },
        include: canAccessEvent.prismaIncludes,
      });
      return canAccessEvent(user, event);
    },
    async resolve(query, _, { id }) {
      return prisma.event.findUniqueOrThrow({
        ...query,
        where: { id: ensureGlobalId(id, 'Event') },
      });
    },
  }),
);

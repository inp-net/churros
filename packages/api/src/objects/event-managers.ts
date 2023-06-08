import { builder } from '../builder';
import { prisma } from '../prisma';

export const EventManagerType = builder.prismaNode('EventManager', {
  id: { field: 'id' },
  fields: (t) => ({
    eventId: t.exposeID('eventId'),
    userId: t.exposeID('userId'),
    canVerifyRegistrations: t.exposeBoolean('canVerifyRegistrations'),
    canEdit: t.exposeBoolean('canEdit'),
    canEditPermissions: t.exposeBoolean('canEditPermissions'),
    event: t.relation('event'),
    user: t.relation('user'),
  }),
});

builder.queryField('eventManager', (t) =>
  t.prismaField({
    type: EventManagerType,
    args: {
      id: t.arg.id(),
    },
    resolve: async (query, _, { id }) =>
      prisma.eventManager.findFirstOrThrow({ ...query, where: { id } }),
  })
);

builder.queryField('managersOfEvent', (t) =>
  t.prismaConnection({
    type: EventManagerType,
    cursor: 'id',
    args: {
      slug: t.arg.string(),
    },
    async resolve(query, _, { slug }) {
      return prisma.eventManager.findMany({
        ...query,
        where: { event: { slug } },
      });
    },
  })
);

import { builder } from '../builder';

export const TicketGroupType = builder.prismaNode('TicketGroup', {
  id: { field: 'id' },
  fields: (t) => ({
    name: t.exposeString('name'),
    eventId: t.exposeID('eventId'),
    event: t.relation('event'),
    authorId: t.exposeID('authorId'),
    author: t.relation('author'),
    capacity: t.exposeInt('capacity'),
    tickets: t.relation('tickets'),
  }),
});

builder.queryField('ticketGroup', (t) =>
  t.prismaField({
    type: TicketGroupType,
    args: {
      id: t.arg.id(),
    },
    resolve: async (query, _, { id }) =>
      prisma.ticketGroup.findFirstOrThrow({ ...query, where: { id } }),
  })
);

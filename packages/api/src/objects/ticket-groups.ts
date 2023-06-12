import { builder } from '../builder.js';
import { prisma } from '../prisma.js';

export const TicketGroupType = builder.prismaNode('TicketGroup', {
  id: { field: 'id' },
  fields: (t) => ({
    name: t.exposeString('name'),
    eventId: t.exposeID('eventId'),
    event: t.relation('event'),
    authorId: t.exposeID('authorId', { nullable: true }),
    author: t.relation('author', { nullable: true }),
    capacity: t.exposeInt('capacity'),
    tickets: t.relation('tickets'),
  }),
});

export const TicketGroupInput = builder.inputType('TicketGroupInput', {
  fields: (t) => ({
    name: t.string(),
    capacity: t.int({ validate: { min: 0 } }),
    tickets: t.stringList(),
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

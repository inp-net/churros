import { builder, prisma } from '#lib';

import { TicketGroupType } from '../index.js';
// TODO rename to event.ticket-group

builder.queryField('ticketGroup', (t) =>
  t.prismaField({
    type: TicketGroupType,
    args: {
      id: t.arg.id(),
    },
    resolve: async (query, _, { id }) =>
      prisma.ticketGroup.findFirstOrThrow({ ...query, where: { id } }),
  }),
);

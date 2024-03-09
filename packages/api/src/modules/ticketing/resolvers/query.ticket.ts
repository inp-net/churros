import { builder, prisma } from '#lib';

import { userCanAccessEvent } from '#permissions';
import { TicketType } from '../index.js';

builder.queryField('ticket', (t) =>
  t.prismaField({
    type: TicketType,
    args: {
      id: t.arg.id(),
    },
    async authScopes(_, { id }, { user }) {
      const ticket = await prisma.ticket.findUnique({
        where: { id },
        include: {
          event: {
            include: {
              coOrganizers: { include: { studentAssociation: { include: { school: true } } } },
              group: { include: { studentAssociation: { include: { school: true } } } },
              tickets: true,
              managers: {
                include: {
                  user: true,
                },
              },
            },
          },
        },
      });
      if (!ticket) return false;
      return userCanAccessEvent(ticket.event, user);
    },
    resolve: async (query, _, { id }) =>
      prisma.ticket.findFirstOrThrow({ ...query, where: { id } }),
  }),
);

import { builder, prisma } from '#lib';

import { userCanAccessEvent } from '#permissions';
import { TicketType } from '../index.js';
// TODO merge into query.ticket

builder.queryField('ticketByUid', (t) =>
  t.prismaField({
    type: TicketType,
    args: {
      uid: t.arg.string(),
      eventUid: t.arg.string(),
      groupUid: t.arg.string(),
    },
    async authScopes(_, { uid, eventUid, groupUid }, { user }) {
      const ticket = await prisma.ticket.findFirstOrThrow({
        where: { uid, event: { uid: eventUid, group: { uid: groupUid } } },
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
      return userCanAccessEvent(ticket.event, user);
    },
    resolve: async (query, _, { uid, eventUid }) =>
      prisma.ticket.findFirstOrThrow({ ...query, where: { uid, event: { uid: eventUid } } }),
  }),
);

import { builder, prisma } from '#lib';
import { EventType } from '#modules/events';
import { userCanAccessEvent } from '#permissions';
import { TicketType } from '../index.js';

builder.prismaObjectField(EventType, 'ticket', (t) =>
  t.prismaField({
    type: TicketType,
    args: {
      id: t.arg.id({ required: false }),
      slug: t.arg.string({ required: false }),
    },
    validate: [
      [({ id, slug }) => Boolean(id || slug), { message: 'Il faut préciser un ID ou un slug' }],
    ],
    async authScopes({ id: eventId }, { id, slug }, { user }) {
      const ticket = await prisma.ticket.findUnique({
        where: id
          ? { id }
          : {
              eventId_slug: {
                eventId,
                slug: slug!, // guaranteed by validate
              },
            },
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
    resolve: async (query, { id: eventId }, { id, slug }) =>
      prisma.ticket.findUniqueOrThrow({
        ...query,
        where: id
          ? { id }
          : {
              eventId_slug: {
                eventId,
                slug: slug!, // guaranteed by valiate
              },
            },
      }),
  }),
);

import { TicketType } from '../index.js';
import { builder, prisma } from '#lib';

builder.prismaObjectField('Event', 'ticket', (t) =>
  t.prismaField({
    description: "Un billet de l'évènement",
    type: TicketType,
    args: {
      uid: t.arg.string({ description: 'Son uid' }),
    },
    resolve: async (query, { id: eventId }, { uid }) =>
      prisma.ticket.findFirstOrThrow({
        ...query,
        where: { uid, eventId },
      }),
  }),
);

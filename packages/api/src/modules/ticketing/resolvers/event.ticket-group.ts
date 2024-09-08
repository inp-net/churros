import { builder, ensureGlobalId, prisma } from '#lib';
import { EventType } from '#modules/events';
import { LocalID } from '#modules/global';
import { TicketGroupType } from '#modules/ticketing/types';

builder.prismaObjectField(EventType, 'ticketGroup', (t) =>
  t.prismaField({
    type: TicketGroupType,
    nullable: true,
    description: "Récupérer un groupe de billets de l'évènement",
    args: {
      id: t.arg({
        type: LocalID,
      }),
    },
    async resolve(query, { id: eventId }, { id }) {
      return prisma.ticketGroup.findFirst({
        ...query,
        where: {
          eventId,
          id: ensureGlobalId(id, 'TicketGroup'),
        },
      });
    },
  }),
);

import { builder, prisma } from '#lib';

import { userCanManageEvent } from '#permissions';
import { TicketGroupType } from '../index.js';

builder.mutationField('upsertTicketGroup', (t) =>
  t.prismaField({
    type: TicketGroupType,
    args: {
      id: t.arg.id({ required: false }),
      name: t.arg.string(),
      capacity: t.arg.int({ validate: { min: 0 } }),
      eventId: t.arg.id(),
      tickets: t.arg({ type: ['ID'] }),
    },
    async authScopes(_, { tickets: ticketIDs, id, eventId }, { user }) {
      // Make sure that the tickets added to that group all exists and are part of events managed by the user
      const ticketGroup = await prisma.ticketGroup.findFirst({
        where: { id: id ?? '' },
        include: {
          event: {
            include: {
              managers: {
                include: {
                  user: true,
                },
              },
            },
          },
        },
      });
      const event = await prisma.event.findUnique({
        where: { id: eventId },
        include: { managers: { include: { user: true } } },
      });
      const tickets = await prisma.ticket.findMany({
        where: { id: { in: ticketIDs } },
        include: { event: { include: { managers: { include: { user: true } } } } },
      });
      const events = [ticketGroup, ...tickets]
        .map((tg) => tg?.event)
        // remove empties
        .filter(Boolean)
        // remove duplicates (sort by ID and remove consecutive duplicates)
        .sort((a, b) => a!.id.localeCompare(b!.id))
        .filter((e, i, arr) => !i || e!.id !== arr[i - 1]?.id);

      if (!events.every(Boolean)) return false;

      return (
        events.every((event) =>
          userCanManageEvent(event! /* legal since we removed potential nulls */, user, {
            canEdit: true,
          }),
        ) && userCanManageEvent(event!, user, { canEdit: true })
      );
    },
    async resolve(_, {}, { id, name, capacity, tickets, eventId }) {
      const data = {
        name,
        capacity,
        eventId,
      };
      return prisma.ticketGroup.upsert({
        where: { id: id ?? '' },
        create: {
          ...data,
          tickets: { connect: tickets.map((id) => ({ id })) },
        },
        update: {
          ...data,
          tickets: { set: tickets.map((id) => ({ id })) },
        },
      });
    },
  }),
);

import { builder } from '../builder.js';
import { prisma } from '../prisma.js';
import { eventManagedByUser } from './events.js';
import { TicketInput } from './tickets.js';

export const TicketGroupType = builder.prismaNode('TicketGroup', {
  id: { field: 'id' },
  fields: (t) => ({
    name: t.exposeString('name'),
    eventId: t.exposeID('eventId'),
    event: t.relation('event'),
    capacity: t.exposeInt('capacity'),
    tickets: t.relation('tickets'),
  }),
});

export const TicketGroupInput = builder.inputType('TicketGroupInput', {
  fields: (t) => ({
    id: t.id({ required: false }),
    name: t.string(),
    capacity: t.int({ validate: { min: 0 } }),
    tickets: t.field({ type: [TicketInput] }),
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
        include: { event: true },
      });
      const event = await prisma.event.findUnique({
        where: { id: eventId },
      });
      const tickets = await prisma.ticket.findMany({
        where: { id: { in: ticketIDs } },
        include: { event: true },
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
          eventManagedByUser(event! /* legal since we removed potential nulls */, user, {
            canEdit: true,
          })
        ) && eventManagedByUser(event!, user, { canEdit: true })
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
  })
);

builder.mutationField('deleteTicketGroup', (t) =>
  t.field({
    type: 'Boolean',
    args: {
      id: t.arg.id(),
    },
    async authScopes(_, { id }, { user }) {
      // Make sure that the tickets added to that group all exists and are part of events managed by the user
      const ticketGroup = await prisma.ticketGroup.findFirst({
        where: { id: id ?? '' },
        include: { event: true },
      });

      if (!ticketGroup) return false;

      return eventManagedByUser(ticketGroup.event, user, {
        canEdit: true,
      });
    },
    async resolve(_, { id }) {
      await prisma.ticketGroup.delete({ where: { id } });
      return true;
    },
  })
);

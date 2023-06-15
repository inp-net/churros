import { builder } from '../builder.js';
import { prisma } from '../prisma.js';
import { toHtml } from '../services/markdown.js';
import { PaymentMethodEnum } from './registration.js';
import { eventAccessibleByUser, eventManagedByUser } from './events.js';
import { DateTimeScalar } from './scalars.js';
import { LinkInput } from './links.js';

export const placesLeft = (ticket: {
  name: string;
  capacity: number;
  registrations: Array<{ paid: boolean }>;
  group: null | { capacity: number; tickets: Array<{ registrations: Array<{ paid: boolean }> }> };
}) => {
  let placesLeftInGroup = Number.POSITIVE_INFINITY;
  if (ticket.group?.capacity) {
    placesLeftInGroup =
      ticket.group.capacity -
      ticket.group.tickets.reduce(
        (sum, { registrations }) => sum + registrations.filter(({ paid }) => paid).length,
        0
      );
  }

  let placesLeftInTicket = Number.POSITIVE_INFINITY;
  if (ticket.capacity)
    placesLeftInTicket = ticket.capacity - ticket.registrations.filter(({ paid }) => paid).length;

  console.log(
    `Places left for ticket ${ticket.name}: self=${placesLeftInTicket}, group=${placesLeftInGroup}`
  );
  return Math.min(placesLeftInGroup, placesLeftInTicket);
};

export const TicketType = builder.prismaNode('Ticket', {
  id: { field: 'id' },
  fields: (t) => ({
    eventId: t.exposeID('eventId'),
    ticketGroupId: t.exposeID('ticketGroupId', { nullable: true }),
    name: t.exposeString('name'),
    description: t.exposeString('description'),
    descriptionHtml: t.string({ resolve: async ({ description }) => toHtml(description) }),
    opensAt: t.expose('opensAt', { type: DateTimeScalar, nullable: true }),
    closesAt: t.expose('closesAt', { type: DateTimeScalar, nullable: true }),
    price: t.exposeFloat('price'),
    capacity: t.exposeInt('capacity'),
    registrations: t.relation('registrations'),
    links: t.relation('links'),
    allowedPaymentMethods: t.expose('allowedPaymentMethods', { type: [PaymentMethodEnum] }),
    openToPromotions: t.expose('openToPromotions', { type: ['Int'] }),
    openToAlumni: t.exposeBoolean('openToAlumni', { nullable: true }),
    openToExternal: t.exposeBoolean('openToExternal', { nullable: true }),
    openToSchools: t.relation('openToSchools'),
    openToGroups: t.relation('openToGroups'),
    openToNonAEContributors: t.exposeBoolean('openToNonAEContributors', { nullable: true }),
    godsonLimit: t.exposeInt('godsonLimit'),
    onlyManagersCanProvide: t.exposeBoolean('onlyManagersCanProvide'),
    event: t.relation('event'),
    group: t.relation('group', { nullable: true }),
    placesLeft: t.int({
      async resolve({ id }) {
        const ticket = await prisma.ticket.findUnique({
          where: { id },
          include: {
            registrations: true,
            group: { include: { tickets: { include: { registrations: true } } } },
          },
        });
        if (!ticket) return 0;
        return placesLeft(ticket);
      },
      complexity: 5,
    }),
  }),
});

export const TicketInput = builder.inputType('TicketInput', {
  fields: (t) => ({
    allowedPaymentMethods: t.field({ type: [PaymentMethodEnum] }),
    capacity: t.int(),
    price: t.float(),
    opensAt: t.field({ type: DateTimeScalar }),
    description: t.string(),
    godsonLimit: t.int(),
    links: t.field({ type: [LinkInput] }),
    name: t.string(),
    onlyManagersCanProvide: t.boolean(),
    openToAlumni: t.boolean({ required: false }),
    openToExternal: t.boolean({ required: false }),
    openToGroups: t.field({ type: ['String'] }),
    openToNonAEContributors: t.boolean({ required: false }),
    openToPromotions: t.field({ type: ['Int'] }),
    openToSchools: t.field({ type: ['Int'] }),
    id: t.id({ required: false }),
  }),
});

builder.queryField('ticket', (t) =>
  t.prismaField({
    type: TicketType,
    args: {
      id: t.arg.id(),
    },
    async authScopes(_, { id }, { user }) {
      const ticket = await prisma.ticket.findUnique({ where: { id }, include: { event: true } });
      if (!ticket) return false;
      return eventAccessibleByUser(ticket.event, user);
    },
    resolve: async (query, _, { id }) =>
      prisma.ticket.findFirstOrThrow({ ...query, where: { id } }),
  })
);

builder.queryField('ticketsOfEvent', (t) =>
  t.prismaConnection({
    type: TicketType,
    cursor: 'id',
    args: {
      event: t.arg.id(),
    },
    async authScopes(_, { event: eventId }, { user }) {
      const event = await prisma.event.findUnique({ where: { id: eventId } });
      if (!event) return false;
      return eventAccessibleByUser(event, user);
    },
    async resolve(query, _, { event }) {
      return prisma.ticket.findMany({ ...query, where: { eventId: event } });
    },
  })
);

builder.mutationField('upsertTicket', (t) =>
  t.prismaField({
    type: TicketType,
    args: {
      id: t.arg.id({ required: false }),
      eventId: t.arg.id(),
      ticketGroupId: t.arg.id({ required: false }),
      name: t.arg.string(),
      description: t.arg.string(),
      opensAt: t.arg({ type: DateTimeScalar, required: false }),
      closesAt: t.arg({ type: DateTimeScalar, required: false }),
      price: t.arg.float(),
      capacity: t.arg.int(),
      links: t.arg({ type: [LinkInput] }),
      allowedPaymentMethods: t.arg({ type: [PaymentMethodEnum] }),
      openToPromotions: t.arg({ type: ['Int'] }),
      openToAlumni: t.arg.boolean({ required: false }),
      openToExternal: t.arg.boolean({ required: false }),
      openToSchools: t.arg({ type: ['String'] }),
      openToGroups: t.arg({ type: ['String'] }),
      openToNonAEContributors: t.arg.boolean(),
      godsonLimit: t.arg.int(),
      onlyManagersCanProvide: t.arg.boolean(),
    },
    async authScopes(_, { eventId, id }, { user }) {
      const creating = !id;
      if (creating) {
        const event = await prisma.event.findUnique({ where: { id: eventId } });
        if (!event) return false;
        return eventManagedByUser(event, user, { canEdit: true });
      }

      return Boolean(
        user?.managedEvents.some(({ event, canEdit }) => event.id === eventId && canEdit)
      );
    },
    async resolve(
      _,
      {},
      {
        id,
        eventId,
        ticketGroupId,
        name,
        description,
        opensAt,
        closesAt,
        price,
        capacity,
        links,
        allowedPaymentMethods,
        openToPromotions,
        openToAlumni,
        openToExternal,
        openToSchools,
        openToNonAEContributors,
        godsonLimit,
        onlyManagersCanProvide,
      }
    ) {
      const upsertData = {
        event: { connect: { id: eventId } },
        groupId: ticketGroupId,
        name,
        description,
        opensAt,
        closesAt,
        price,
        capacity,
        allowedPaymentMethods: { set: allowedPaymentMethods },
        openToPromotions: { set: openToPromotions },
        openToAlumni,
        openToExternal,
        openToSchools: { connect: openToSchools.map((id) => ({ id })) },
        godsonLimit,
        onlyManagersCanProvide,
        openToNonAEContributors,
      };
      return prisma.ticket.upsert({
        where: { id: id ?? undefined },
        create: { ...upsertData, links: { create: links } },
        update: {
          ...upsertData,
          links: {
            deleteMany: {},
            createMany: {
              data: links,
            },
          },
        },
      });
    },
  })
);

builder.mutationField('deleteTicket', (t) =>
  t.field({
    type: 'Boolean',
    args: {
      id: t.arg.id(),
    },
    async authScopes(_, { id }, { user }) {
      const ticket = await prisma.ticket.findUnique({ where: { id }, include: { event: true } });
      if (!ticket) return false;
      return eventManagedByUser(ticket.event, user, { canEdit: true });
    },
    async resolve(_, { id }) {
      await prisma.ticket.delete({ where: { id } });
      return true;
    },
  })
);

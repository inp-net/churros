import { builder } from '../builder.js';
import { prisma } from '../prisma.js';
import { toHtml } from '../services/markdown.js';
import { PaymentMethodEnum } from './registrations.js';
import { eventAccessibleByUser, eventManagedByUser } from './events.js';
import { DateTimeScalar } from './scalars.js';
import { LinkInput } from './links.js';
import slug from 'slug';
import dichotomid from 'dichotomid';

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

  return Math.min(placesLeftInGroup, placesLeftInTicket);
};

export const TicketType = builder.prismaNode('Ticket', {
  id: { field: 'id' },
  fields: (t) => ({
    eventId: t.exposeID('eventId'),
    uid: t.exposeString('uid'),
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
    openToMajors: t.relation('openToMajors'),
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
        const places = placesLeft(ticket);
        if (places === Number.POSITIVE_INFINITY) return -1;
        return places;
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
    opensAt: t.field({ type: DateTimeScalar, required: false }),
    closesAt: t.field({ type: DateTimeScalar, required: false }),
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
    openToSchools: t.field({ type: ['String'] }),
    openToMajors: t.field({ type: ['String'] }),
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
        include: { event: true },
      });
      return eventAccessibleByUser(ticket.event, user);
    },
    resolve: async (query, _, { uid, eventUid }) =>
      prisma.ticket.findFirstOrThrow({ ...query, where: { uid, event: { uid: eventUid } } }),
  })
);

export function userCanSeeTicket(
  {
    event,
    openToGroups,
    openToSchools,
    openToPromotions,
    openToMajors,
  }: {
    event: { id: string };
    onlyManagersCanProvide: boolean;
    openToGroups: Array<{ uid: string }>;
    openToSchools: Array<{ uid: string }>;
    openToPromotions: number[];
    openToMajors: Array<{ id: string }>;
  },
  user?: {
    groups: Array<{ group: { uid: string } }>;
    managedEvents: Array<{ event: { id: string } }>;
    graduationYear: number;
    major: { schools: Array<{ uid: string }>; id: string };
  }
): boolean {
  // Managers can see everything
  if (user?.managedEvents.some(({ event: { id } }) => id === event.id)) return true;

  // Check that the user is in the group
  if (
    openToGroups.length > 0 &&
    !openToGroups.some(({ uid }) => user?.groups.some(({ group }) => group.uid === uid))
  )
    return false;

  // Check that the user is in the major
  if (openToMajors.length > 0 && !openToMajors.map((m) => m.id).includes(user?.major.id ?? ''))
    return false;

  // Check that the user is in the school
  if (
    openToSchools.length > 0 &&
    !openToSchools.some(({ uid }) => user?.major.schools.some((school) => school.uid === uid))
  )
    return false;

  // Check that the user in the promo
  if (openToPromotions.length > 0 && (!user || !openToPromotions.includes(user.graduationYear)))
    return false;

  return true;
}

builder.queryField('ticketsOfEvent', (t) =>
  t.prismaField({
    type: [TicketType],
    args: {
      eventUid: t.arg.string(),
      groupUid: t.arg.string(),
    },
    async authScopes(_, { eventUid, groupUid }, { user }) {
      const group = await prisma.group.findUniqueOrThrow({ where: { uid: groupUid } });
      const event = await prisma.event.findUnique({
        where: { groupId_uid: { groupId: group.id, uid: eventUid } },
      });
      if (!event) return false;
      return eventAccessibleByUser(event, user);
    },
    async resolve(query, _, { eventUid, groupUid }, { user }) {
      const allTickets = await prisma.ticket.findMany({
        where: { event: { uid: eventUid, group: { uid: groupUid } } },
        include: {
          ...query.include,
          openToGroups: true,
          openToSchools: true,
          event: true,
          openToMajors: true,
        },
      });
      return allTickets.filter((ticket) => userCanSeeTicket(ticket, user));
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
      openToMajors: t.arg({ type: ['String'] }),
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
        openToMajors,
        openToNonAEContributors,
        godsonLimit,
        onlyManagersCanProvide,
      }
    ) {
      const upsertData = {
        uid: await createUid(name),
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
        godsonLimit,
        onlyManagersCanProvide,
        openToNonAEContributors,
      };
      return prisma.ticket.upsert({
        where: { id: id ?? undefined },
        create: {
          ...upsertData,
          links: { create: links },
          openToSchools: { connect: openToSchools.map((id) => ({ id })) },
          openToMajors: { connect: openToMajors.map((id) => ({ id })) },
        },
        update: {
          ...upsertData,
          openToSchools: { set: openToSchools.map((id) => ({ id })) },
          openToMajors: { set: openToMajors.map((id) => ({ id })) },
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

export async function createUid(name: string) {
  const base = slug(name);
  const n = await dichotomid(
    async (n) =>
      !(await prisma.ticket.findFirst({
        where: { name: `${base}${n > 1 ? `-${n}` : ''}` },
      }))
  );
  return `${base}${n > 1 ? `-${n}` : ''}`;
}

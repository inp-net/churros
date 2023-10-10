import { builder } from '../builder.js';
import { prisma } from '../prisma.js';
import { toHtml } from '../services/markdown.js';
import { PaymentMethodEnum } from './registrations.js';
import { eventAccessibleByUser, eventManagedByUser } from './events.js';
import { DateTimeScalar } from './scalars.js';
import { LinkInput } from './links.js';
import slug from 'slug';
import dichotomid from 'dichotomid';
import { PaymentMethod } from '@prisma/client';

export const placesLeft = (ticket: {
  name: string;
  capacity: number;
  registrations: Array<{ paid: boolean; opposedAt: Date | null; cancelledAt: Date | null }>;
  group: null | {
    capacity: number;
    tickets: Array<{
      registrations: Array<{ paid: boolean; opposedAt: Date | null; cancelledAt: Date | null }>;
    }>;
  };
}) => {
  const handleUnlimited = (capacity: number) =>
    capacity === -1 ? Number.POSITIVE_INFINITY : capacity;
  let placesLeftInGroup = Number.POSITIVE_INFINITY;
  if (ticket.group?.capacity) {
    placesLeftInGroup = Math.max(
      0,
      handleUnlimited(ticket.group.capacity) -
        ticket.group.tickets.reduce(
          (sum, { registrations }) =>
            sum +
            registrations.filter(
              ({ opposedAt, cancelledAt /* , paid */ }) => !cancelledAt && !opposedAt /* && paid */,
            ).length,
          0,
        ),
    );
  }

  let placesLeftInTicket = Number.POSITIVE_INFINITY;
  if (ticket.capacity) {
    placesLeftInTicket = Math.max(
      0,
      handleUnlimited(ticket.capacity) -
        ticket.registrations.filter(
          ({ opposedAt, cancelledAt /* , paid */ }) => !cancelledAt && !opposedAt /* && paid */,
        ).length,
    );
  }

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
    registrations: t.relation('registrations', {
      query(_, { user }) {
        if (user?.admin) return {};
        return {
          where: {
            OR: [
              { author: { uid: user?.uid } },
              { beneficiary: user?.uid },
              { ticket: { event: { managers: { some: { user: { uid: user?.uid } } } } } },
            ],
          },
        };
      },
    }),
    links: t.relation('links'),
    allowedPaymentMethods: t.field({
      type: [PaymentMethodEnum],
      resolve: async ({ allowedPaymentMethods, eventId }) =>
        // eslint-disable-next-line unicorn/no-array-reduce
        allowedPaymentMethods.reduce(
          async (acc, p) => {
            if (p === PaymentMethod.Lydia) {
              const event = await prisma.event.findUniqueOrThrow({ where: { id: eventId } });
              if (event.lydiaAccountId) return [...(await acc), p];

              return acc;
            }

            return [...(await acc), p];
          },
          Promise.resolve([] as PaymentMethod[]),
        ),
    }),
    openToPromotions: t.expose('openToPromotions', { type: ['Int'] }),
    openToAlumni: t.exposeBoolean('openToAlumni', { nullable: true }),
    openToExternal: t.exposeBoolean('openToExternal', { nullable: true }),
    openToSchools: t.relation('openToSchools'),
    openToGroups: t.relation('openToGroups'),
    openToMajors: t.relation('openToMajors'),
    openToContributors: t.exposeBoolean('openToContributors', { nullable: true }),
    openToApprentices: t.exposeBoolean('openToApprentices', { nullable: true }),
    godsonLimit: t.exposeInt('godsonLimit'),
    onlyManagersCanProvide: t.exposeBoolean('onlyManagersCanProvide'),
    autojoinGroups: t.relation('autojoinGroups'),
    event: t.relation('event'),
    group: t.relation('group', { nullable: true }),
    remainingGodsons: t.int({
      async resolve({ godsonLimit, eventId }, _, { user }) {
        const { managers } = await prisma.event.findUniqueOrThrow({
          where: { id: eventId },
          include: {
            managers: true,
          },
        });
        if (managers.some(({ userId }) => user?.id === userId)) return -1;
        const registrationsOfUser = await prisma.registration.findMany({
          where: {
            ticket: { event: { id: eventId } },
            author: { uid: user?.uid },
            beneficiary: { not: '' },
          },
        });
        return godsonLimit - registrationsOfUser.length;
      },
    }),
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
    openToContributors: t.boolean({ required: false }),
    openToPromotions: t.field({ type: ['Int'] }),
    openToSchools: t.field({ type: ['String'] }),
    openToMajors: t.field({ type: ['String'] }),
    openToApprentices: t.boolean({ required: false }),
    id: t.id({ required: false }),
    autojoinGroups: t.field({ type: ['String'] }),
    groupName: t.string({ required: false }),
  }),
});

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
              coOrganizers: true,
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
      return eventAccessibleByUser(ticket.event, user);
    },
    resolve: async (query, _, { id }) =>
      prisma.ticket.findFirstOrThrow({ ...query, where: { id } }),
  }),
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
        include: {
          event: {
            include: {
              coOrganizers: true,
              managers: {
                include: {
                  user: true,
                },
              },
            },
          },
        },
      });
      return eventAccessibleByUser(ticket.event, user);
    },
    resolve: async (query, _, { uid, eventUid }) =>
      prisma.ticket.findFirstOrThrow({ ...query, where: { uid, event: { uid: eventUid } } }),
  }),
);

export function userCanSeeTicket(
  {
    event,
    openToGroups,
    openToSchools,
    openToPromotions,
    openToMajors,
    openToContributors,
    openToApprentices,
  }: {
    event: {
      id: string;
      group: { studentAssociation: null | { id: string } };
      managers: Array<{ userId: string }>;
      bannedUsers: Array<{ id: string }>;
    };
    onlyManagersCanProvide: boolean;
    openToGroups: Array<{ uid: string }>;
    openToSchools: Array<{ uid: string }>;
    openToPromotions: number[];
    openToMajors: Array<{ id: string }>;
    openToContributors: boolean | null;
    openToApprentices: boolean | null;
  },
  user?: {
    id: string;
    admin: boolean;
    groups: Array<{ group: { uid: string } }>;
    graduationYear: number;
    major: { schools: Array<{ uid: string }>; id: string };
    contributions: Array<{
      paid: boolean;
      option: { id: string; paysFor: Array<{ id: string; school: { uid: string } }> };
    }>;
    apprentice: boolean;
  },
): boolean {
  // Admins can see everything
  if (user?.admin) return true;

  // Managers can see everything
  if (event.managers.some(({ userId }) => userId === user?.id)) return true;

  // Banned users cannot see any ticket
  if (event.bannedUsers.some(({ id }) => id === user?.id)) return false;

  // Check if user is an apprentice
  if (openToApprentices === true && !user?.apprentice) return false;
  if (openToApprentices === false && user?.apprentice) return false;

  // Get the user's contributor status
  const isContributor = Boolean(
    user?.contributions.some(
      ({ option: { paysFor }, paid }) =>
        paid && paysFor.some(({ id }) => id === event.group.studentAssociation?.id),
    ),
  );

  if (openToContributors === true && !isContributor) return false;
  if (openToContributors === false && isContributor) return false;

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

        include: {
          coOrganizers: true,
          managers: {
            include: {
              user: true,
            },
          },
        },
      });
      if (!event) return false;
      return eventAccessibleByUser(event, user);
    },
    async resolve(query, _, { eventUid, groupUid }, { user }) {
      const allTickets = await prisma.ticket.findMany({
        where: { event: { uid: eventUid, group: { uid: groupUid } } },
        include: {
          ...query.include,
          openToGroups: {
            include: {
              studentAssociation: true,
            },
          },
          openToSchools: true,
          event: {
            include: {
              managers: true,
              bannedUsers: true,
              group: {
                include: {
                  studentAssociation: true,
                },
              },
            },
          },
          openToMajors: true,
          group: true,
        },
      });
      const userWithContributesTo = user
        ? await prisma.user.findUniqueOrThrow({
            where: { id: user.id },
            include: {
              contributions: {
                include: {
                  option: {
                    include: {
                      paysFor: {
                        include: {
                          school: true,
                        },
                      },
                    },
                  },
                },
              },
              groups: {
                include: {
                  group: true,
                },
              },
              managedEvents: {
                include: {
                  event: true,
                },
              },
              major: {
                include: {
                  schools: true,
                },
              },
            },
          })
        : undefined;

      return allTickets.filter((ticket) => userCanSeeTicket(ticket, userWithContributesTo));
    },
  }),
);

builder.mutationField('deleteTicket', (t) =>
  t.field({
    type: 'Boolean',
    args: {
      id: t.arg.id(),
    },
    async authScopes(_, { id }, { user }) {
      const ticket = await prisma.ticket.findUnique({
        where: { id },
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
      if (!ticket) return false;
      return eventManagedByUser(ticket.event, user, { canEdit: true });
    },
    async resolve(_, { id }) {
      await prisma.ticket.delete({ where: { id } });
      return true;
    },
  }),
);

export async function createUid({
  name,
  eventId,
  ticketGroupId,
  ticketGroupName,
}: {
  name: string;
  eventId: string;
  ticketGroupId: null | undefined | string;
  ticketGroupName: null | undefined | string;
}) {
  const base = ticketGroupName ? `${slug(ticketGroupName)}--${slug(name)}` : slug(name);
  const n = await dichotomid(
    async (n) =>
      !(await prisma.ticket.findFirst({
        where: {
          eventId,
          ticketGroupId,
          name: `${base}${n > 1 ? `-${n}` : ''}`,
        },
      })),
  );
  return `${base}${n > 1 ? `-${n}` : ''}`;
}

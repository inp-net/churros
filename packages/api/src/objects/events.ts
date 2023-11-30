import {
  EventFrequency,
  PaymentMethod,
  Visibility,
  Visibility as VisibilityPrisma,
  type Event as EventPrisma,
  type Prisma,
  type Ticket,
  type TicketGroup,
} from '@prisma/client';
import { mappedGetAncestors } from 'arborist';
import {
  addDays,
  differenceInDays,
  differenceInWeeks,
  endOfDay,
  endOfWeek,
  getDay,
  getMonth,
  getYear,
  isBefore,
  setDay,
  setMonth,
  setYear,
  startOfDay,
  startOfWeek,
  weeksToDays,
} from 'date-fns';
import dichotomid from 'dichotomid';
import slug from 'slug';
import { builder } from '../builder.js';
import type { Context } from '../context.js';
import { prisma } from '../prisma.js';
import { htmlToText, toHtml } from '../services/markdown.js';
import { fullTextSearch, highlightProperties, sortWithMatches } from '../services/search.js';
import { ManagerOfEventInput } from './event-managers.js';
import { LinkInput } from './links.js';
import { BooleanMapScalar, CountsScalar, DateTimeScalar, FileScalar } from './scalars.js';
import { TicketGroupInput } from './ticket-groups.js';
import {
  TicketInput,
  TicketType,
  createUid as createTicketUid,
  userCanSeeTicket,
} from './tickets.js';
// import imageType, { minimumBytes } from 'image-type';
import { GraphQLError } from 'graphql';
import { unlink } from 'node:fs/promises';
import { join } from 'node:path';
import { onBoard } from '../auth.js';
import { updatePicture } from '../pictures.js';
import { scheduleShotgunNotifications } from '../services/notifications.js';
import { soonest } from '../date.js';

export const VisibilityEnum = builder.enumType(VisibilityPrisma, {
  name: 'Visibility',
});

export const EventFrequencyType = builder.enumType(EventFrequency, {
  name: 'EventFrequency',
});

function findNextRecurringEvent(event: EventPrisma): EventPrisma {
  const today = new Date();
  const { startsAt, endsAt, frequency } = event;
  let newStartsAt = startsAt;
  switch (frequency) {
    case EventFrequency.Weekly: {
      const todayWeek = setDay(today, getDay(startsAt), { weekStartsOn: 1 });
      const dayDelta = differenceInDays(todayWeek, startsAt);
      newStartsAt = addDays(startsAt, dayDelta);
      const correctedDelta = isBefore(today, newStartsAt) ? dayDelta : dayDelta + 7;
      return {
        ...event,
        startsAt: addDays(startsAt, correctedDelta),
        endsAt: addDays(endsAt, correctedDelta),
      };
    }

    case EventFrequency.Biweekly: {
      // move event from its original startsAt to today's week.
      const todayWeek = setDay(today, getDay(startsAt), { weekStartsOn: 1 });
      const weekDelta = differenceInWeeks(todayWeek, startsAt);
      const tempStartsAt = addDays(startsAt, weeksToDays(weekDelta));
      const correctedDelta = isBefore(today, tempStartsAt) ? weekDelta : weekDelta + 2;
      const newStartsAt = addDays(startsAt, weeksToDays(correctedDelta));
      const newEndsAt = addDays(endsAt, weeksToDays(correctedDelta));
      return { ...event, startsAt: newStartsAt, endsAt: newEndsAt };
    }

    case EventFrequency.Monthly: {
      const monthCorrect =
        getMonth(today) === getMonth(endOfWeek(today, { weekStartsOn: 1 })) ? 0 : 1;
      const yearCorrect = getYear(today) === getYear(endOfWeek(today, { weekStartsOn: 1 })) ? 0 : 1;

      const tempStartsAt = setMonth(startsAt, getMonth(today) + monthCorrect);
      const correctedDelta = isBefore(today, tempStartsAt) ? monthCorrect : monthCorrect + 1;
      const newStartsAt = setMonth(startsAt, getMonth(today) + correctedDelta);
      const newEndsAt = setMonth(endsAt, getMonth(today) + correctedDelta);
      return {
        ...event,
        startsAt: setYear(newStartsAt, getYear(today) + yearCorrect),
        endsAt: setYear(newEndsAt, getYear(today) + yearCorrect),
      };
    }

    default: {
      return event;
    }
  }
}

export function visibleEventsPrismaQuery(
  user: { uid: string } | undefined,
): Prisma.EventWhereInput {
  return {
    OR: [
      {
        visibility: VisibilityPrisma.Private,
        OR: [
          {
            author: { uid: user?.uid ?? '' },
          },
          {
            managers: { some: { user: { uid: user?.uid ?? '' } } },
          },
        ],
      },
      // Completely public events
      {
        visibility: VisibilityPrisma.Public,
      },
      // SchoolRestricted events
      {
        visibility: VisibilityPrisma.SchoolRestricted,
        OR: [
          {
            group: {
              studentAssociation: {
                school: { majors: { some: { students: { some: { uid: user?.uid ?? '' } } } } },
              },
            },
          },
          {
            coOrganizers: {
              some: {
                studentAssociation: {
                  school: {
                    majors: { some: { students: { some: { uid: user?.uid ?? '' } } } },
                  },
                },
              },
            },
          },
          {
            tickets: {
              some: {
                openToExternal: true,
              },
            },
          },
        ],
      },
      // GroupRestricted events in the user's groups
      {
        visibility: VisibilityPrisma.GroupRestricted,
        OR: [
          // TODO does not work for sub-sub groups
          {
            group: {
              familyRoot: {
                children: { some: { members: { some: { member: { uid: user?.uid ?? '' } } } } },
              },
            },
          },
          {
            group: { members: { some: { member: { uid: user?.uid ?? '' } } } },
          },
          {
            coOrganizers: { some: { members: { some: { member: { uid: user?.uid ?? '' } } } } },
          },
        ],
      },
      // Unlisted events that the user booked
      {
        visibility: VisibilityPrisma.Unlisted,
        OR: [
          {
            author: { uid: user?.uid ?? '' },
          },
          {
            managers: {
              some: {
                user: { uid: user?.uid ?? '' },
              },
            },
          },
          {
            tickets: {
              some: {
                registrations: {
                  some: {
                    OR: [
                      {
                        beneficiary: user?.uid ?? '',
                      },
                      {
                        author: { uid: user?.uid ?? '' },
                      },
                    ],
                  },
                },
              },
            },
          },
        ],
      },
    ],
  };
}

class RegistrationsCounts {
  total: number;
  paid: number;
  verified: number;
  unpaidLydia: number;
  cancelled: number;

  constructor(data: {
    total: number;
    paid: number;
    verified: number;
    unpaidLydia: number;
    cancelled: number;
  }) {
    this.total = data.total;
    this.paid = data.paid;
    this.verified = data.verified;
    this.unpaidLydia = data.unpaidLydia;
    this.cancelled = data.cancelled;
  }
}

const RegistrationsCountsType = builder
  .objectRef<RegistrationsCounts>('RegistrationsCounts')
  .implement({
    fields: (t) => ({
      total: t.exposeFloat('total'),
      paid: t.exposeFloat('paid'),
      verified: t.exposeFloat('verified'),
      unpaidLydia: t.exposeFloat('unpaidLydia'),
      cancelled: t.exposeFloat('cancelled'),
    }),
  });

class ProfitsBreakdown {
  /* eslint-disable @typescript-eslint/parameter-properties */
  total: number;
  byPaymentMethod: Record<PaymentMethod, number>;
  byTicket: Array<{ id: string; amount: number }>;
  /* eslint-enable @typescript-eslint/parameter-properties */

  constructor(
    total: number,
    byPaymentMethod: Record<PaymentMethod, number>,
    byTicket: Array<{ id: string; amount: number }>,
  ) {
    this.total = total;
    this.byPaymentMethod = byPaymentMethod;
    this.byTicket = byTicket;
  }
}

const ProfitsBreakdownType = builder.objectRef<ProfitsBreakdown>('ProfitsBreakdown').implement({
  fields: (t) => ({
    total: t.exposeFloat('total'),
    byPaymentMethod: t.expose('byPaymentMethod', {
      type: builder
        .objectRef<Record<PaymentMethod, number>>('ProfitsBreakdownByPaymentMethod')
        .implement({
          fields: (t) =>
            Object.fromEntries(
              Object.entries(PaymentMethod).map(([_, p]) => [p, t.exposeFloat(p)]),
            ),
        }),
    }),
    byTicket: t.expose('byTicket', {
      type: [
        builder.objectRef<{ id: string; amount: number }>('ProfitsBreakdownByTicket').implement({
          fields: (t) => ({
            id: t.exposeID('id'),
            amount: t.exposeFloat('amount'),
          }),
        }),
      ],
    }),
  }),
});

export function eventCapacity(
  tickets: Array<Ticket & { group: TicketGroup | null }>,
  ticketGroups: Array<TicketGroup & { tickets: Ticket[] }>,
) {
  // Places left is capacity - number of registrations
  // Capacity is the sum of
  // - ticket's capacity, for tickets outside of groups
  // - min(group capacity, sum of tickets' capacity)  for ticket groups
  const ungroupedTickets = tickets.filter((t) => !t.group);
  const handleUnlimited = (capacity: number) =>
    capacity === -1 ? Number.POSITIVE_INFINITY : capacity;
  return (
    ungroupedTickets.reduce((acc, t) => acc + handleUnlimited(t.capacity), 0) +
    ticketGroups.reduce(
      (acc, tg) =>
        acc +
        Math.min(
          handleUnlimited(tg.capacity),
          tg.tickets.reduce((acc, t) => acc + handleUnlimited(t.capacity), 0),
        ),
      0,
    )
  );
}

export const EventType = builder.prismaNode('Event', {
  id: { field: 'id' },
  fields: (t) => ({
    authorId: t.exposeID('authorId', { nullable: true }),
    groupId: t.exposeID('groupId'),
    contactMail: t.exposeString('contactMail'),
    beneficiary: t.relation('beneficiary', { nullable: true }),
    lydiaAccountId: t.exposeID('lydiaAccountId', { nullable: true }),
    description: t.exposeString('description'),
    descriptionHtml: t.string({ resolve: async ({ description }) => toHtml(description) }),
    descriptionPreview: t.string({
      resolve: async ({ description }) =>
        (
          htmlToText(await toHtml(description))
            .split('\n')
            .find((line) => line.trim() !== '') ?? ''
        ).slice(0, 255),
    }),
    uid: t.exposeString('uid'),
    title: t.exposeString('title'),
    startsAt: t.expose('startsAt', { type: DateTimeScalar }),
    frequency: t.expose('frequency', { type: EventFrequencyType }),
    recurringUntil: t.expose('recurringUntil', { type: DateTimeScalar, nullable: true }),
    endsAt: t.expose('endsAt', { type: DateTimeScalar }),
    location: t.exposeString('location'),
    visibility: t.expose('visibility', { type: VisibilityEnum }),
    managers: t.relation('managers'),
    bannedUsers: t.relation('bannedUsers'),
    tickets: t.field({
      type: [TicketType],
      async resolve({ id }, _, { user }) {
        const allTickets = await prisma.ticket.findMany({
          where: { event: { id } },
          include: {
            openToGroups: {
              include: {
                studentAssociation: true,
              },
            },
            openToSchools: true,
            event: {
              include: {
                bannedUsers: true,
                managers: { include: { user: true, event: true } },
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
                        offeredIn: true,
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
    ticketGroups: t.relation('ticketGroups'),
    articles: t.relation('articles'),
    group: t.relation('group'),
    coOrganizers: t.relation('coOrganizers'),
    links: t.relation('links'),
    author: t.relation('author', { nullable: true }),
    pictureFile: t.exposeString('pictureFile'),
    reactions: t.relation('reactions'),
    mySoonestShotgunOpensAt: t.field({
      type: DateTimeScalar,
      nullable: true,
      async resolve({ id }, _, { user }) {
        if (!user) return;
        const tickets = await prisma.ticket.findMany({
          where: { event: { id } },
          include: {
            openToGroups: true,
            openToSchools: true,
            openToMajors: true,
            event: {
              include: {
                managers: { include: { user: true } },
                bannedUsers: true,
                group: {
                  include: {
                    studentAssociation: true,
                  },
                },
              },
            },
          },
        });

        const userWithContributions = await prisma.user.findUniqueOrThrow({
          where: { id: user?.id },
          include: {
            groups: {
              include: { group: true },
            },
            major: {
              include: {
                schools: true,
              },
            },
            contributions: {
              include: {
                option: {
                  include: {
                    offeredIn: true,
                    paysFor: {
                      include: {
                        school: true,
                      },
                    },
                  },
                },
              },
            },
          },
        });

        const accessibleTickets = tickets.filter((t) => userCanSeeTicket(t, userWithContributions));
        return soonest(...accessibleTickets.map((t) => t.opensAt));
      },
    }),
    myReactions: t.field({
      type: BooleanMapScalar,
      async resolve({ id }, _, { user }) {
        const reactions = await prisma.reaction.findMany({
          where: { eventId: id },
        });
        const emojis = new Set(reactions.map((r) => r.emoji));
        return Object.fromEntries(
          [...emojis].map((emoji) => [
            emoji,
            user ? reactions.some((r) => r.emoji === emoji && r.authorId === user.id) : false,
          ]),
        );
      },
    }),
    reactionCounts: t.field({
      type: CountsScalar,
      async resolve({ id }) {
        const reactions = await prisma.reaction.findMany({
          where: { eventId: id },
        });
        // eslint-disable-next-line unicorn/no-array-reduce
        return reactions.reduce<Record<string, number>>(
          (counts, reaction) => ({
            ...counts,
            [reaction.emoji]: (counts[reaction.emoji] ?? 0) + 1,
          }),
          {},
        );
      },
    }),
    capacity: t.int({
      async resolve({ id }) {
        const tickets = await prisma.ticket.findMany({
          where: { event: { id } },
          include: {
            group: true,
          },
        });
        const ticketGroups = await prisma.ticketGroup.findMany({
          where: { event: { id } },
          include: {
            tickets: true,
          },
        });

        return eventCapacity(tickets, ticketGroups);
      },
    }),
    placesLeft: t.int({
      async resolve({ id }) {
        const registrations = await prisma.registration.findMany({
          where: { ticket: { event: { id } } },
        });

        const tickets = await prisma.ticket.findMany({
          where: { event: { id } },
          include: {
            group: true,
          },
        });
        const ticketGroups = await prisma.ticketGroup.findMany({
          where: { event: { id } },
          include: {
            tickets: true,
          },
        });

        const placesLeft = Math.max(
          0,
          eventCapacity(tickets, ticketGroups) -
            registrations.filter((r) => !r.cancelledAt && !r.opposedAt).length,
        );
        return placesLeft === Number.POSITIVE_INFINITY ? -1 : placesLeft;
      },
    }),
    registrationsCounts: t.field({
      type: RegistrationsCountsType,
      async resolve({ id }) {
        const results = await prisma.registration.findMany({
          where: { ticket: { event: { id } } },
          include: { ticket: true },
        });
        return {
          total: results.filter((r) => !r.cancelledAt).length,
          paid: results.filter((r) => r.ticket.price !== 0 && r.paid && !r.cancelledAt).length,
          verified: results.filter((r) => r.verifiedAt).length,
          unpaidLydia: results.filter((r) => !r.paid && r.paymentMethod === PaymentMethod.Lydia)
            .length,
          cancelled: results.filter((r) => r.cancelledAt).length,
        };
      },
    }),
    profitsBreakdown: t.field({
      type: ProfitsBreakdownType,
      async resolve({ id }) {
        const tickets = await prisma.ticket.findMany({
          where: { event: { id } },
        });
        const registrations = await prisma.registration.findMany({
          where: { ticket: { event: { id } } },
          include: { ticket: true },
        });
        const sumUp = (regs: typeof registrations) =>
          regs.reduce((acc, r) => acc + (r.paid ? r.ticket.price : 0), 0);

        return {
          total: sumUp(registrations),
          byPaymentMethod: Object.fromEntries(
            Object.entries(PaymentMethod).map(([_, value]) => [
              value,
              sumUp(registrations.filter((r) => r.paymentMethod === value)),
            ]),
          ) as Record<PaymentMethod, number>,
          byTicket: tickets.map(({ id }) => ({
            id,
            amount: sumUp(registrations.filter((r) => r.ticket.id === id)),
          })),
        };
      },
    }),
  }),
});

builder.queryField('event', (t) =>
  t.prismaField({
    type: EventType,
    args: {
      uid: t.arg.string(),
      groupUid: t.arg.string(),
    },
    async authScopes(_, { uid, groupUid }, { user }) {
      const event = await prisma.event.findFirstOrThrow({
        where: { uid, group: { uid: groupUid } },
        include: {
          coOrganizers: { include: { studentAssociation: { include: { school: true } } } },
          group: { include: { studentAssociation: { include: { school: true } } } },
          managers: { include: { user: true } },
          tickets: true,
        },
      });
      return eventAccessibleByUser(event, user);
    },
    resolve: async (query, _, { uid, groupUid }) =>
      prisma.event.findFirstOrThrow({ ...query, where: { uid, group: { uid: groupUid } } }),
  }),
);

builder.queryField('events', (t) =>
  t.prismaConnection({
    type: EventType,
    cursor: 'id',
    args: {
      future: t.arg.boolean({ required: false }),
      past: t.arg.boolean({ required: false }),
      upcomingShotguns: t.arg.boolean({ required: false }),
      noLinkedArticles: t.arg.boolean({ required: false }),
      pastRecurring: t.arg.boolean({ required: false }),
    },
    async resolve(
      query,
      _,
      { future, past, upcomingShotguns, noLinkedArticles, pastRecurring },
      { user },
    ) {
      future = future ?? false;
      past = past ?? false;
      upcomingShotguns = upcomingShotguns ?? false;
      pastRecurring = pastRecurring ?? false;
      let constraints: Prisma.EventWhereInput = {};
      if (future || upcomingShotguns || pastRecurring) {
        constraints = {
          OR: [
            { startsAt: { gte: startOfDay(new Date()) } },
            // eslint-disable-next-line unicorn/no-null
            { recurringUntil: { not: null, gte: startOfDay(new Date()) } },
          ],
        };
      } else if (past) {
        constraints = {
          endsAt: { lte: endOfDay(new Date()) },
        };
      }

      if (noLinkedArticles) {
        constraints.articles = {
          none: {},
        };
      }

      if (!user) {
        return prisma.event
          .findMany({
            ...query,
            where: {
              visibility: VisibilityPrisma.Public,
              ...constraints,
            },
            orderBy: { startsAt: 'asc' },
          })
          .then((events) => events.map((e) => findNextRecurringEvent(e)));
      }

      return prisma.event
        .findMany({
          ...query,
          where: {
            AND: [constraints, visibleEventsPrismaQuery(user)],
          },
          orderBy: { startsAt: 'asc' },
        })
        .then((events) => events.map((e) => findNextRecurringEvent(e)));
    },
  }),
);

builder.queryField('eventsInWeek', (t) =>
  t.prismaField({
    type: [EventType],
    args: {
      today: t.arg({ type: DateTimeScalar }),
    },
    async resolve(query, _, { today }, { user }) {
      // dateCondition is used to filter events that start in the week or end in the week
      const dateCondition = {
        OR: [
          {
            startsAt: {
              gte: startOfDay(startOfWeek(today, { weekStartsOn: 1 })),
              lte: endOfDay(endOfWeek(today, { weekStartsOn: 1 })),
            },
          },
          {
            frequency: { not: EventFrequency.Once },
            recurringUntil: {
              gte: startOfDay(startOfWeek(today, { weekStartsOn: 1 })),
            },
          },
        ],
      };

      function isRecurrentEventVisible(event: EventPrisma): boolean {
        // if the event's (original) startsAt is after today's week's start, it is not visible
        if (
          startOfWeek(event.startsAt, { weekStartsOn: 1 }) > startOfWeek(today, { weekStartsOn: 1 })
        )
          return false;

        if (event.recurringUntil) return isBefore(today, event.recurringUntil);
        return true;
      }

      function fixRecurrentEventDates(event: EventPrisma): EventPrisma {
        let { startsAt, endsAt, frequency } = event;
        switch (frequency) {
          case EventFrequency.Weekly: {
            const todayWeek = setDay(today, getDay(startsAt), { weekStartsOn: 1 });
            const dayDelta = differenceInDays(todayWeek, startsAt);
            startsAt = addDays(startsAt, dayDelta);
            endsAt = addDays(endsAt, dayDelta);
            break;
          }

          case EventFrequency.Biweekly: {
            // move event from its original startsAt to today's week.
            const todayWeek = setDay(today, getDay(startsAt), { weekStartsOn: 1 });
            const weekDelta = differenceInWeeks(todayWeek, startsAt);
            if (weekDelta % 2 === 0) {
              startsAt = addDays(startsAt, weeksToDays(weekDelta));
              endsAt = addDays(endsAt, weeksToDays(weekDelta));
            }

            break;
          }

          case EventFrequency.Monthly: {
            const monthCorrect =
              getMonth(today) === getMonth(endOfWeek(today, { weekStartsOn: 1 })) ? 0 : 1;
            const yearCorrect =
              getYear(today) === getYear(endOfWeek(today, { weekStartsOn: 1 })) ? 0 : 1;

            startsAt = setMonth(startsAt, getMonth(today) + monthCorrect);
            endsAt = setMonth(endsAt, getMonth(today) + monthCorrect);
            startsAt = setYear(startsAt, getYear(today) + yearCorrect);
            endsAt = setYear(endsAt, getYear(today) + yearCorrect);
            break;
          }

          default: {
            break;
          }
        }

        return { ...event, startsAt, endsAt };
      }

      if (!user) {
        return prisma.event
          .findMany({
            ...query,
            where: {
              ...dateCondition,
              visibility: VisibilityPrisma.Public,
            },
            orderBy: { startsAt: 'asc' },
          })
          .then((events) =>
            events
              .filter((element) => isRecurrentEventVisible(element))
              .map((e) => fixRecurrentEventDates(e)),
          );
      }

      return prisma.event
        .findMany({
          ...query,
          where: {
            ...dateCondition,
            ...visibleEventsPrismaQuery(user),
          },
          orderBy: { startsAt: 'asc' },
        })
        .then((events) =>
          events
            .filter((element) => isRecurrentEventVisible(element))
            .map((e) => fixRecurrentEventDates(e)),
        );
    },
  }),
);

builder.queryField('eventsOfGroup', (t) =>
  t.prismaConnection({
    type: EventType,
    cursor: 'id',
    args: {
      groupUid: t.arg.string(),
    },
    async resolve(query, _, { groupUid }, { user }) {
      if (!user) {
        return prisma.event.findMany({
          ...query,
          where: { visibility: VisibilityPrisma.Public, group: { uid: groupUid } },
          orderBy: { startsAt: 'desc' },
        });
      }

      return prisma.event.findMany({
        ...query,
        where: visibleEventsPrismaQuery(user),
        orderBy: { startsAt: 'desc' },
      });
    },
  }),
);

builder.mutationField('deleteEvent', (t) =>
  t.field({
    type: 'Boolean',
    args: {
      id: t.arg.id(),
    },
    async authScopes(_, { id }, { user }) {
      const event = await prisma.event.findUniqueOrThrow({
        where: { id },
        include: { managers: true },
      });
      return Boolean(
        user?.admin || event.managers.some(({ userId, canEdit }) => userId === user?.id && canEdit),
      );
    },
    async resolve(_, { id }, { user }) {
      await prisma.event.delete({
        where: { id },
      });
      await prisma.logEntry.create({
        data: {
          area: 'event',
          action: 'delete',
          target: id,
          message: `Deleted event ${id}`,
          user: user ? { connect: { id: user.id } } : undefined,
        },
      });
      return true;
    },
  }),
);

builder.mutationField('upsertEvent', (t) =>
  t.prismaField({
    type: EventType,
    errors: {},
    args: {
      id: t.arg.string({ required: false }),
      ticketGroups: t.arg({ type: [TicketGroupInput] }),
      tickets: t.arg({ type: [TicketInput] }),
      description: t.arg.string(),
      groupUid: t.arg.string(),
      contactMail: t.arg.string(),
      links: t.arg({ type: [LinkInput] }),
      lydiaAccountId: t.arg.string({ required: false }),
      location: t.arg.string(),
      title: t.arg.string(),
      visibility: t.arg({ type: VisibilityEnum }),
      frequency: t.arg({ type: EventFrequencyType }),
      recurringUntil: t.arg({ type: DateTimeScalar, required: false }),
      startsAt: t.arg({ type: DateTimeScalar }),
      endsAt: t.arg({ type: DateTimeScalar }),
      managers: t.arg({ type: [ManagerOfEventInput] }),
      bannedUsers: t.arg.stringList({ description: 'List of user uids' }),
      coOrganizers: t.arg.stringList({ description: 'List of group uids' }),
    },
    async authScopes(_, { id, groupUid }, { user }) {
      const creating = !id;
      if (!user) return false;
      if (user.admin) return true;

      const canCreate = Boolean(
        user.canEditGroups ||
          onBoard(user.groups.find(({ group }) => group.uid === groupUid)) ||
          user.groups.some(
            ({ group, canEditArticles }) => canEditArticles && group.uid === groupUid,
          ),
      );

      if (creating) return canCreate;

      const event = await prisma.event.findUnique({
        where: { id },
        include: { managers: { include: { user: true } } },
      });

      if (!event) return false;

      return Boolean(
        canCreate ||
          event.managers.some(({ user: { uid }, canEdit }) => uid === user.uid && canEdit),
      );
    },
    async resolve(
      query,
      _,
      {
        id,
        ticketGroups,
        lydiaAccountId,
        managers,
        startsAt,
        endsAt,
        tickets,
        description,
        groupUid,
        contactMail,
        links,
        location,
        title,
        visibility,
        frequency,
        coOrganizers,
        bannedUsers,
        recurringUntil,
      },
      { user },
    ) {
      if (frequency !== EventFrequency.Once && tickets.length > 0)
        throw new GraphQLError('Events with a frequency cannot have tickets');

      // TODO send only notifications to people that have canSeeTicket(..., people)  on tickets that changed the shotgun date, and say that the shotgun date changed in the notification
      const shotgunChanged = !id;

      const connectFromListOfUids = (uids: string[]) => uids.map((uid) => ({ uid }));
      const connectFromListOfIds = (ids: string[]) => ids.map((id) => ({ id }));

      const managersWithUserId = await Promise.all(
        managers.map(async (manager) => ({
          ...manager,
          userId: await prisma.user
            .findUnique({ where: { uid: manager.userUid } })
            .then((user) => user?.id ?? ''),
        })),
      );

      const oldEvent = id
        ? await prisma.event.findUnique({ where: { id }, include: { managers: true } })
        : undefined;

      if (id && !oldEvent) throw new Error(`Event ${id} does not exist`);

      const group = await prisma.group.findUnique({ where: { uid: groupUid } });
      if (!group) throw new Error(`Group ${groupUid} does not exist`);

      // 1. Update regular event information
      const event = await prisma.event.upsert({
        ...query,
        where: { id: id ?? '' },
        create: {
          uid: await createUid({ title, groupId: group.id }),
          description,
          group: { connect: { uid: groupUid } },
          contactMail,
          links: { create: links },
          beneficiary: lydiaAccountId ? { connect: { id: lydiaAccountId } } : undefined,
          location,
          title,
          visibility,
          frequency,
          recurringUntil,
          startsAt,
          endsAt,
          managers: {
            create: managers.map((manager) => ({
              user: { connect: { uid: manager.userUid } },
              canEdit: manager.canEdit,
              canEditPermissions: manager.canEditPermissions,
              canVerifyRegistrations: manager.canVerifyRegistrations,
            })),
          },
          coOrganizers: {
            connect: connectFromListOfUids(coOrganizers),
          },
          bannedUsers: {
            connect: connectFromListOfUids(bannedUsers),
          },
        },
        update: {
          description,
          contactMail,
          links: { deleteMany: {}, create: links },
          beneficiary: lydiaAccountId ? { connect: { id: lydiaAccountId } } : { disconnect: true },
          location,
          title,
          visibility,
          frequency,
          recurringUntil,
          startsAt,
          endsAt,
          coOrganizers: {
            connect: connectFromListOfUids(coOrganizers),
          },
          bannedUsers: {
            connect: connectFromListOfUids(bannedUsers),
          },
          managers:
            user?.admin ||
            oldEvent?.managers.some((m) => m.userId === user?.id && m.canEditPermissions)
              ? {
                  deleteMany: { userId: { notIn: managersWithUserId.map((m) => m.userId) } },
                  upsert: managersWithUserId.map(
                    ({
                      userUid: uid,
                      userId,
                      canEdit,
                      canEditPermissions,
                      canVerifyRegistrations,
                    }) => ({
                      where: { eventId_userId: { eventId: id!, userId } },
                      create: {
                        user: { connect: { uid } },
                        canEdit,
                        canEditPermissions,
                        canVerifyRegistrations,
                      },
                      update: {
                        canEdit,
                        canEditPermissions,
                        canVerifyRegistrations,
                      },
                    }),
                  ),
                }
              : undefined,
        },
      });

      // 2. Delete tickets that are not in the list
      await prisma.ticket.deleteMany({
        where: {
          event: { id: event.id },
          id: {
            notIn: tickets.map(({ id }) => id).filter(Boolean) as string[],
          },
        },
      });

      // 3. Delete ticket groups that are not in the list
      await prisma.ticketGroup.deleteMany({
        where: {
          event: { id: event.id },
          id: {
            notIn: ticketGroups.map(({ id }) => id).filter(Boolean) as string[],
          },
        },
      });

      // 4. Upsert ticket groups, without setting tickets yet
      for (const ticketGroup of ticketGroups) {
        const newTicketGroup = await prisma.ticketGroup.upsert({
          where: { id: ticketGroup.id ?? '' },
          create: {
            ...ticketGroup,
            id: undefined,
            tickets: undefined,
            event: { connect: { id: event.id } },
          },
          update: {
            ...ticketGroup,
            id: undefined,
            tickets: undefined,
          },
        });
        ticketGroup.id = newTicketGroup.id;
      }

      // 5. Upsert tickets, setting their group
      for (const ticket of tickets) {
        const ticketGroupId = ticket.groupName
          ? ticketGroups.find((tg) => tg.name === ticket.groupName)!.id
          : undefined;
        delete ticket.groupName;
        await prisma.ticket.upsert({
          where: { id: ticket.id ?? '' },
          create: {
            ...ticket,
            uid: await createTicketUid({
              ...ticket,
              eventId: event.id,
              ticketGroupId,
              ticketGroupName: ticket.groupName,
            }),
            id: undefined,
            group: ticketGroupId ? { connect: { id: ticketGroupId } } : undefined,
            event: { connect: { id: event.id } },
            links: { create: ticket.links },
            // connections
            openToGroups: { connect: connectFromListOfUids(ticket.openToGroups) },
            openToSchools: { connect: connectFromListOfUids(ticket.openToSchools) },
            openToMajors: { connect: connectFromListOfIds(ticket.openToMajors) },
            autojoinGroups: { connect: connectFromListOfUids(ticket.autojoinGroups) },
          },
          update: {
            ...ticket,
            id: undefined,
            group: ticketGroupId ? { connect: { id: ticketGroupId } } : { disconnect: true },
            links: {
              deleteMany: {},
              create: ticket.links,
            },
            // connections
            openToGroups: { set: connectFromListOfUids(ticket.openToGroups) },
            openToSchools: { set: connectFromListOfUids(ticket.openToSchools) },
            openToMajors: { set: connectFromListOfIds(ticket.openToMajors) },
            autojoinGroups: { set: connectFromListOfUids(ticket.autojoinGroups) },
          },
        });
      }

      const result = await prisma.event.findUniqueOrThrow({
        ...query,
        where: { id: event.id },
      });

      const finalEvent = await prisma.event.findUniqueOrThrow({
        where: { id: event.id },
        include: {
          tickets: true,
          group: true,
          ticketGroups: {
            include: {
              tickets: true,
            },
          },
        },
      });

      await prisma.logEntry.create({
        data: {
          area: 'event',
          action: id ? 'update' : 'create',
          target: event.id,
          message: `${id ? 'Updated' : 'Created'} event ${event.id}: ${JSON.stringify(finalEvent)}`,
          user: user ? { connect: { id: user.id } } : undefined,
        },
      });

      if (shotgunChanged) await scheduleShotgunNotifications(finalEvent);

      return result;
    },
  }),
);

export async function eventAccessibleByUser(
  event:
    | (EventPrisma & {
        coOrganizers: Array<{
          id: string;
          uid: string;
          studentAssociation?: null | { school: { uid: string } };
        }>;
        group: {
          studentAssociation?: null | { school: { uid: string } };
        };
        managers: Array<{
          user: { uid: string };

          canEdit: boolean;
          canEditPermissions: boolean;
          canVerifyRegistrations: boolean;
        }>;
        tickets: Array<{ openToExternal: boolean | null }>;
      })
    | null,
  user: Context['user'],
): Promise<boolean> {
  if (user?.admin) return true;

  if (event?.tickets.some(({ openToExternal }) => openToExternal)) return true;

  switch (event?.visibility) {
    case Visibility.Public:
    case Visibility.Unlisted: {
      return true;
    }

    case Visibility.SchoolRestricted: {
      if (!user) return false;
      if (eventManagedByUser(event, user, {})) return true;
      return Boolean(
        [event.group, ...event.coOrganizers]
          .map((g) => g.studentAssociation?.school.uid)
          .filter(Boolean)
          .some((schoolUid) => user.major?.schools.some((s) => s.uid === schoolUid!)),
      );
    }

    case Visibility.GroupRestricted: {
      if (!user) return false;
      // All managers can see the event, no matter their permissions
      if (eventManagedByUser(event, user, {})) return true;

      const ancestors = await prisma.group
        .findMany({
          where: { familyId: { in: user.groups.map(({ group }) => group.familyId ?? group.id) } },
          select: { id: true, parentId: true },
        })
        .then((groups) => mappedGetAncestors(groups, user.groups, { mappedKey: 'groupId' }))
        .then((groups) => groups.flat());

      return Boolean(
        ancestors.some(({ id }) =>
          [event.groupId, ...event.coOrganizers.map((g) => g.id)].includes(id),
        ),
      );
    }

    case Visibility.Private: {
      // All managers can see the event, no matter their permissions
      return eventManagedByUser(event, user, {});
    }

    default: {
      return false;
    }
  }
}

export function eventManagedByUser(
  event: EventPrisma & {
    managers: Array<{
      user: { uid: string };

      canEdit: boolean;
      canEditPermissions: boolean;
      canVerifyRegistrations: boolean;
    }>;
  },
  user: Context['user'],
  required: { canEdit?: boolean; canEditPermissions?: boolean; canVerifyRegistrations?: boolean },
) {
  if (!user) return false;
  return Boolean(
    user.groups.some(({ groupId, canScanEvents }) => {
      if (groupId === event.groupId) return false;
      if (required.canVerifyRegistrations && !canScanEvents) return false;
      return true;
    }) ||
      event.managers.some(({ user: { uid }, ...permissions }) => {
        if (uid !== user.uid) return false;
        if (required.canEdit && !permissions.canEdit) return false;
        if (required.canEditPermissions && !permissions.canEditPermissions) return false;
        if (required.canVerifyRegistrations && !permissions.canVerifyRegistrations) return false;
        return true;
      }),
  );
}

builder.queryField('searchEvents', (t) =>
  t.prismaField({
    type: [EventType],
    args: {
      q: t.arg.string(),
      groupUid: t.arg.string({ required: false }),
    },
    async resolve(query, _, { q, groupUid }, { user }) {
      const group = groupUid
        ? await prisma.group.findUniqueOrThrow({ where: { uid: groupUid }, select: { id: true } })
        : undefined;

      const matches = await fullTextSearch('Event', q, {
        fuzzy: ['title'],
        highlight: ['description', 'title'],
        additionalClauses: group ? { groupId: group.id } : {},
      });

      const events = await prisma.event.findMany({
        ...query,
        where: {
          AND: [
            {
              id: { in: matches.map(({ id }) => id) },
            },
            visibleEventsPrismaQuery(user),
          ],
        },
        include: {
          coOrganizers: { include: { studentAssociation: { include: { school: true } } } },
          group: { include: { studentAssociation: { include: { school: true } } } },
          managers: {
            include: {
              user: true,
            },
          },
        },
      });
      return sortWithMatches(highlightProperties(events, matches, ['description']), matches).map(
        ({ object }) => object,
      );
    },
  }),
);

export async function createUid({ title, groupId }: { title: string; groupId: string }) {
  const base = slug(title);
  const n = await dichotomid(
    async (n) =>
      !(await prisma.event.findUnique({
        where: { groupId_uid: { groupId, uid: `${base}${n > 1 ? `-${n}` : ''}` } },
      })),
  );
  return `${base}${n > 1 ? `-${n}` : ''}`;
}

builder.mutationField('updateEventPicture', (t) =>
  t.field({
    type: 'String',
    args: {
      id: t.arg.id(),
      file: t.arg({ type: FileScalar }),
    },
    async authScopes(_, { id }, { user }) {
      const event = await prisma.event.findUniqueOrThrow({
        where: { id },
      });

      return Boolean(
        // Who can edit this event?
        // The author
        user?.id === event.authorId ||
          // Other authors of the group
          user?.groups.some(
            ({ groupId, canEditArticles }) => canEditArticles && groupId === event.groupId,
          ),
      );
    },
    async resolve(_, { id, file }) {
      return updatePicture({
        resource: 'event',
        folder: 'events',
        extension: 'jpg',
        file,
        identifier: id,
      });
    },
  }),
);

builder.mutationField('deleteEventPicture', (t) =>
  t.field({
    type: 'Boolean',
    args: {
      id: t.arg.id(),
    },
    async authScopes(_, { id }, { user }) {
      const event = await prisma.event.findUniqueOrThrow({
        where: { id },
      });

      return Boolean(
        // Who can edit this event?
        // The author
        user?.id === event.authorId ||
          // Other authors of the group
          user?.groups.some(
            ({ groupId, canEditArticles }) => canEditArticles && groupId === event.groupId,
          ),
      );
    },
    async resolve(_, { id }) {
      const { pictureFile } = await prisma.event.findUniqueOrThrow({
        where: { id },
        select: { pictureFile: true },
      });

      const root = new URL(process.env.STORAGE).pathname;

      if (pictureFile) await unlink(join(root, pictureFile));
      await prisma.event.update({ where: { id }, data: { pictureFile: '' } });
      return true;
    },
  }),
);

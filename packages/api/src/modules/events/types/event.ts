import { builder, htmlToText, prisma, soonest, subscriptionName, toHtml } from '#lib';
import { DateTimeScalar, VisibilityEnum } from '#modules/global';
import { ProfitsBreakdownType } from '#modules/payments';
import { BooleanMapScalar, CountsScalar } from '#modules/reactions';
import { RegistrationsCountsType, TicketType } from '#modules/ticketing';
import {
  getTicketsWithConstraints,
  getUserWithContributesTo,
  prismaQueryAccessibleArticles,
  userCanSeeTicket,
} from '#permissions';
import { PaymentMethod } from '@prisma/client';
import { EventFrequencyType, eventCapacity } from '../index.js';

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
    tickets: t.prismaField({
      type: [TicketType],
      async resolve(query, { id }, _, { user }) {
        const allTickets = await getTicketsWithConstraints(id, query);
        const userWithContributesTo = user ? await getUserWithContributesTo(user.id) : undefined;
        return allTickets.filter((ticket) => userCanSeeTicket(ticket, userWithContributesTo));
      },
    }),
    ticketGroups: t.relation('ticketGroups'),
    articles: t.relation('articles', {
      query: (_, { user }) => ({ where: prismaQueryAccessibleArticles(user, 'wants') }),
    }),
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
      subscribe: (subs, { id }) => {
        subs.register(subscriptionName(id));
      },
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
      subscribe: (subs, { id }) => {
        subs.register(subscriptionName(id));
      },
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

import { builder, htmlToText, prisma, toHtml } from '#lib';
import { DateTimeScalar, PicturedInterface, VisibilityEnum } from '#modules/global';
import { LogType } from '#modules/logs';
import { ProfitsBreakdownType } from '#modules/payments';
import { BooleanMapScalar, CountsScalar, ReactableInterface } from '#modules/reactions';
import {
  prismaQueryAccessibleArticles
} from '#permissions';
import { PaymentMethod } from '@churros/db/prisma';
import { EventFrequencyType, eventCapacity } from '../index.js';
import { canEdit, canEditManagers, canSeeEventLogs } from '../utils/index.js';

export const EventType = builder.prismaNode('Event', {
  id: { field: 'id' },
  include: { managers: true, group: true, tickets: true },
  interfaces: [
    PicturedInterface,
    //@ts-expect-error dunno why it complainnns
    ReactableInterface,
  ],
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
    uid: t.exposeString('slug', {
      deprecationReason: 'Use `slug` instead. This field was never universally unique.',
    }),
    slug: t.exposeString('slug', {
      description: 'Un nom lisible sans espaces, adaptés pour des URLs.',
    }),
    title: t.exposeString('title'),
    startsAt: t.expose('startsAt', { type: DateTimeScalar }),
    frequency: t.expose('frequency', { type: EventFrequencyType }),
    recurringUntil: t.expose('recurringUntil', { type: DateTimeScalar, nullable: true }),
    endsAt: t.expose('endsAt', { type: DateTimeScalar }),
    location: t.exposeString('location'),
    visibility: t.expose('visibility', { type: VisibilityEnum }),
    managers: t.relation('managers'),
    bannedUsers: t.relation('bannedUsers'),
    ticketGroups: t.relation('ticketGroups'),
    articles: t.relation('articles', {
      query: (_, { user }) => ({ where: prismaQueryAccessibleArticles(user, 'wants') }),
    }),
    group: t.relation('group'),
    coOrganizers: t.relation('coOrganizers'),
    links: t.relation('links'),
    author: t.relation('author', { nullable: true }),
    pictureFile: t.exposeString('pictureFile'),
    includeInKiosk: t.exposeBoolean('includeInKiosk', {
      description: "Vrai si l'évènement doit apparaître dans le mode kiosque",
    }),
    showPlacesLeft: t.exposeBoolean('showPlacesLeft', {
      description: 'Vrai si le nombre de places restantes doit être affiché',
    }),

    reacted: t.boolean({
      args: { emoji: t.arg.string() },
      async resolve({ id }, { emoji }, { user }) {
        if (!user) return false;
        return Boolean(
          await prisma.reaction.findFirst({
            where: {
              eventId: id,
              emoji,
              authorId: user.id,
            },
          }),
        );
      },
    }),
    reactions: t.int({
      args: { emoji: t.arg.string() },
      async resolve({ id }, { emoji }) {
        return prisma.reaction.count({
          where: {
            eventId: id,
            emoji,
          },
        });
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
    canEdit: t.boolean({
      description: "L'utilisateur·ice connecté·e peut modifier cet évènement",
      resolve: (event, _, { user }) => canEdit(event, user),
    }),
    canEditManagers: t.boolean({
      description:
        "L'utilisateur·ice connecté·e peut ajouter, enlever ou modifier les droits des managers de cet évènement",
      resolve: (event, _, { user }) => canEditManagers(event, user),
    }),
    canSeeLogs: t.boolean({
      description: "L'utilsateur·ice connecté·e peut voir les logs de cet évènement",
      resolve: (event, _, { user }) => canSeeEventLogs(event, user),
    }),
    logs: t.prismaConnection({
      description:
        'Logs concernant cet évènement. Ne contient pas les logs concernant les réservations.',
      type: LogType,
      cursor: 'id',
      authScopes: (event, _, { user }) => canSeeEventLogs(event, user),
      resolve: async (query, { id }) =>
        prisma.logEntry.findMany({
          ...query,
          where: {
            area: 'event',
            target: id,
          },
        }),
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

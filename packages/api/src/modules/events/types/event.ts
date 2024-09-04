import { builder, htmlToText, prisma, toHtml } from '#lib';
import {
  DateTimeScalar,
  HTMLScalar,
  PicturedInterface,
  URLScalar,
  VisibilityEnum,
} from '#modules/global';
import { LogType } from '#modules/logs';
import { ProfitsBreakdownType, PromotionTypeEnum } from '#modules/payments';
import { BooleanMapScalar, CountsScalar, ReactableInterface } from '#modules/reactions';
import { prismaQueryAccessibleArticles } from '#permissions';
import { PaymentMethod } from '@churros/db/prisma';
import { GraphQLError } from 'graphql';
import { ShareableInterface } from '../../global/types/shareable.js';
import { CapacityScalar, EventFrequencyType, eventCapacity } from '../index.js';
import { canEditEvent, canEditManagers, canSeeEventLogs } from '../utils/index.js';

export const EventType = builder.prismaNode('Event', {
  id: { field: 'id' },
  include: { managers: true, group: true, tickets: true, links: true, reactions: true },
  interfaces: [
    PicturedInterface,
    ReactableInterface,
    //@ts-expect-error dunno why it complainnns
    ShareableInterface,
  ],
  fields: (t) => ({
    authorId: t.exposeID('authorId', { nullable: true }),
    groupId: t.exposeID('groupId'),
    createdAt: t.expose('createdAt', { type: DateTimeScalar }),
    updatedAt: t.expose('updatedAt', { type: DateTimeScalar, nullable: true }),
    // TODO store contactDetails in db instead, that is any link
    // allow mailto: and tel: links
    // and derive contactMail, contactPhone and contactURL from that
    contactMail: t.exposeString('contactMail'),
    beneficiary: t.relation('beneficiary', { nullable: true }),
    lydiaAccountId: t.exposeID('lydiaAccountId', { nullable: true }),
    description: t.exposeString('description'),
    descriptionHtml: t.field({
      type: HTMLScalar,
      resolve: async ({ description }) => toHtml(description),
    }),
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
    startsAt: t.expose('startsAt', { type: DateTimeScalar, nullable: true }),
    frequency: t.expose('frequency', { type: EventFrequencyType }),
    recurringUntil: t.expose('recurringUntil', { type: DateTimeScalar, nullable: true }),
    endsAt: t.expose('endsAt', { type: DateTimeScalar, nullable: true }),
    location: t.exposeString('location'),
    visibility: t.expose('visibility', { type: VisibilityEnum }),
    managers: t.relation('managers'),
    banned: t.relation('bannedUsers'),
    ticketGroups: t.relation('ticketGroups'),
    articles: t.relation('articles', {
      query: (_, { user }) => ({ where: prismaQueryAccessibleArticles(user, 'wants') }),
    }),
    globalCapacity: t.expose('globalCapacity', {
      nullable: true,
      type: CapacityScalar,
    }),
    group: t.relation('group', { deprecationReason: 'Use `organizer` instead.' }),
    organizer: t.relation('group'),
    coOrganizers: t.relation('coOrganizers'),
    links: t.relation('links'),
    externalTicketing: t.field({
      type: URLScalar,
      nullable: true,
      description:
        'URL vers une billetterie externe. Null si l\'évènement possède un lien à URL valide, non dynamique, nommé "billetterie" et n\'a pas de billets',
      resolve({ links, tickets }) {
        if (tickets.length > 0) return null;
        const rawURL = links.find((l) => l.name.toLowerCase() === 'billetterie')?.value;
        if (!rawURL) return null;
        if (URL.canParse(rawURL)) return new URL(rawURL);
        return null;
      },
    }),
    author: t.relation('author', { nullable: true }),
    pictureFile: t.exposeString('pictureFile'),
    includeInKiosk: t.exposeBoolean('includeInKiosk', {
      description: "Vrai si l'évènement doit apparaître dans le mode kiosque",
    }),
    showPlacesLeft: t.exposeBoolean('showPlacesLeft', {
      description: 'Vrai si le nombre de places restantes doit être affiché',
    }),
    shares: t.int({
      async resolve({ id }) {
        const {
          _count: { sharedBy },
        } = await prisma.event.findUniqueOrThrow({
          where: { id },
          select: {
            _count: { select: { sharedBy: true } },
          },
        });
        return sharedBy;
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
        const event = await prisma.event.findUniqueOrThrow({
          where: { id },
          include: eventCapacity.prismaIncludes,
        });
        return eventCapacity(event);
      },
    }),
    canEdit: t.boolean({
      description: "L'utilisateur·ice connecté·e peut modifier cet évènement",
      args: {
        assert: t.arg.string({
          required: false,
          description: "Lève une erreur avec ce message si l'utilisateur·ice n'a pas les droits",
        }),
      },
      resolve: (event, { assert }, { user }) => {
        const can = canEditEvent(event, user);
        if (assert && !can) throw new GraphQLError(assert);
        return can;
      },
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
    applicableOffers: t.field({
      type: [PromotionTypeEnum],
      description: 'Les promotions applicables à cet évènement',
      async resolve({ id }) {
        const event = await prisma.event.findUniqueOrThrow({
          where: { id },
          include: { applicableOffers: true },
        });
        return event.applicableOffers.map((o) => o.type);
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
          regs.reduce((acc, r) => acc + (r.paid ? (r.wantsToPay ?? r.ticket.minimumPrice) : 0), 0);

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

import { builder, prisma, subscriptionName, toHtml } from '#lib';
import { DateTimeScalar } from '#modules/global';
import { PaymentMethodEnum, priceWithPromotionsApplied as actualPrice } from '#modules/payments';
import { PaymentMethod } from '@prisma/client';
import { placesLeft } from '../index.js';

export const TicketType = builder.prismaNode('Ticket', {
  id: { field: 'id' },
  include: {
    group: true,
  },
  fields: (t) => ({
    eventId: t.exposeID('eventId'),
    uid: t.exposeString('uid'),
    ticketGroupId: t.exposeID('ticketGroupId', { nullable: true }),
    name: t.exposeString('name'),
    fullName: t.string({
      description: "Full name, including the ticket group's name if any",
      resolve({ name, group }) {
        return group ? `${group.name} - ${name}` : name;
      },
    }),
    description: t.exposeString('description'),
    descriptionHtml: t.string({ resolve: async ({ description }) => toHtml(description) }),
    opensAt: t.expose('opensAt', { type: DateTimeScalar, nullable: true }),
    closesAt: t.expose('closesAt', { type: DateTimeScalar, nullable: true }),
    basePrice: t.exposeFloat('price'),
    price: t.float({
      async resolve({ price, id }, _, { user }) {
        const { event } = await prisma.ticket.findUniqueOrThrow({
          where: { id },
          include: { event: { include: { group: true } } },
        });
        return actualPrice({ price, id, event }, user);
      },
    }),

    capacity: t.exposeInt('capacity'),
    registrations: t.relation('registrations', {
      authScopes: { loggedIn: true },
      query(_, { user }) {
        if (!user) return { where: { OR: [] } };
        if (user.admin) return {};

        return {
          where: {
            OR: [
              { author: { uid: user.uid } },
              { beneficiary: user.uid },
              { ticket: { event: { managers: { some: { user: { uid: user.uid } } } } } },
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
    order: t.exposeInt('order'),
    remainingGodsons: t.int({
      async resolve({ godsonLimit, eventId }, _, { user }) {
        // No godsons for external users, since godson limits can't be reasonably enforced
        if (!user?.major) return 0;
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
      subscribe(subs, { id }) {
        subs.register(subscriptionName(id));
      },
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

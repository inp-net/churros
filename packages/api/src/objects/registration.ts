import { PaymentMethod as PaymentMethodPrisma } from '@prisma/client';
import { builder } from '../builder.js';
import { DateTimeScalar } from './scalars.js';
import { prisma } from '../prisma.js';
import { eventAccessibleByUser, eventManagedByUser } from './events.js';
import { placesLeft } from './tickets.js';
import { GraphQLError } from 'graphql';

export const PaymentMethodEnum = builder.enumType(PaymentMethodPrisma, {
  name: 'PaymentMethod',
});

export const RegistrationType = builder.prismaNode('Registration', {
  id: { field: 'id' },
  fields: (t) => ({
    ticketId: t.exposeID('ticketId'),
    authorId: t.exposeID('authorId'),
    beneficiary: t.exposeString('beneficiary'),
    createdAt: t.expose('createdAt', { type: DateTimeScalar }),
    updatedAt: t.expose('updatedAt', { type: DateTimeScalar }),
    paymentMethod: t.expose('paymentMethod', { type: PaymentMethodEnum }),
    paid: t.exposeBoolean('paid'),
    ticket: t.relation('ticket'),
    author: t.relation('author'),
    authorIsBeneficiary: t.boolean({
      async resolve({ authorId, beneficiary }) {
        const author = await prisma.user.findUnique({ where: { id: authorId } });
        return author?.uid === beneficiary;
      },
    }),
  }),
});

builder.queryField('registration', (t) =>
  t.prismaField({
    type: RegistrationType,
    args: {
      id: t.arg.id(),
    },
    resolve: async (query, _, { id }, { user }) =>
      prisma.registration.findFirstOrThrow({
        ...query,
        where: {
          id,
          ticket: {
            event: {
              managers: {
                some: {
                  userId: user?.id,
                },
              },
            },
          },
        },
      }),
  })
);

builder.queryField('registrationsOfEvent', (t) =>
  t.prismaConnection({
    type: RegistrationType,
    cursor: 'id',
    args: {
      event: t.arg.id(),
    },
    authScopes: (_, { event }, { user }) =>
      Boolean(
        user?.managedEvents.some(
          ({ event: { id }, canVerifyRegistrations }) => id === event && canVerifyRegistrations
        )
      ),
    async resolve(query, _, { event }) {
      return prisma.registration.findMany({
        ...query,
        where: { ticket: { event: { id: event } } },
      });
    },
  })
);

builder.queryField('registrationsOfTicket', (t) =>
  t.prismaConnection({
    type: RegistrationType,
    cursor: 'id',
    args: {
      ticket: t.arg.id(),
    },
    async resolve(query, _, { ticket }) {
      return prisma.registration.findMany({
        ...query,
        where: { ticket: { id: ticket } },
      });
    },
  })
);

builder.queryField('verifyRegistration', (t) =>
  t.prismaField({
    type: RegistrationType,
    args: {
      beneficiary: t.arg.string(),
      ticketId: t.arg.id(),
    },
    async authScopes(_, { ticketId }, { user }) {
      const event = await prisma.ticket.findUnique({ where: { id: ticketId } }).event();
      if (!event) return false;
      return eventManagedByUser(event, user, { canVerifyRegistrations: true });
    },
    async resolve(query, {}, { beneficiary, ticketId }, {}) {
      return prisma.registration.findFirstOrThrow({
        ...query,
        where: { ticketId, beneficiary },
      });
    },
  })
);

builder.mutationField('upsertRegistration', (t) =>
  t.prismaField({
    type: RegistrationType,
    args: {
      id: t.arg.id(),
      ticketId: t.arg.id(),
      paid: t.arg.boolean(),
      beneficiary: t.arg.string({ required: false }),
      paymentMethod: t.arg({ type: PaymentMethodEnum }),
    },
    async authScopes(_, { ticketId, id }, { user }) {
      const creating = !id;
      if (!user) return false;

      if (creating) {
        const ticket = await prisma.ticket.findUnique({
          where: { id: ticketId },
          include: { event: true },
        });
        if (!ticket) return false;

        // Check that the user can access the event
        if (!(await eventAccessibleByUser(ticket.event, user))) return false;

        // Check for tickets that only managers can provide
        if (
          ticket.onlyManagersCanProvide &&
          !eventManagedByUser(ticket.event, user, { canVerifyRegistrations: true })
        )
          return false;

        // Check that the ticket is still open
        if (ticket.closesAt && ticket.closesAt.valueOf() < Date.now()) return false;

        // Check that the ticket is not full
        const ticketAndRegistrations = await prisma.ticket.findUnique({
          where: { id: ticketId },
          include: {
            registrations: true,
            group: { include: { tickets: { include: { registrations: true } } } },
          },
        });
        return placesLeft(ticketAndRegistrations!) > 0;
      }

      // We are updating an existing registration. The permissions required are totally different.
      const registration = await prisma.registration.findUnique({
        where: { id },
        include: { ticket: { include: { event: true } } },
      });
      if (!registration) return false;
      if (!eventManagedByUser(registration.ticket.event, user, { canVerifyRegistrations: true }))
        return false;
      return true;
    },
    async resolve(query, {}, { id, ticketId, beneficiary, paymentMethod, paid }, { user }) {
      if (!paid) {
        const ticket = await prisma.ticket.findUniqueOrThrow({
          where: { id: ticketId },
          include: { event: { include: { beneficiary: true } } },
        });
        await pay(user!, ticket.event.beneficiary, ticket.price, paymentMethod);
      }

      return prisma.registration.upsert({
        ...query,
        where: { id },
        update: {
          paymentMethod,
          beneficiary: beneficiary || user?.uid,
          paid,
        },
        create: {
          ticket: { connect: { id: ticketId } },
          author: { connect: { id: user?.id } },
          paymentMethod,
          beneficiary: beneficiary || user?.uid,
        },
      });
    },
  })
);

builder.mutationField('deleteRegistration', (t) =>
  t.field({
    type: 'Boolean',
    args: {
      id: t.arg.id(),
    },
    async authScopes(_, { id }, { user }) {
      if (!user) return false;
      const registration = await prisma.registration.findFirst({
        where: { id },
        include: { ticket: { include: { event: true } }, author: true },
      });
      if (!registration) return false;

      // Only managers can delete other's registrations
      if (registration.author.uid !== user.uid) {
        return eventManagedByUser(registration.ticket.event, user, {
          canVerifyRegistrations: true,
        });
      }

      // The author can delete their own registrations
      return true;
    },
    async resolve(_, { id }, {}) {
      const registration = await prisma.registration.findFirstOrThrow({
        where: { id },
        include: { ticket: true, author: true, event: { include: { beneficiary: true } } },
      });
      if (registration.paid) {
        await pay(
          registration.event.beneficiary,
          registration.author,
          registration.ticket.price,
          registration.paymentMethod
        );
      }

      await prisma.registration.deleteMany({
        where: { id },
      });
      return true;
    },
  })
);

async function pay(
  from: { uid: string },
  to: { uid: string },
  amount: number,
  by: PaymentMethodPrisma
) {
  return new Promise((_resolve, reject) => {
    reject(
      new GraphQLError(
        `Attempt to pay ${to.uid} ${amount} from ${from.uid} by ${by}: not implemented`
      )
    );
  });
}

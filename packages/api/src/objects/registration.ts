import { PaymentMethod as PaymentMethodPrisma } from '@prisma/client';
import { builder } from '../builder';
import { DateTimeScalar } from './scalars';
import { prisma } from '../prisma';
import { eventAccessibleByUser } from './events';

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
        // don't know why it thinks { id: authorId } is an unsafe assignement, as authorId is a string and id is a string | undefined
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
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
            Event: {
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
        where: { ticket: { Event: { id: event } } },
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

builder.mutationField('createRegistration', (t) =>
  t.prismaField({
    type: RegistrationType,
    args: {
      ticketId: t.arg.id(),
      beneficiary: t.arg.string({ required: false }),
      paymentMethod: t.arg({ type: PaymentMethodEnum }),
    },
    async authScopes(_, { ticketId }, { user }) {
      if (!user) return false;

      const event = await prisma.ticket.findUnique({ where: { id: ticketId } }).event();
      return eventAccessibleByUser(event, user);
    },
    resolve: async (query, {}, { ticketId, beneficiary, paymentMethod }, { user }) =>
      prisma.registration.create({
        ...query,
        data: {
          ticket: { connect: { id: ticketId } },
          author: { connect: { id: user?.id } },
          paymentMethod,
          beneficiary: beneficiary || user?.uid,
        },
      }),
  })
);

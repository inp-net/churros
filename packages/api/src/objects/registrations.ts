import { PaymentMethod as PaymentMethodPrisma } from '@prisma/client';
import { builder } from '../builder.js';
import { DateTimeScalar } from './scalars.js';
import { prisma } from '../prisma.js';
import { eventAccessibleByUser, eventManagedByUser } from './events.js';
import { sendLydiaPaymentRequest } from '../services/lydia.js';
import { placesLeft, userCanSeeTicket } from './tickets.js';
import { GraphQLError } from 'graphql';
import { UserType, fullName } from './users.js';

export const PaymentMethodEnum = builder.enumType(PaymentMethodPrisma, {
  name: 'PaymentMethod',
});

export const RegistrationType = builder.prismaNode('Registration', {
  id: { field: 'id' },
  fields: (t) => ({
    ticketId: t.exposeID('ticketId'),
    authorId: t.exposeID('authorId'),
    beneficiary: t.exposeString('beneficiary'),
    beneficiaryUser: t.field({
      type: UserType,
      nullable: true,
      async resolve({ beneficiary }) {
        // eslint-disable-next-line unicorn/no-null
        if (!beneficiary) return null;
        return prisma.user.findUnique({ where: { uid: beneficiary } });
      },
    }),
    createdAt: t.expose('createdAt', { type: DateTimeScalar }),
    updatedAt: t.expose('updatedAt', { type: DateTimeScalar }),
    paymentMethod: t.expose('paymentMethod', { type: PaymentMethodEnum, nullable: true }),
    paid: t.exposeBoolean('paid'),
    ticket: t.relation('ticket'),
    author: t.relation('author'),
    authorIsBeneficiary: t.boolean({
      async resolve({ authorId, beneficiary }) {
        const author = await prisma.user.findUnique({ where: { id: authorId } });
        if (!author) return false;
        return authorIsBeneficiary({ ...author, fullName: fullName(author) }, beneficiary);
      },
    }),
  }),
});

export function authorIsBeneficiary(
  author: { uid: string; fullName: string; firstName: string; lastName: string },
  beneficiary: string
) {
  return (
    !beneficiary.trim() ||
    author.uid === beneficiary ||
    author.fullName === beneficiary ||
    `${author.firstName} ${author.lastName}` === beneficiary
  );
}

builder.queryField('registration', (t) =>
  t.prismaField({
    type: RegistrationType,
    errors: {},
    args: {
      id: t.arg.id(),
    },
    async resolve(query, _, { id }, { user }) {
      if (!user) throw new GraphQLError('Not logged in');
      return prisma.registration.findFirstOrThrow({
        ...query,
        where: {
          id,
          OR: [
            {
              ticket: {
                event: {
                  managers: {
                    some: {
                      userId: user.id,
                    },
                  },
                },
              },
            },
            {
              authorId: user.id,
            },
            {
              beneficiary: user.uid,
            },
            {
              beneficiary: user.fullName,
            },
          ],
        },
      });
    },
  })
);

builder.queryField('registrationOfUser', (t) =>
  t.prismaField({
    type: RegistrationType,
    args: {
      eventUid: t.arg.string(),
      beneficiary: t.arg.string({ required: false }),
    },
    async resolve(query, _, { eventUid, beneficiary: argBeneficiary }, { user }) {
      if (!user) throw new GraphQLError('User not found');
      const registrations = await prisma.registration.findMany({
        include: {
          ...query.include,
          author: query.include && 'author' in query.include ? query.include.author : true,
        },
        where: { ticket: { event: { uid: eventUid } } },
      });

      const registration = registrations.find(
        ({ author, beneficiary }) =>
          author.uid === user.uid &&
          (authorIsBeneficiary({ ...author, fullName: fullName(author) }, beneficiary) ||
            beneficiary === argBeneficiary)
      );

      if (!registration) throw new GraphQLError('Registration not found');
      return registration;
    },
  })
);

builder.queryField('registrationsOfUser', (t) =>
  t.prismaConnection({
    type: RegistrationType,
    cursor: 'id',
    args: {
      userUid: t.arg.string(),
    },
    authScopes(_, { userUid }, { user }) {
      if (!user) throw new GraphQLError('User not found');
      return Boolean(user.admin || user.uid === userUid);
    },
    async resolve(query, _, { userUid }, { user: me }) {
      if (!me) throw new GraphQLError('Not logged in');
      const user = await prisma.user.findUnique({ where: { uid: userUid } });
      if (!user) throw new GraphQLError('User not found');
      return prisma.registration.findMany({
        ...query,
        where: {
          OR: [
            { author: { uid: userUid } },
            { beneficiary: userUid },
            { beneficiary: fullName(user) },
          ],
        },
      });
    },
  })
);

builder.queryField('registrationsOfEvent', (t) =>
  t.prismaConnection({
    type: RegistrationType,
    cursor: 'id',
    args: {
      groupUid: t.arg.string(),
      eventUid: t.arg.string(),
    },
    authScopes(_, { eventUid, groupUid }, { user }) {
      return Boolean(
        user?.admin ||
          user?.managedEvents.some(
            ({ event: { uid, group } }) => uid === eventUid && group.uid === groupUid
          )
      );
    },
    async resolve(query, _, { eventUid, groupUid }) {
      return prisma.registration.findMany({
        ...query,
        where: { ticket: { event: { uid: eventUid, group: { uid: groupUid } } } },
      });
    },
  })
);

builder.queryField('registrationsOfUserForEvent', (t) =>
  t.prismaField({
    type: [RegistrationType],
    errors: {},
    args: {
      groupUid: t.arg.string(),
      eventUid: t.arg.string(),
      userUid: t.arg.string(),
    },
    async authScopes(_, { eventUid, userUid, groupUid }, { user }) {
      if (!user) return false;
      if (user.uid === userUid) return true;
      const group = await prisma.group.findUnique({ where: { uid: groupUid } });
      if (!group) return false;
      const event = await prisma.event.findUnique({
        where: { groupId_uid: { groupId: group.id, uid: eventUid } },
      });
      if (!event) return false;
      return eventManagedByUser(event, user, { canVerifyRegistrations: true });
    },
    async resolve(query, _, { eventUid, groupUid, userUid }, {}) {
      return prisma.registration.findMany({
        ...query,
        where: {
          ticket: {
            event: {
              uid: eventUid,
              group: {
                uid: groupUid,
              },
            },
          },
          OR: [
            {
              author: {
                uid: userUid,
              },
            },
            {
              beneficiary: userUid,
            },
          ],
        },
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
    errors: {},
    args: {
      id: t.arg.id({ required: false }),
      ticketId: t.arg.id(),
      paid: t.arg.boolean(),
      beneficiary: t.arg.string({ required: false }),
      paymentMethod: t.arg({ type: PaymentMethodEnum, required: false }),
    },
    async authScopes(_, { ticketId, id, paid }, { user }) {
      const creating = !id;
      if (!user) return false;
      const ticket = await prisma.ticket.findUnique({
        where: { id: ticketId },
        include: {
          event: {
            include: {
              group: {
                include: {
                  school: true,
                  studentAssociation: true,
                },
              },
            },
          },
          openToGroups: true,
          openToSchools: true,
          openToMajors: true,
        },
      });
      if (!ticket) return false;

      // Only managers can mark a registration as paid
      if (
        ticket.price > 0 &&
        paid &&
        !(
          user.admin ||
          user.managedEvents.some(
            ({ event: { id }, canVerifyRegistrations }) =>
              id === ticket.event.id && canVerifyRegistrations
          )
        )
      )
        return false;

      if (creating) {
        // Check that the user can access the event
        if (!(await eventAccessibleByUser(ticket.event, user))) return false;

        const userWithContributesTo = await prisma.user.findUniqueOrThrow({
          where: { id: user.id },
          include: {
            contributesTo: {
              include: {
                school: true,
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
        });

        // Check that the user can see the event
        if (!userCanSeeTicket(ticket, userWithContributesTo)) return false;

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
      if (
        !user.admin &&
        !eventManagedByUser(registration.ticket.event, user, { canVerifyRegistrations: true })
      )
        return false;
      return true;
    },
    async resolve(query, _, { id, ticketId, beneficiary, paymentMethod, paid }, { user }) {
      if (!user) throw new GraphQLError('User not found');

      if (!id) {
        const event = await prisma.event.findFirstOrThrow({
          where: { tickets: { some: { id: ticketId } } },
        });
        // Check that the user has not already registered
        const existingRegistration = await prisma.registration.findFirst({
          where: {
            ticket: { event: { id: event.id } },
            authorId: user.id,
            beneficiary: beneficiary ?? '',
          },
        });
        if (existingRegistration) throw new GraphQLError('Vous êtes déjà inscrit à cet événement');
      }

      const ticket = await prisma.ticket.findUniqueOrThrow({
        where: { id: ticketId },
        include: { event: { include: { beneficiary: true } } },
      });

      return prisma.registration.upsert({
        ...query,
        where: { id: id ?? '' },
        update: {
          // eslint-disable-next-line unicorn/no-null
          paymentMethod: paymentMethod ?? null,
          beneficiary: beneficiary ?? '',
          paid,
        },
        create: {
          ticket: { connect: { id: ticketId } },
          author: { connect: { id: user.id } },
          // eslint-disable-next-line unicorn/no-null
          paymentMethod: paymentMethod ?? null,
          beneficiary: beneficiary ?? '',
          paid: ticket.price === 0,
        },
      });
    },
  })
);

builder.mutationField('paidRegistration', (t) =>
  t.prismaField({
    type: RegistrationType,
    errors: {},
    args: {
      regId: t.arg.id(),
      beneficiary: t.arg.string({ required: false }),
      paymentMethod: t.arg({ type: PaymentMethodEnum, required: false }),
      phone: t.arg.string({ required: false }),
    },
    async authScopes(_, { regId }, { user }) {
      const creating = !regId;
      if (!user) return false;
      const registration = await prisma.registration.findUnique({
        where: { id: regId },
        include: { ticket: { include: { event: true } } },
      });
      if (!registration) throw new GraphQLError("La réservation associée n'existe pas");

      if (creating) {
        // Check that the user can access the event
        if (!(await eventAccessibleByUser(registration.ticket.event, user)))
          throw new GraphQLError("Vous n'avez pas accès à cet événement");

        // Check for tickets that only managers can provide
        if (
          registration.ticket.onlyManagersCanProvide &&
          !eventManagedByUser(registration.ticket.event, user, { canVerifyRegistrations: true })
        )
          throw new GraphQLError('Seul un·e manager peut donner cette place');

        // Check that the ticket is still open
        if (registration.ticket.closesAt && registration.ticket.closesAt.valueOf() < Date.now())
          throw new GraphQLError("Le shotgun n'est plus ouvert");

        // Check that the ticket is not full
        const ticketAndRegistrations = await prisma.ticket.findUnique({
          where: { id: registration.ticket.id },
          include: {
            registrations: true,
            group: { include: { tickets: { include: { registrations: true } } } },
          },
        });
        if (placesLeft(ticketAndRegistrations!) <= 0)
          throw new GraphQLError("Il n'y a plus de places disponibles");
      }

      return true;
    },
    async resolve(query, _, { regId, beneficiary, paymentMethod, phone }, { user }) {
      if (!user) throw new GraphQLError('User not found');

      const registration = await prisma.registration.findUnique({
        where: { id: regId },
        include: { ticket: { include: { event: true } } },
      });
      if (!registration) throw new GraphQLError('Registration not found');

      const ticket = await prisma.ticket.findUnique({
        where: { id: registration.ticket.id },
        include: { event: { include: { beneficiary: true } } },
      });
      if (!ticket) throw new GraphQLError('Ticket not found');
      if (!paymentMethod) throw new GraphQLError('Payment method not found');
      if (!phone) throw new GraphQLError('Phone not found');

      // Process payment
      await pay(
        user.uid,
        ticket.event.beneficiary?.id ?? '(unregistered)',
        ticket.price,
        paymentMethod,
        phone,
        regId
      );

      return prisma.registration.update({
        ...query,
        where: { id: regId },
        data: {
          paid: false,
          paymentMethod,
          beneficiary: beneficiary ?? '',
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
      // const registration = await prisma.registration.findFirstOrThrow({
      //   where: { id },
      //   include: {
      //     ticket: { include: { event: { include: { beneficiary: true } } } },
      //     author: true,
      //   },
      // });
      // const beneficiaryUser = await prisma.user.findUnique({
      //   where: {uid: registration.beneficiary || registration.author.uid}
      // })
      // if (
      //   registration.paid &&
      //   registration.ticket.event.beneficiary &&
      //   registration.ticket.price > 0 &&
      //   registration.paymentMethod &&
      //   beneficiaryUser
      // ) {
      //   await pay(
      //     registration.ticket.event.beneficiary.uid,
      //     registration.author.uid,
      //     registration.ticket.price,
      //     registration.paymentMethod,
      //     beneficiaryUser.phone
      //   );
      // }

      await prisma.registration.deleteMany({
        where: { id },
      });
      return true;
    },
  })
);

// eslint-disable-next-line max-params
async function pay(
  from: string,
  to: string,
  amount: number,
  by: PaymentMethodPrisma,
  phone?: string,
  registrationId?: string
) {
  switch (by) {
    case 'Lydia': {
      if (!phone) throw new GraphQLError('Missing phone number');
      return sendLydiaPaymentRequest(phone, registrationId);
    }

    default: {
      return new Promise((_resolve, reject) => {
        reject(
          new GraphQLError(`Attempt to pay ${to} ${amount} from ${from} by ${by}: not implemented`)
        );
      });
    }
  }
}

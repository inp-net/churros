import { TYPENAMES_TO_ID_PREFIXES, builder, prisma, publish } from '#lib';
import { PaymentMethod as PaymentMethodPrisma, type Registration, type User } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library.js';
import { isFuture, isPast } from 'date-fns';
import { GraphQLError } from 'graphql';
import { createTransport } from 'nodemailer';
import * as qrcodeGeneratorLib from 'qr-code-generator-lib';
import qrcode from 'qrcode';
import { yearTier } from '../date.js';
import { fullTextSearch, type SearchResult } from '../search.js';
import {
  LydiaTransactionState,
  checkLydiaTransaction,
  payEventRegistrationViaLydia,
} from '../services/lydia.js';
import {
  checkPaypalPayment,
  finishPaypalPayment,
  payEventRegistrationViaPaypal,
} from '../services/paypal.js';
import { eventAccessibleByUser, eventManagedByUser } from './events.js';
import { log } from './logs.js';
import { actualPrice } from './promotions.js';
import { DateTimeScalar } from './scalars.js';
import { placesLeft, userCanSeeTicket } from './tickets.js';
import { UserType, fullName } from './users.js';

const mailer = createTransport(process.env.SMTP_URL);

export const PaymentMethodEnum = builder.enumType(PaymentMethodPrisma, {
  name: 'PaymentMethod',
});

export const RegistrationType = builder.prismaNode('Registration', {
  id: { field: 'id' },
  fields: (t) => ({
    code: t.string({
      resolve({ id }) {
        return id.replace(TYPENAMES_TO_ID_PREFIXES.Registration + ':', '');
      },
    }),
    ticketId: t.exposeID('ticketId'),
    authorId: t.exposeID('authorId', { nullable: true }),
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
    verifiedAt: t.expose('verifiedAt', { type: DateTimeScalar, nullable: true }),
    verifiedBy: t.relation('verifiedBy', { nullable: true }),
    paymentMethod: t.expose('paymentMethod', { type: PaymentMethodEnum, nullable: true }),
    paid: t.exposeBoolean('paid'),
    opposedAt: t.expose('opposedAt', { type: DateTimeScalar, nullable: true }),
    opposedBy: t.relation('opposedBy', { nullable: true }),
    opposed: t.boolean({
      resolve({ opposedAt, opposedById }) {
        return Boolean(opposedAt && opposedById);
      },
    }),
    cancelledAt: t.expose('cancelledAt', { type: DateTimeScalar, nullable: true }),
    cancelledBy: t.relation('cancelledBy', { nullable: true }),
    cancelled: t.boolean({
      resolve({ cancelledAt, cancelledById }) {
        return Boolean(cancelledAt && cancelledById);
      },
    }),
    ticket: t.relation('ticket'),
    author: t.relation('author', { nullable: true }),
    authorEmail: t.exposeString('authorEmail'),
    authorIsBeneficiary: t.boolean({
      async resolve({ authorId, authorEmail, beneficiary }) {
        if (!authorId) return true;
        const author = await prisma.user.findUnique({ where: { id: authorId } });
        if (!author) return false;
        return authorIsBeneficiary(
          { ...author, fullName: fullName(author) },
          beneficiary,
          authorEmail,
        );
      },
    }),
  }),
});

export function authorIsBeneficiary(
  author: { uid: string; fullName: string; firstName: string; lastName: string; email: string },
  beneficiary: string,
  authorEmail: string,
) {
  return (
    !beneficiary.trim() ||
    author.uid === beneficiary ||
    author.fullName === beneficiary ||
    `${author.firstName} ${author.lastName}` === beneficiary ||
    authorEmail === author.email
  );
}

builder.mutationField('checkIfRegistrationIsPaid', (t) =>
  t.boolean({
    args: {
      id: t.arg.id(),
    },
    async resolve(_, { id }) {
      const registration = await prisma.registration.findFirstOrThrow({
        where: {
          id: id.toLowerCase(),
        },
        include: {
          lydiaTransaction: true,
          paypalTransaction: true,
        },
      });

      if (!registration.paid && registration.lydiaTransaction?.requestId) {
        const state = await checkLydiaTransaction(registration.lydiaTransaction);
        if (state === LydiaTransactionState.Paid) {
          await prisma.logEntry.create({
            data: {
              action: 'lydia fallback mark as paid',
              area: 'registration',
              message:
                'Transaction was already paid for, marking registration as paid (from registration query)',
              target: registration.id,
            },
          });
          await prisma.registration.update({
            where: { id: registration.id },
            data: {
              paid: true,
            },
          });
          return true;
        }
      } else if (!registration.paid && registration.paypalTransaction?.orderId) {
        const { paid, status } = await checkPaypalPayment(registration.paypalTransaction.orderId);
        if (paid) {
          await log(
            'registration',
            'paypal manual check mark as paid',
            {
              registration,
            },
            registration.id,
          );
        }

        await prisma.registration.update({
          where: { id: registration.id },
          data: {
            paid,
          },
        });

        await prisma.paypalTransaction.update({
          where: { registrationId: registration.id },
          data: { status },
        });

        return paid;
      }

      return false;
    },
  }),
);

builder.queryField('registration', (t) =>
  t.prismaField({
    type: RegistrationType,
    errors: {},
    args: {
      id: t.arg.id(),
    },
    async resolve(query, _, { id }) {
      return prisma.registration.findFirstOrThrow({
        ...query,
        where: {
          id: id.toLowerCase(),
        },
        include: {
          lydiaTransaction: true,
        },
      });
    },
  }),
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
        ({ author, beneficiary, authorEmail }) =>
          (author?.uid === user.uid || authorEmail === user.email) &&
          ((author
            ? authorIsBeneficiary(
                { ...author, fullName: fullName(author) },
                beneficiary,
                authorEmail,
              )
            : false) ||
            beneficiary === argBeneficiary),
      );

      if (!registration) throw new GraphQLError('Registration not found');
      return registration;
    },
  }),
);

builder.queryField('registrationsOfUser', (t) =>
  t.prismaConnection({
    type: RegistrationType,
    cursor: 'id',
    args: {
      userUid: t.arg.string(),
      forUserOnly: t.arg.boolean({ required: false }),
    },
    authScopes(_, { userUid }, { user }) {
      if (!user) throw new GraphQLError('User not found');
      return Boolean(user.admin || user.uid === userUid);
    },
    async resolve(query, _, { userUid, forUserOnly }, { user: me }) {
      if (!me) throw new GraphQLError('Not logged in');
      const user = await prisma.user.findUnique({ where: { uid: userUid } });
      if (!user) throw new GraphQLError('User not found');
      return prisma.registration.findMany({
        ...query,
        where: {
          OR: [
            { author: { uid: userUid }, ...(forUserOnly ? { beneficiary: '' } : {}) },
            { beneficiary: userUid },
            { beneficiary: fullName(user) },
            { authorEmail: user.email },
          ],
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    },
  }),
);

builder.queryField('registrationsOfEvent', (t) =>
  t.prismaConnection({
    type: RegistrationType,
    cursor: 'id',
    args: {
      groupUid: t.arg.string(),
      eventUid: t.arg.string(),
    },
    async subscribe(subscriptions, _, { groupUid, eventUid }) {
      const { id } = await prisma.event.findFirstOrThrow({
        where: { uid: eventUid, group: { uid: groupUid } },
      });

      subscriptions.register(id);
    },
    async authScopes(_, { eventUid, groupUid }, { user }) {
      const { managers } = await prisma.event.findFirstOrThrow({
        where: { uid: eventUid, group: { uid: groupUid } },
        include: { managers: true },
      });
      return Boolean(user?.admin || managers.some(({ userId }) => user?.id === userId));
    },
    async resolve(query, _, { eventUid, groupUid }) {
      return prisma.registration.findMany({
        ...query,
        where: { ticket: { event: { uid: eventUid, group: { uid: groupUid } } } },
        orderBy: { createdAt: 'desc' },
      });
    },
  }),
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
        include: {
          managers: {
            include: {
              user: true,
            },
          },
        },
      });
      if (!event) return false;
      return eventManagedByUser(event, user, { canVerifyRegistrations: true });
    },
    async resolve(query, _, { eventUid, groupUid, userUid }, {}) {
      const user = await prisma.user.findUniqueOrThrow({ where: { uid: userUid } });
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
            { authorEmail: user.email },
          ],
        },
      });
    },
  }),
);

export const RegistrationSearchResultType = builder
  .objectRef<SearchResult<{ registration: Registration }, ['beneficiary']>>(
    'RegistrationSearchResult',
  )
  .implement({
    fields: (t) => ({
      id: t.exposeID('id'),
      registration: t.prismaField({
        type: 'Registration',
        resolve: (_, { registration }) => registration,
      }),
      rank: t.exposeFloat('rank', { nullable: true }),
      similarity: t.exposeFloat('similarity'),
      highlightedBeneficiary: t.string({
        resolve: ({ highlights }) => highlights.beneficiary,
      }),
    }),
  });

builder.queryField('searchRegistrations', (t) =>
  t.field({
    type: [RegistrationSearchResultType],
    args: {
      groupUid: t.arg.string(),
      eventUid: t.arg.string(),
      q: t.arg.string(),
    },
    async authScopes(_, { eventUid, groupUid }, { user }) {
      const event = await prisma.event.findFirstOrThrow({
        where: {
          group: { uid: groupUid },
          uid: eventUid,
        },
        include: {
          managers: { include: { user: true } },
        },
      });
      return eventManagedByUser(event, user, {});
    },
    async resolve(_, { q, eventUid, groupUid }) {
      return fullTextSearch('Registration', q, {
        fuzzy: ['beneficiary'],
        highlight: ['beneficiary'],
        htmlHighlights: [],
        property: 'registration',
        resolveObjects: (ids) =>
          prisma.registration.findMany({
            where: {
              id: { in: ids },
              ticket: { event: { uid: eventUid, group: { uid: groupUid } } },
            },
          }),
      });
    },
  }),
);

enum RegistrationVerificationState {
  Ok,
  NotPaid,
  AlreadyVerified,
  NotFound,
  Opposed,
  OtherEvent,
}

const RegistrationVerificationStateType = builder.enumType(RegistrationVerificationState, {
  name: 'RegistrationVerificationState',
});

class RegistrationVerificationResult {
  // eslint-disable-next-line @typescript-eslint/parameter-properties
  state: RegistrationVerificationState;
  // eslint-disable-next-line @typescript-eslint/parameter-properties
  registration?: Registration & { verifiedBy?: User | null };

  constructor(
    state: RegistrationVerificationState,
    registration?: Registration & { verifiedBy?: User | null },
  ) {
    this.state = state;
    this.registration = registration;
  }
}

const RegistrationVerificationResultType = builder
  .objectRef<RegistrationVerificationResult>('RegistrationVerificationResult')
  .implement({
    fields: (t) => ({
      state: t.expose('state', { type: RegistrationVerificationStateType }),
      registration: t.expose('registration', { nullable: true, type: RegistrationType }),
    }),
  });

builder.mutationField('verifyRegistration', (t) =>
  t.field({
    type: RegistrationVerificationResultType,
    errors: {},
    args: {
      id: t.arg.id(),
      groupUid: t.arg.string(),
      eventUid: t.arg.string(),
    },
    async authScopes(_, { groupUid, eventUid }, { user }) {
      const event = await prisma.event.findFirst({
        where: { uid: eventUid, group: { uid: groupUid } },
        include: {
          managers: {
            include: {
              user: true,
            },
          },
        },
      });
      if (!event) return false;
      return eventManagedByUser(event, user, { canVerifyRegistrations: true });
    },
    async resolve(query, { id, eventUid, groupUid }, { user }) {
      async function log(message: string, target?: string) {
        await prisma.logEntry.create({
          data: {
            action: 'scan',
            area: 'scans',
            message,
            user: user ? { connect: { id: user.id } } : undefined,
            target,
          },
        });
      }

      if (!user) throw new GraphQLError('Must be logged in to verify a registration');

      let registration = await prisma.registration.findUnique({
        where: { id },
        include: {
          verifiedBy: true,
          ticket: {
            include: { event: { include: { group: true } } },
          },
        },
      });

      if (!registration || Boolean(registration.cancelledAt)) {
        await log('Scan failed: registration not found');
        return {
          state: RegistrationVerificationState.NotFound,
        };
      }

      if (
        registration.ticket.event.uid !== eventUid ||
        registration.ticket.event.group.uid !== groupUid
      ) {
        await log('Scan failed: registration is for another event');
        return {
          state: RegistrationVerificationState.OtherEvent,
          registration,
        };
      }

      // we check opposedAt instead of opposedBy in case the verifier deleted their account after verifying
      if (registration.opposedAt) {
        await log('Scan failed: registration opposed', registration.id);
        return {
          state: RegistrationVerificationState.Opposed,
          registration,
        };
      }

      // we check verifiedAt instead of verifiedBy in case the verifier deleted their account after verifying
      if (registration.verifiedAt) {
        await log('Scan failed: registration already verified', registration.id);
        return {
          state: RegistrationVerificationState.AlreadyVerified,
          registration,
        };
      }

      if (registration.paid) {
        registration = await prisma.registration.update({
          ...query,
          where: { id },
          data: {
            verifiedAt: new Date(),
            verifiedBy: { connect: { id: user.id } },
          },
          include: {
            verifiedBy: true,
            ticket: {
              include: {
                event: {
                  include: {
                    group: true,
                  },
                },
              },
            },
          },
        });
        await log('Scan successful', registration.id);
      } else {
        await log('Scan failed: registration not paid', registration.id);
      }

      return {
        state: registration.paid
          ? RegistrationVerificationState.Ok
          : RegistrationVerificationState.NotPaid,
        registration,
      };
    },
  }),
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
      authorEmail: t.arg.string({ required: false }),
    },
    async authScopes(_, { ticketId, id, paid, authorEmail, beneficiary }, { user }) {
      const logDenial = async (why: string, data?: Record<string, unknown> | undefined) => {
        await log(
          'registrations',
          'deny',
          { message: why, args: { paid, authorEmail, beneficiary }, ...data },
          id,
          user,
        );
      };

      const creating = !id;
      if (!authorEmail && !user) {
        await logDenial('not logged in and no user');
        return false;
      }
      // cannot create a registration for someone else when not connected (because godson limits can't be tracked)
      if (beneficiary && !user) {
        await logDenial(
          "cannot book for someone else without an account, godson limits can't be tracked",
        );
        return false;
      }
      const ticket = await prisma.ticket.findUnique({
        where: { id: ticketId },
        include: {
          event: {
            include: {
              coOrganizers: { include: { studentAssociation: { include: { school: true } } } },
              group: { include: { studentAssociation: { include: { school: true } } } },
              managers: { include: { user: true } },
              bannedUsers: true,
              tickets: true,
            },
          },
          openToGroups: true,
          openToSchools: true,
          openToMajors: true,
        },
      });
      if (!ticket) {
        await logDenial('ticket not found');
        return false;
      }

      // Only managers can mark a registration as paid
      if (
        ticket.price > 0 &&
        paid &&
        !(user?.admin || eventManagedByUser(ticket.event, user, { canVerifyRegistrations: true }))
      ) {
        await logDenial(
          "only managers or admins can mark a registration as paid, ticket's price is not 0 and paid is true",
          { ticket },
        );
        return false;
      }

      if (creating) {
        // Check that the user can access the event
        if (!(await eventAccessibleByUser(ticket.event, user))) {
          await logDenial("user can't access the event the ticket is for", { ticket });
          return false;
        }

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

        // Check that the ticket is still open
        if (ticket.closesAt && isPast(ticket.closesAt)) {
          await logDenial('shotgun is closed', { ticket });
          return false;
        }

        // Check that the ticket is open yet
        if (ticket.opensAt && isFuture(ticket.opensAt)) {
          await logDenial('shotgun is not open yet', { ticket });
          return false;
        }

        // Check that the user can see the event
        if (!userCanSeeTicket(ticket, userWithContributesTo)) {
          await logDenial("user can't see the ticket", { ticket, userWithContributesTo });
          return false;
        }

        // Check for tickets that only managers can provide
        if (
          ticket.onlyManagersCanProvide &&
          !eventManagedByUser(ticket.event, user, { canVerifyRegistrations: true })
        ) {
          await logDenial('only managers can provide this ticket', { ticket });
          return false;
        }

        const ticketAndRegistrations = await prisma.ticket.findUnique({
          where: { id: ticketId },
          include: {
            registrations: { include: { author: true } },
            group: { include: { tickets: { include: { registrations: true } } } },
          },
        });

        // Check for beneficiary limits
        if (!eventManagedByUser(ticket.event, user, {})) {
          const registrationsByThisAuthor = ticketAndRegistrations!.registrations.filter(
            ({ author, beneficiary }) => author?.uid === user?.uid && beneficiary !== '',
          );
          if (registrationsByThisAuthor.length > ticket.godsonLimit) {
            await logDenial('godson limit reached', {
              ticket,
              registrationsByThisAuthor,
              userWithContributesTo,
            });
            return false;
          }
        }

        // Check that the ticket is not full
        const full = placesLeft(ticketAndRegistrations!) <= 0;
        if (full) {
          await logDenial('no places left', { ticket });
          return false;
        }
        return true;
      }

      // We are updating an existing registration. The permissions required are totally different.
      const registration = await prisma.registration.findUnique({
        where: { id },
        include: {
          ticket: {
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
          },
        },
      });
      if (!registration) return false;
      if (
        !user?.admin &&
        !eventManagedByUser(registration.ticket.event, user, { canVerifyRegistrations: true })
      )
        return false;
      return true;
    },
    async resolve(
      query,
      _,
      { id, ticketId, beneficiary, paymentMethod, paid, authorEmail },
      { user },
    ) {
      const creating = !id;
      beneficiary = beneficiary?.replace(/^@/, '').trim();

      if (creating) {
        const event = await prisma.event.findFirstOrThrow({
          where: { tickets: { some: { id: ticketId } } },
        });
        // Check that the user has not already registered
        const existingRegistration = await prisma.registration.findFirst({
          where: {
            ticket: { event: { id: event.id } },
            authorId: user?.id ?? undefined,
            authorEmail: authorEmail ?? '',
            beneficiary: beneficiary ?? '',
            // eslint-disable-next-line unicorn/no-null
            cancelledAt: null,
          },
        });
        if (existingRegistration) throw new GraphQLError('Vous êtes déjà inscrit à cet événement');
      }

      const ticket = await prisma.ticket.findUniqueOrThrow({
        where: { id: ticketId },
        include: { event: { include: { beneficiary: true } }, autojoinGroups: true },
      });

      if ((beneficiary || user) && paid && ticket.autojoinGroups.length > 0) {
        try {
          await prisma.user.update({
            where: { uid: beneficiary || user!.uid },
            data: {
              groups: {
                createMany: {
                  skipDuplicates: true,
                  data: ticket.autojoinGroups.map((g) => ({
                    groupId: g.id,
                    title: `Membre par ${ticket.event.title}`,
                  })),
                },
              },
            },
          });
        } catch (error: unknown) {
          if (error instanceof PrismaClientKnownRequestError && error.code === 'P2025') {
            // ok, the beneficiary is just not a user of the app
          } else {
            throw error;
          }
        }
      }

      const registration = await prisma.registration.upsert({
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
          author: user ? { connect: { id: user.id } } : undefined,
          authorEmail: authorEmail ?? '',
          // eslint-disable-next-line unicorn/no-null
          paymentMethod: paymentMethod ?? null,
          beneficiary: beneficiary ?? '',
          paid: ticket.price === 0,
        },
      });
      await log(
        'registration',
        creating ? 'create' : 'update',
        { registration, ticket, user, authorEmail },
        registration.id,
        user,
      );
      publish(ticket.event.id, 'created', registration);
      if (creating) {
        await log(
          'registration',
          'send mail',
          { registration, to: user?.email ?? authorEmail },
          registration.id,
          user,
        );

        const pseudoID = registration.id.replace(/^r:/, '').toUpperCase();
        const qrcodeBuffer = await qrcode.toBuffer(pseudoID, { errorCorrectionLevel: 'H' });

        const recipient = user?.email ?? authorEmail;
        if (!recipient) throw new GraphQLError('No recipient found to send email to.');
        await mailer.sendMail({
          to: recipient,
          from: process.env.PUBLIC_SUPPORT_EMAIL,
          attachments: [
            {
              filename: `qrcode-${pseudoID.toLowerCase()}.png`,
              content: qrcodeBuffer,
              cid: 'qrcode',
            },
          ],
          subject: beneficiary
            ? `Place pour ${beneficiary} à ${ticket.event.title}`
            : `Ta place pour ${ticket.event.title}`,
          html: `<p>Ta place pour ${ticket.event.title} a bien été réservée.</p>
          <p>Montre le QR code pour rentrer.</p>
          <img src="cid:qrcode" alt="${pseudoID}" />
          <p>En cas de problème, ton code de réservation est le:</p>
          <p style="font-size: 32px; text-align: center;" align="center" size="32px"><code>${pseudoID}</code></p><p><a href="https://churros.inpt.fr/bookings/${pseudoID}">Accéder à ma place</a></p>`,
          text: `Ton code de réservation est le ${pseudoID}`,
        });
      }

      return registration;
    },
  }),
);

builder.mutationField('paidRegistration', (t) =>
  t.field({
    description:
      'When paying with Paypal, returns the order id for a capture to finish the payment',
    type: 'String',
    errors: {},
    args: {
      regId: t.arg.id(),
      beneficiary: t.arg.string({ required: false }),
      paymentMethod: t.arg({ type: PaymentMethodEnum, required: false }),
      phone: t.arg.string({ required: false }),
    },
    async authScopes(_, { regId }, { user }) {
      const creating = !regId;
      const registration = await prisma.registration.findUnique({
        where: { id: regId },
        include: {
          ticket: {
            include: {
              event: {
                include: {
                  coOrganizers: { include: { studentAssociation: { include: { school: true } } } },
                  group: { include: { studentAssociation: { include: { school: true } } } },
                  managers: { include: { user: true } },
                  tickets: true,
                },
              },
            },
          },
        },
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
    // @ts-expect-error it says that the return type is string|undefined but i can't see where it'd be undefined
    async resolve(_, { regId, beneficiary, paymentMethod, phone }, { user }) {
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
      if (!phone && paymentMethod === PaymentMethodPrisma.Lydia)
        throw new GraphQLError('Phone not found');

      const price = await actualPrice(ticket, user);

      // Process payment
      const paypalOrderId = await pay({
        from: user?.uid ?? '(unregistered)',
        to: ticket.event.beneficiary?.id ?? '(unregistered)',
        amount: price,
        by: paymentMethod,
        phone: phone ?? '',
        emailAddress: user?.email ?? '',
        registrationId: registration.id,
      });

      if (paymentMethod === PaymentMethodPrisma.PayPal && !paypalOrderId)
        throw new GraphQLError("PayPal n'a pas donné d'identifiant de commande");

      await log(
        'registration',
        'update',
        { registration, paymentMethod, beneficiary },
        regId,
        user,
      );
      await prisma.registration.update({
        where: { id: regId },
        data: {
          paymentMethod,
          beneficiary: beneficiary ?? '',
        },
      });

      if (paymentMethod === PaymentMethodPrisma.PayPal) return paypalOrderId;
      return '';
    },
  }),
);

builder.mutationField('finishPaypalRegistrationPayment', (t) =>
  t.field({
    type: 'Boolean',
    errors: {},
    args: {
      orderId: t.arg.string(),
    },
    async resolve(_, { orderId }) {
      await finishPaypalPayment(orderId);
      return true;
    },
  }),
);

builder.mutationField('cancelRegistration', (t) =>
  t.field({
    type: 'Boolean',
    errors: {},
    args: {
      id: t.arg.id(),
    },
    async authScopes(_, { id }, { user }) {
      if (!user) return false;
      const registration = await prisma.registration.findFirst({
        where: { id },
        include: {
          author: true,
          ticket: {
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
          },
        },
      });
      if (!registration) return false;
      if (!user.admin && user.uid !== registration.author?.uid) return false;
      return true;
    },
    async resolve(_, { id }, { user }) {
      const {
        ticket: { eventId },
      } = await prisma.registration.update({
        where: { id },
        data: {
          cancelledAt: new Date(),
          cancelledBy: { connect: { id: user?.id } },
        },
        include: { ticket: true },
      });
      publish(eventId, 'deleted', id);
      return true;
    },
  }),
);

builder.mutationField('opposeRegistration', (t) =>
  t.field({
    type: 'Boolean',
    errors: {},
    args: {
      id: t.arg.id(),
    },
    async authScopes(_, { id }, { user }) {
      if (!user) return false;
      if (user.admin) return true;
      const registration = await prisma.registration.findUnique({
        where: { id },
        include: {
          ticket: {
            include: {
              event: {
                include: {
                  managers: { include: { user: true } },
                },
              },
            },
          },
        },
      });
      if (!registration) return false;
      if (!eventManagedByUser(registration.ticket.event, user, { canVerifyRegistrations: true }))
        return false;
      return true;
    },
    async resolve(_, { id }, { user }) {
      await prisma.registration.update({
        where: { id },
        data: {
          opposedAt: new Date(),
          opposedBy: { connect: { id: user?.id } },
        },
      });
      return true;
    },
  }),
);

const QRCodeType = builder.objectRef<{ path: string; viewbox: string }>('QRCode').implement({
  fields: (t) => ({
    path: t.exposeString('path'),
    viewbox: t.exposeString('viewbox'),
  }),
});

builder.queryField('registrationQRCode', (t) =>
  t.field({
    type: QRCodeType,
    description: 'Returns an SVG path of the QR Code for the given registration',
    args: {
      id: t.arg.id(),
    },
    authScopes() {
      return true;
    },
    resolve(_, { id }) {
      const { d: path, dim } = qrcodeGeneratorLib.renderPath(qrcodeGeneratorLib.getMatrix(id));
      const builtinPadding = 4;
      const viewbox = `${builtinPadding} ${builtinPadding} ${dim - 2 * builtinPadding} ${
        dim - 2 * builtinPadding
      }`;
      return { path, viewbox };
    },
  }),
);

builder.mutationField('deleteRegistration', (t) =>
  t.field({
    type: 'Boolean',
    args: {
      id: t.arg.id(),
    },
    authScopes(_, {}, { user }) {
      return Boolean(user?.admin);
    },
    async resolve(_, { id }, { user }) {
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
      await prisma.logEntry.create({
        data: {
          area: 'registration',
          action: 'delete',
          target: id,
          message: `Registration deleted`,
          user: user ? { connect: { id: user.id } } : undefined,
        },
      });
      return true;
    },
  }),
);

builder.queryField('registrationsCsv', (t) =>
  t.field({
    type: 'String',
    errors: {},
    args: {
      eventUid: t.arg.string(),
      groupUid: t.arg.string(),
    },
    async authScopes(_, { eventUid, groupUid }, { user: me }) {
      const event = await prisma.event.findFirstOrThrow({
        where: {
          uid: eventUid,
          group: {
            uid: groupUid,
          },
        },
        include: {
          managers: {
            include: { user: true },
          },
        },
      });

      return eventManagedByUser(event, me, {});
    },
    async resolve(_, { eventUid, groupUid }) {
      const registrations = await prisma.registration.findMany({
        where: {
          ticket: {
            event: {
              uid: eventUid,
              group: {
                uid: groupUid,
              },
            },
          },
        },
        include: {
          ticket: true,
          author: {
            include: {
              major: true,
              contributions: { include: { option: { include: { paysFor: true } } } },
            },
          },
        },
      });
      let result = '';

      if (registrations.length <= 0) return '';
      const columns = [
        'Date de réservation',
        'Bénéficiaire',
        'Achat par',
        'Payée',
        'Scannée',
        'En opposition',
        'Annulée',
        'Méthode de paiement',
        'Billet',
        'Cotisant',
        'Filière',
        'Année',
        'Promo',
        'Code de réservation',
        'Lien vers la place',
      ] as const;

      const humanBoolean = (b: boolean) => (b ? 'Oui' : 'Non');
      const mapping = (
        {
          createdAt,
          verifiedAt,
          opposedAt,
          cancelledAt,
          paid,
          authorEmail,
          author,
          ticket,
          paymentMethod,
          id,
          beneficiary,
        }: (typeof registrations)[number],
        benef:
          | undefined
          | null
          | {
              firstName: string;
              major: null | { shortName: string };
              graduationYear: number;
              lastName: string;
              contributions: Array<{ option: { paysFor: Array<{ uid: string | null }> } }>;
            },
      ) =>
        ({
          'Date de réservation': createdAt.toISOString(),
          'Bénéficiaire': (benef ? fullName(benef) : beneficiary) || authorEmail,
          'Achat par': author ? fullName(author) : authorEmail,
          'Payée': humanBoolean(paid),
          'Scannée': humanBoolean(Boolean(verifiedAt) && paid),
          'En opposition': humanBoolean(Boolean(opposedAt)),
          'Annulée': humanBoolean(Boolean(cancelledAt)),
          'Méthode de paiement': paymentMethod ?? 'Inconnue',
          'Billet': ticket.name,
          'Cotisant': benef
            ? humanBoolean(
                benef.contributions.some(({ option: { paysFor } }) =>
                  paysFor.some(({ uid }) => uid === 'aen7'),
                ),
              )
            : '',
          'Filière': benef?.major?.shortName ?? '',
          'Année': benef ? `${yearTier(benef.graduationYear)}A` : '',
          'Promo': benef?.graduationYear.toString() ?? '',
          'Code de réservation': id.replace(/^r:/, '').toUpperCase(),
          'Lien vers la place': `${process.env.FRONTEND_ORIGIN}/bookings/${id.replace(/^r:/, '')}/`,
        }) satisfies Record<(typeof columns)[number], string>;

      result = columns.join(',') + '\n';

      for (const reg of registrations) {
        const benef = reg.beneficiary
          ? await prisma.user.findUnique({
              where: { uid: reg.beneficiary },
              include: {
                major: true,
                contributions: { include: { option: { include: { paysFor: true } } } },
              },
            })
          : reg.author;
        const data = mapping(reg, benef);
        result += columns.map((c) => data[c]).join(',') + '\r\n';
      }

      return result;
    },
  }),
);

async function pay({
  from,
  to,
  amount,
  by,
  phone,
  emailAddress,
  registrationId,
}: {
  from: string;
  to: string;
  amount: number;
  by: PaymentMethodPrisma;
  phone?: string;
  emailAddress?: string;
  registrationId?: string;
}): Promise<string | undefined> {
  switch (by) {
    case 'Lydia': {
      if (!phone) throw new GraphQLError('Missing phone number');
      await payEventRegistrationViaLydia(phone, registrationId);
      return;
    }

    case 'PayPal': {
      if (!registrationId) throw new GraphQLError('Pas de réservation associée');
      return payEventRegistrationViaPaypal(registrationId, emailAddress ?? '');
    }

    default: {
      return new Promise((_resolve, reject) => {
        reject(
          new GraphQLError(`Attempt to pay ${to} ${amount} from ${from} by ${by}: not implemented`),
        );
      });
    }
  }
}

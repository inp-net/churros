import { builder, log, prisma, publish, sendMail } from '#lib';
import { PaymentMethodEnum } from '#modules/payments';
import { getUserWithContributesTo, userCanAccessEvent, userCanManageEvent } from '#permissions';
import { PrismaClientKnownRequestError } from '@churros/db/prisma/runtime/library';
import { isFuture, isPast } from 'date-fns';
import { GraphQLError } from 'graphql';
import * as qrcode from 'qrcode';
import { RegistrationType, canSeeTicket, placesLeft } from '../index.js';

// TODO remove, not used by @churros/app anymore
builder.mutationField('upsertRegistration', (t) =>
  t.prismaField({
    type: RegistrationType,
    deprecationReason: 'Use bookEvent instead',
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
        ticket.minimumPrice > 0 &&
        paid &&
        !(user?.admin || userCanManageEvent(ticket.event, user, { canVerifyRegistrations: true }))
      ) {
        await logDenial(
          "only managers or admins can mark a registration as paid, ticket's price is not 0 and paid is true",
          { ticket },
        );
        return false;
      }

      if (creating) {
        // Check that the user can access the event
        if (!(await userCanAccessEvent(ticket.event, user))) {
          await logDenial("user can't access the event the ticket is for", { ticket });
          return false;
        }

        const userWithContributesTo = user ? await getUserWithContributesTo(user.id) : null;

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
        if (!canSeeTicket(ticket, userWithContributesTo)) {
          await logDenial("user can't see the ticket", { ticket, userWithContributesTo });
          return false;
        }

        // Check for tickets that only managers can provide
        if (
          ticket.onlyManagersCanProvide &&
          !userCanManageEvent(ticket.event, user, { canVerifyRegistrations: true })
        ) {
          await logDenial('only managers can provide this ticket', { ticket });
          return false;
        }

        const ticketAndRegistrations = await prisma.ticket.findUnique({
          where: { id: ticketId },
          include: {
            ...placesLeft.prismaIncludes,
            registrations: {
              include: {
                author: true,
              },
            },
          },
        });

        // Check for beneficiary limits
        if (!userCanManageEvent(ticket.event, user, {})) {
          const registrationsByThisAuthor = ticketAndRegistrations!.registrations.filter(
            ({ author, externalBeneficiary, internalBeneficiaryId }) =>
              author?.uid === user?.uid && (externalBeneficiary !== '' || internalBeneficiaryId),
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
        !userCanManageEvent(registration.ticket.event, user, { canVerifyRegistrations: true })
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
            externalBeneficiary: beneficiary ?? '',
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
          externalBeneficiary: beneficiary ?? '',
          paid,
        },
        create: {
          ticket: { connect: { id: ticketId } },
          author: user ? { connect: { id: user.id } } : undefined,
          authorEmail: authorEmail ?? '',
          // eslint-disable-next-line unicorn/no-null
          paymentMethod: paymentMethod ?? null,
          externalBeneficiary: beneficiary ?? '',
          paid: ticket.minimumPrice === 0,
        },
      });
      await log(
        'registration',
        creating ? 'create' : 'update',
        { registration, ticket, user, authorEmail },
        registration.id,
        user,
      );
      if (creating) publish(ticket.event.id, 'created', registration);
      else publish(id, 'updated', registration);

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
        await sendMail(
          'booking',
          recipient,
          {
            beneficiary: beneficiary ?? null,
            bookingCode: pseudoID,
            eventTitle: ticket.event.title,
            bookingLink: new URL(
              `/bookings/${pseudoID}`,
              process.env.PUBLIC_FRONTEND_ORIGIN,
            ).toString(),
          },
          {
            attachments: {
              qrcode: {
                filename: `qrcode-${pseudoID.toLowerCase()}.png`,
                content: qrcodeBuffer,
              },
            },
          },
        );
      }

      return registration;
    },
  }),
);

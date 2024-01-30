import { builder, log, prisma, publish } from '#lib';

import { PaymentMethodEnum } from '#modules/payments';
import {
  getUserWithContributesTo,
  userCanAccessEvent,
  userCanManageEvent,
  userCanSeeTicket,
} from '#permissions';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library.js';
import { isFuture, isPast } from 'date-fns';
import { GraphQLError } from 'graphql';
import { createTransport } from 'nodemailer';
import * as qrcode from 'qrcode';
import { RegistrationType, placesLeft } from '../index.js';
// TODO rename to book.ts

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

        const userWithContributesTo = user ? await getUserWithContributesTo(user.id) : undefined;

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
          !userCanManageEvent(ticket.event, user, { canVerifyRegistrations: true })
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
        if (!userCanManageEvent(ticket.event, user, {})) {
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
        const mailer = createTransport(process.env.SMTP_URL);
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

import { builder, ensureGlobalId, prisma, publish } from '#lib';

import { differenceInSeconds } from 'date-fns';
import { GraphQLError } from 'graphql';
import {
  RegistrationVerificationResultType,
  RegistrationVerificationState,
  canScanBookings,
} from '../index.js';
// TODO rename to verify-booking.ts

builder.mutationField('verifyBooking', (t) =>
  t.field({
    type: RegistrationVerificationResultType,
    errors: {},
    args: {
      id: t.arg.id({ description: 'Identifiant de la place ou code de réservation' }),
      event: t.arg.id({ description: 'Identifiant de l’événement' }),
    },
    async authScopes(_, { event: eventId }, { user }) {
      const event = await prisma.event.findFirstOrThrow({
        where: { id: eventId },
        include: {
          managers: true,
          group: true,
        },
      });
      if (!event) return false;
      return canScanBookings(event, user);
    },
    async resolve(query, { id, event: eventId }, { user }) {
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
        where: { id: ensureGlobalId(id.trim().toLowerCase(), 'Registration') },
        include: {
          verifiedBy: true,
          ticket: true,
        },
      });

      if (!registration || Boolean(registration.cancelledAt)) {
        await log('Scan failed: registration not found');
        return {
          state: RegistrationVerificationState.NotFound,
        };
      }

      if (registration.ticket.eventId !== eventId) {
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
      if (registration.verifiedAt && differenceInSeconds(new Date(), registration.verifiedAt) > 2) {
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
            verifiedAt: registration.verifiedAt ?? new Date(),
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
        publish(registration.id, 'updated', registration);
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

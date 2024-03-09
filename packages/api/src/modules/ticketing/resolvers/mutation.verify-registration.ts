import { builder, prisma } from '#lib';

import { userCanManageEvent } from '#permissions';
import { GraphQLError } from 'graphql';
import { RegistrationVerificationResultType, RegistrationVerificationState } from '../index.js';
// TODO rename to verify-booking.ts

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
      return userCanManageEvent(event, user, { canVerifyRegistrations: true });
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

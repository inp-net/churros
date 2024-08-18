import { log as _log, builder, ensureGlobalId, prisma, publish } from '#lib';
import { LocalID, URLScalar } from '#modules/global';
import { differenceInSeconds } from 'date-fns';
import { GraphQLError } from 'graphql';
import {
  RegistrationPrismaIncludes,
  RegistrationVerificationResultType,
  RegistrationVerificationState,
  canScanBookings,
} from '../index.js';

builder.mutationField('verifyBooking', (t) =>
  t.field({
    type: RegistrationVerificationResultType,
    errors: {},
    args: {
      qrcode: t.arg.string({ description: 'Contenu du QR Code décodé' }),
      event: t.arg({ type: LocalID, description: 'Identifiant de l’événement' }),
      bookingURLTemplate: t.arg({
        type: URLScalar,
        required: false,
        description:
          "URL vers la page du billet, permet d'extraire le code de réservation depuis le contenu du QR Code, qui peut alors être une URL vers le billet plutôt qu'un simple code. `[code]` correspond au code de réservation dans cette URL.",
      }),
    },
    async authScopes(_, args, { user }) {
      const event = await prisma.event.findFirstOrThrow({
        where: { id: ensureGlobalId(args.event, 'Event') },
        include: {
          managers: true,
          group: true,
        },
      });
      if (!event) return false;
      return canScanBookings(event, user);
    },
    async resolve(query, args, { user }) {
      async function log(message: string, target?: string) {
        return _log('scans', 'scan', { message }, target, user);
      }

      if (!user) throw new GraphQLError('Must be logged in to verify a registration');

      let code = '';
      if (args.bookingURLTemplate && URL.canParse(args.qrcode)) {
        const normalized = new URL(args.qrcode).toString();
        // Remove characters before [code] in the template in normalized
        // And remove characters after [code] in the template in normalized
        const beforeCodeStartIndex = args.bookingURLTemplate.toString().indexOf('[code]');
        const afterCodeEndIndexFromEnd =
          args.bookingURLTemplate.toString().length - beforeCodeStartIndex - 6;
        code = normalized.slice(beforeCodeStartIndex, normalized.length - afterCodeEndIndexFromEnd);
      } else {
        code = args.qrcode;
      }

      code = code.toLowerCase().trim();

      let registration = await prisma.registration.findUnique({
        where: { id: ensureGlobalId(code, 'Registration') },
        include: {
          ...RegistrationPrismaIncludes,
          verifiedBy: true,
        },
      });

      if (!registration || Boolean(registration.cancelledAt)) {
        await log('Scan failed: registration not found');
        return {
          state: RegistrationVerificationState.NotFound,
          message: `Aucune réservation pour "${code}" trouvée`,
        };
      }

      if (registration.ticket.eventId !== ensureGlobalId(args.event, 'Event')) {
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
          where: { id: registration.id },
          data: {
            verifiedAt: registration.verifiedAt ?? new Date(),
            verifiedBy: { connect: { id: user.id } },
          },
          include: {
            ...RegistrationPrismaIncludes,
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

import { builder, ensureGlobalId, log, prisma } from '#lib';
import { checkLydiaTransaction, checkPaypalPayment } from '#modules/payments';
import { RegistrationType } from '#modules/ticketing/types';
import type { Prisma } from '@churros/db/prisma';

builder.mutationField('checkIfBookingIsPaid', (t) =>
  t.prismaField({
    type: RegistrationType,
    errors: {},
    args: {
      code: t.arg.string(),
    },
    async resolve(query, _, { code }) {
      const registration = await prisma.registration.findFirstOrThrow({
        where: {
          id: ensureGlobalId(code.toLowerCase(), 'Registration'),
        },
        include: {
          lydiaTransaction: true,
          paypalTransaction: true,
        },
      });

      if (!registration.paid) {
        const result = await updatePaidStatus(registration, query);
        // Result can be undefined if the booking could not be marked as (un)paid: e.g. the payment method does not support automatic verification (Cash, etc)
        if (result) return result;
      }

      return prisma.registration.findFirstOrThrow({
        ...query,
        where: {
          id: registration.id,
        },
      });
    },
  }),
);

async function updatePaidStatus<
  Q extends {
    include?: Prisma.RegistrationInclude;
    select?: Prisma.RegistrationSelect;
  },
>(
  registration: Prisma.RegistrationGetPayload<{
    include: { lydiaTransaction: true; paypalTransaction: true };
  }>,
  query: Q,
) {
  if (isLydiaBooking(registration)) {
    const { paid } = await checkLydiaTransaction(registration.lydiaTransaction);
    if (paid) await log('ticketing', 'lydia mark as paid', {}, registration.id);

    return prisma.registration.update({
      ...query,
      where: { id: registration.id },
      data: { paid },
    });
  } else if (isPaypalBooking(registration)) {
    const { paid, status } = await checkPaypalPayment(registration.paypalTransaction.orderId);
    if (paid) await log('ticketing', 'paypal mark as paid', {}, registration.id);

    return prisma.registration.update({
      ...query,
      where: { id: registration.id },
      data: {
        paid,
        paypalTransaction: {
          update: { status },
        },
      },
    });
  }

  return;
}

/**
 * Booking was/will be paid via Lydia
 */
function isLydiaBooking(
  booking: Prisma.RegistrationGetPayload<{
    include: { lydiaTransaction: true };
  }>,
): booking is typeof booking & { lydiaTransaction: NonNullable<typeof booking.lydiaTransaction> } {
  return Boolean(booking.lydiaTransaction?.requestId);
}

/**
 * Booking was/will be paid via PayPal
 */
function isPaypalBooking(
  booking: Prisma.RegistrationGetPayload<{
    include: { paypalTransaction: true };
  }>,
): booking is typeof booking & {
  paypalTransaction: NonNullable<typeof booking.paypalTransaction> & { orderId: string };
} {
  return Boolean(booking.paypalTransaction?.orderId);
}

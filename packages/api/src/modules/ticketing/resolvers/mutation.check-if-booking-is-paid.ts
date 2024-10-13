import { builder, ensureGlobalId, log, prisma } from '#lib';
import {
  LydiaTransactionState,
  checkLydiaTransaction,
  checkPaypalPayment,
} from '#modules/payments';
import { RegistrationType } from '#modules/ticketing/types';

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

      if (!registration.paid && registration.lydiaTransaction?.requestId) {
        const state = await checkLydiaTransaction(registration.lydiaTransaction);
        if (state === LydiaTransactionState.Paid) {
          await log(
            'registration',
            'lydia fallback mark as paid',
            {
              message:
                'Transaction was already paid for, marking registration as paid (from registration query)',
            },
            registration.id,
          );
          return prisma.registration.update({
            ...query,
            where: { id: registration.id },
            data: {
              paid: true,
            },
          });
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

        return prisma.registration.findFirstOrThrow({
          ...query,
          where: {
            id: registration.id,
          },
        });
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

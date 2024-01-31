import { builder, log, prisma } from '#lib';

import {
  LydiaTransactionState,
  checkLydiaTransaction,
  checkPaypalPayment,
} from '#modules/payments';

// TODO rename to check-if-booking-is-paid.ts

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

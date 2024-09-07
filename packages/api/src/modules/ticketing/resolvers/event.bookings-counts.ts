import { builder, prisma, subscriptionName } from '#lib';
import { EventType } from '#modules/events';
import { PaymentMethod } from '@churros/db/prisma';
import { RegistrationsCountsType } from '../index.js';

builder.prismaObjectField(EventType, 'bookingsCounts', (t) =>
  t.field({
    type: RegistrationsCountsType,
    subscribe: (subs, { id }) => {
      subs.register(subscriptionName(id));
    },
    async resolve({ id }) {
      const results = await prisma.registration.findMany({
        where: { ticket: { event: { id } } },
        include: { ticket: true },
      });
      return {
        total: results.filter((r) => !r.cancelledAt).length,
        paid: results.filter((r) => r.paid && !r.cancelledAt).length,
        verified: results.filter((r) => r.verifiedAt).length,
        unpaidByPaymentMethod: Object.fromEntries(
          Object.entries(PaymentMethod).map(([_, value]) => [
            value,
            results.filter((r) => !r.paid && r.paymentMethod === value && !r.cancelledAt).length,
          ]),
        ) as Record<PaymentMethod, number>,
        cancelled: results.filter((r) => r.cancelledAt).length,
      };
    },
  }),
);

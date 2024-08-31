import { builder } from '#lib';
import { PaymentMethodEnum } from '#modules/payments';
import type { PaymentMethod } from '@churros/db/prisma';

// TODO rename to booking-counts

class RegistrationsCounts {
  total: number;
  paid: number;
  verified: number;
  unpaidByPaymentMethod: Record<PaymentMethod, number>;
  cancelled: number;

  constructor(data: {
    total: number;
    paid: number;
    verified: number;
    unpaidByPaymentMethod: Record<PaymentMethod, number>;
    cancelled: number;
  }) {
    this.total = data.total;
    this.paid = data.paid;
    this.verified = data.verified;
    this.unpaidByPaymentMethod = data.unpaidByPaymentMethod;
    this.cancelled = data.cancelled;
  }
}

export const RegistrationsCountsType = builder
  .objectRef<RegistrationsCounts>('RegistrationsCounts')
  .implement({
    fields: (t) => ({
      total: t.exposeFloat('total'),
      paid: t.exposeFloat('paid'),
      verified: t.exposeFloat('verified'),
      unpaidLydia: t.float({
        deprecationReason: 'Use unpaid(method: Lydia)',
        resolve: ({ unpaidByPaymentMethod }) => unpaidByPaymentMethod.Lydia,
      }),
      unpaid: t.float({
        args: {
          method: t.arg({ type: PaymentMethodEnum, required: false }),
        },
        resolve: ({ unpaidByPaymentMethod }, { method }) => {
          return method
            ? unpaidByPaymentMethod[method]
            : Object.values(unpaidByPaymentMethod).reduce((sum, count) => sum + count, 0);
        },
      }),
      cancelled: t.exposeFloat('cancelled'),
    }),
  });

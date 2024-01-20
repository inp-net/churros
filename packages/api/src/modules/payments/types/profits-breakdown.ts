import { builder } from '#lib';

import { PaymentMethod } from '@prisma/client';

// TODO not in ticketing cuz it'll be re-used for shops maybe?
// although the byTicket is specific to ticketing so... idk
// maybe do an interface instead, and have EventProfitsBreakdown extend it by adding byTicket, and ShopProfitsBreakdown extend it by adding byProduct or sth like that

class ProfitsBreakdown {
  /* eslint-disable @typescript-eslint/parameter-properties */
  total: number;
  byPaymentMethod: Record<PaymentMethod, number>;
  byTicket: Array<{ id: string; amount: number }>;
  /* eslint-enable @typescript-eslint/parameter-properties */

  constructor(
    total: number,
    byPaymentMethod: Record<PaymentMethod, number>,
    byTicket: Array<{ id: string; amount: number }>,
  ) {
    this.total = total;
    this.byPaymentMethod = byPaymentMethod;
    this.byTicket = byTicket;
  }
}

export const ProfitsBreakdownType = builder
  .objectRef<ProfitsBreakdown>('ProfitsBreakdown')
  .implement({
    fields: (t) => ({
      total: t.exposeFloat('total'),
      byPaymentMethod: t.expose('byPaymentMethod', {
        type: builder
          .objectRef<Record<PaymentMethod, number>>('ProfitsBreakdownByPaymentMethod')
          .implement({
            fields: (t) =>
              Object.fromEntries(
                Object.entries(PaymentMethod).map(([_, p]) => [p, t.exposeFloat(p)]),
              ),
          }),
      }),
      byTicket: t.expose('byTicket', {
        type: [
          builder.objectRef<{ id: string; amount: number }>('ProfitsBreakdownByTicket').implement({
            fields: (t) => ({
              id: t.exposeID('id'),
              amount: t.exposeFloat('amount'),
            }),
          }),
        ],
      }),
    }),
  });

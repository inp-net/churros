import { PaymentMethod as PaymentMethodPrisma } from '@prisma/client';
import { builder } from '../builder.js';
import { DateTimeScalar } from './scalars.js';

export const PaymentMethodEnum = builder.enumType(PaymentMethodPrisma, {
  name: 'PaymentMethod',
});

export const ShopPaymentType = builder.prismaObject('ShopPayment', {
  fields: (t) => ({
    id: t.exposeID('id'),
    user: t.relation('user'),
    paid: t.exposeBoolean('paid'),
    quantity: t.exposeInt('quantity'),
    createdAt: t.expose('createdAt', { type: DateTimeScalar }),
    updatedAt: t.expose('updatedAt', { type: DateTimeScalar }),
    shopItem: t.relation('shopItem'),
    paymentMethod: t.expose('paymentMethod', { type: PaymentMethodEnum }),
  }),
});

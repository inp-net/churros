import { builder } from '#lib';
import { DateTimeScalar } from '#modules/global';
import { PaymentMethodEnum } from '#modules/payments';

export const ShopPaymentType = builder.prismaObject('ShopPayment', {
  fields: (t) => ({
    id: t.exposeID('id'),
    user: t.relation('user'),
    paid: t.exposeBoolean('paid'),
    quantity: t.exposeInt('quantity'),
    totalPrice: t.exposeFloat('totalPrice'),
    shopItem: t.relation('shopItem'),
    paymentMethod: t.expose('paymentMethod', { type: PaymentMethodEnum }),
    createdAt: t.expose('createdAt', { type: DateTimeScalar }),
    updatedAt: t.expose('updatedAt', { type: DateTimeScalar }),
    shopItemAnswer: t.relation('shopItemAnswer'),
  }),
});

import { builder } from '#lib';

export const ShopItemAnswerType = builder.prismaObject('ShopItemAnswer', {
  fields: (t) => ({
    id: t.exposeID('id'),
    shopPaymentId: t.exposeString('shopPaymentId'),
    options: t.exposeStringList('option'),
    shopPayment: t.relation('shopPayment'),
  }),
});

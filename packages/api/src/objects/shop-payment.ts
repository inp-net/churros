import { PaymentMethod as PaymentMethodPrisma } from '@prisma/client';
import { builder } from '../builder.js';
import { DateTimeScalar } from './scalars.js';
import { prisma } from '../prisma.js';

export const PaymentMethodEnum = builder.enumType(PaymentMethodPrisma, {
  name: 'PaymentMethod',
});

export const ShopPaymentType = builder.prismaObject('ShopPayment', {
  fields: (t) => ({
    id: t.exposeID('id'),
    user: t.relation('user'),
    paid: t.exposeBoolean('paid'),
    quantity: t.exposeInt('quantity'),
    shopItem: t.relation('shopItem'),
    paymentMethod: t.expose('paymentMethod', { type: PaymentMethodEnum }),
    lydiaTransaction: t.relation('lydiaTransaction'),
    createdAt: t.expose('createdAt', { type: DateTimeScalar }),
    updatedAt: t.expose('updatedAt', { type: DateTimeScalar }),
  }),
});

builder.mutationField('upsertShopPayment', (t) =>
  t.prismaField({
    type: ShopPaymentType,
    errors: {},
    args: {
      id: t.arg.id({ required: false }),
      userUid: t.arg.string({ required: true }),
      shopItemId: t.arg.string({ required: true }),
      quantity: t.arg.int({ required: true }),
      paymentMethod: t.arg.string({ required: true }),
      paid: t.arg.boolean({ required: true }),
    },
    async resolve(query, _, { id, userUid, shopItemId, quantity, paymentMethod, paid }, { user }) {
      const shopItem = await prisma.shopItem.findUniqueOrThrow({
        where: { id: shopItemId },
        include: {
          group: true,
          lydiaAccount: true,
        },
      });

      const shopPayment = await prisma.shopPayment.upsert({
        ...query,
        where: { id: id ?? '' },
        create: {
          user: { connect: { uid: userUid } },
          shopItem: { connect: { id: shopItem.id } },
          quantity,
          paymentMethod: paymentMethod as PaymentMethodPrisma,
          paid,
        },
        update: {
          user: { connect: { uid: userUid } },
          shopItem: { connect: { id: shopItem.id } },
          quantity,
          paymentMethod: paymentMethod as PaymentMethodPrisma,
          paid,
        },
      });

      await prisma.logEntry.create({
        data: {
          area: 'shop payment',
          action: 'create',
          target: shopPayment.id,
          message: `${shopItem.name} (x${quantity}) for ${userUid} ${paid ? 'paid' : 'not paid'}`,
          user: user ? { connect: { id: user.id } } : undefined,
        },
      });

      return shopPayment;
    },
  }),
);

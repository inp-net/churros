import { builder } from '../builder.js';
import { DateTimeScalar } from './scalars.js';
import { prisma } from '../prisma.js';
import { payEventRegistrationViaLydia } from '../services/lydia.js';
import { GraphQLError } from 'graphql';
import { PaymentMethodEnum } from './registrations.js';
import type { PaymentMethod as PaymentMethodPrisma } from '@prisma/client';

export const ShopPaymentType = builder.prismaObject('ShopPayment', {
  fields: (t) => ({
    id: t.exposeID('id'),
    user: t.relation('user'),
    paid: t.exposeBoolean('paid'),
    quantity: t.exposeInt('quantity'),
    shopItem: t.relation('shopItem'),
    paymentMethod: t.expose('paymentMethod', { type: PaymentMethodEnum }),
    createdAt: t.expose('createdAt', { type: DateTimeScalar }),
    updatedAt: t.expose('updatedAt', { type: DateTimeScalar }),
  }),
});

builder.queryField('orders', (t) =>
  t.prismaField({
    type: [ShopPaymentType],
    args: {
      groupUid: t.arg.string(),
    },
    async resolve(query, _, { groupUid }, { user }) {
      return prisma.shopPayment.findMany({
        ...query,
        where: {
          user: {
            id: user?.id,
          },
          shopItem: {
            group: {
              uid: groupUid,
            },
          },
        },
        include: {
          shopItem: {
            include: {
              pictures: true,
            },
          },
        },
      });
    },
  }),
);

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
      phone: t.arg.string(),
    },
    async resolve(
      query,
      _,
      { id, userUid, shopItemId, quantity, paymentMethod, paid, phone },
      { user },
    ) {
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

      await pay(
        userUid,
        shopItem.group.name,
        quantity * shopItem.price,
        paymentMethod as PaymentMethodPrisma,
        phone,
      );

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

async function pay(
  from: string,
  to: string,
  amount: number,
  by: PaymentMethodPrisma,
  phone?: string,
  registrationId?: string,
) {
  switch (by) {
    case 'Lydia': {
      if (!phone) throw new GraphQLError('Missing phone number');
      await payEventRegistrationViaLydia(phone, registrationId);
      return;
    }

    default: {
      return new Promise((_resolve, reject) => {
        reject(
          new GraphQLError(`Attempt to pay ${to} ${amount} from ${from} by ${by}: not implemented`),
        );
      });
    }
  }
}

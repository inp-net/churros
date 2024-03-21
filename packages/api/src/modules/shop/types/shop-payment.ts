import { builder, prisma } from '#lib';
import { DateTimeScalar } from '#modules/global';
import { PaymentMethodEnum, payShopPaymentViaLydia } from '#modules/payments';
import {
  type Group,
  type LydiaAccount,
  type LydiaTransaction,
  type PaymentMethod as PaymentMethodPrisma,
  type ShopItem,
  type ShopPayment,
} from '@prisma/client';
import { GraphQLError } from 'graphql';

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
  }),
});

builder.mutationField('paidShopPayment', (t) =>
  t.prismaField({
    type: ShopPaymentType,
    errors: {},
    args: {
      shopPaymentId: t.arg.id(),
      paymentMethod: t.arg({ type: PaymentMethodEnum, required: false }),
      phone: t.arg.string({ required: false }),
    },
    async authScopes(_, { shopPaymentId }, { user }) {
      if (!user) return false;
      const shopPayment = await prisma.shopPayment.findUnique({
        where: { id: shopPaymentId, paid: false },
        include: {
          shopItem: {
            include: {
              group: true,
              lydiaAccount: true,
            },
          },
        },
      });

      if (!shopPayment) throw new GraphQLError("La commande n'existe pas");

      return true;
    },
    async resolve(query, _, { shopPaymentId, paymentMethod, phone }, { user }) {
      if (!user) throw new GraphQLError('User not found');

      const shopPayment = await prisma.shopPayment.findUnique({
        where: { id: shopPaymentId, paid: false },
        include: {
          shopItem: {
            include: { group: true, lydiaAccount: true, shopPayments: { where: { paid: true } } },
          },
          lydiaTransaction: true,
        },
      });

      if (!shopPayment) throw new GraphQLError('Shop payment not found');

      if (!paymentMethod) throw new GraphQLError('Payment method not found');

      const stockLeft =
        shopPayment.shopItem.stock === 0
          ? Number.POSITIVE_INFINITY
          : shopPayment.shopItem.stock -
            shopPayment.shopItem.shopPayments.reduce((acc, curr) => acc + curr.quantity, 0);

      const userLeft =
        shopPayment.shopItem.max -
        shopPayment.shopItem.shopPayments.reduce(
          (acc, curr) => acc + (curr.userId === user.uid ? curr.quantity : 0),
          0,
        );

      if (shopPayment.quantity > stockLeft) throw new GraphQLError('Not enough stock');
      else if (shopPayment.quantity > userLeft) throw new GraphQLError('Too much quantity');

      // Process payment
      await pay(user.uid, paymentMethod, shopPayment, phone);

      await prisma.logEntry.create({
        data: {
          area: 'shop payment',
          action: 'update',
          target: shopPaymentId,
          message: `${shopPayment.shopItem.name} (x${shopPayment.quantity}) for ${user.uid}`,
          user: { connect: { id: user.id } },
        },
      });

      return prisma.shopPayment.update({
        ...query,
        where: { id: shopPaymentId },
        data: {
          paymentMethod,
        },
      });
    },
  }),
);

async function pay(
  from: string,
  by: PaymentMethodPrisma,
  shopPayment: ShopPayment & {
    shopItem: ShopItem & { lydiaAccount: LydiaAccount | null; group: Group };
    lydiaTransaction: LydiaTransaction | null;
  },
  phone?: string | null,
) {
  switch (by) {
    case 'Lydia': {
      if (!phone) throw new GraphQLError('Missing phone number');
      await payShopPaymentViaLydia(phone, shopPayment);
      return;
    }

    default: {
      return new Promise((_resolve, reject) => {
        reject(
          new GraphQLError(
            `Attempt to pay ${shopPayment.shopItem.groupId} ${shopPayment.totalPrice} from ${from} by ${by}: not implemented`,
          ),
        );
      });
    }
  }
}

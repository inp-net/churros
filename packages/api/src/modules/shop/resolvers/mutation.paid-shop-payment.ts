import { builder, prisma } from '#lib';
import { PaymentMethodEnum, payShopPaymentViaLydia } from '#modules/payments';
import { userIsOnBoardOf } from '#permissions';
import {
  PaymentMethod as PaymentMethodPrisma,
  type LydiaAccount,
  type LydiaTransaction,
  type ShopItem,
  type ShopPayment,
} from '@churros/db/prisma';
import { GraphQLError } from 'graphql';
import { ShopPaymentType } from '../index.js';

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
        where: { id: shopPaymentId },
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
        where: { id: shopPaymentId },
        include: {
          shopItem: {
            include: { group: true, lydiaAccount: true, shopPayments: { where: { paid: true } } },
          },
          lydiaTransaction: true,
        },
      });

      if (!shopPayment) throw new GraphQLError('Shop payment not found');
      if (user?.admin || userIsOnBoardOf(user, shopPayment.shopItem.group.uid)) {
        await prisma.shopPayment.update({
          where: { id: shopPaymentId },
          data: {
            paid: !shopPayment.paid,
          },
        });
        return shopPayment;
      }
      if (!paymentMethod) throw new GraphQLError('Payment method not found');

      const stockLeft =
        shopPayment.shopItem.stock === 0
          ? Number.POSITIVE_INFINITY
          : shopPayment.shopItem.stock -
            shopPayment.shopItem.shopPayments.reduce((acc, curr) => acc + curr.quantity, 0);

      const userLeft =
        shopPayment.shopItem.max === 0
          ? Number.POSITIVE_INFINITY
          : shopPayment.shopItem.max -
            shopPayment.shopItem.shopPayments.reduce(
              (acc, curr) => acc + (curr.userId === user.uid ? curr.quantity : 0),
              0,
            );

      if (shopPayment.quantity > stockLeft) throw new GraphQLError('Not enough stock');
      else if (shopPayment.quantity > userLeft) throw new GraphQLError('Too much quantity');

      // Process payment
      await pay({ shopPayment, phone: phone ?? '' });
      await prisma.logEntry.create({
        data: {
          area: 'shop payment',
          action: 'update',
          target: shopPaymentId,
          message: `${user.uid} tried to pay for shop payment ${shopPaymentId} with ${paymentMethod}, current state is ${shopPayment.paid}`,
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

async function pay({
  shopPayment,
  phone,
}: {
  shopPayment: ShopPayment & {
    shopItem: ShopItem & { lydiaAccount: LydiaAccount | null };
    lydiaTransaction: LydiaTransaction | null;
  };
  phone: string;
}): Promise<string | undefined> {
  switch (shopPayment.paymentMethod) {
    case PaymentMethodPrisma.Lydia: {
      if (!phone) throw new GraphQLError('Phone number is required');
      await payShopPaymentViaLydia(phone, shopPayment);
      return '';
    }
    default: {
      throw new GraphQLError('Payment method not supported');
    }
  }
}

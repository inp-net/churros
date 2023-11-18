import { builder } from '../builder.js';
import { DateTimeScalar } from './scalars.js';
import { prisma } from '../prisma.js';
import { payShopPaymentViaLydia } from '../services/lydia.js';
import { GraphQLError } from 'graphql';
import { PaymentMethodEnum } from './registrations.js';
import type {
  Group,
  LydiaAccount,
  LydiaTransaction,
  PaymentMethod as PaymentMethodPrisma,
  ShopItem,
  ShopPayment,
} from '@prisma/client';

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
        orderBy: {
          createdAt: 'desc',
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
      paymentMethod: t.arg.string({ required: false }),
    },
    async resolve(query, _, { id, userUid, shopItemId, quantity, paymentMethod }, { user }) {
      const shopItem = await prisma.shopItem.findUniqueOrThrow({
        where: { id: shopItemId },
        include: {
          group: true,
          lydiaAccount: true,
        },
      });

      if (shopItem.stock < quantity) {
        throw new GraphQLError('Not enough stock');
      } else if (shopItem.max < quantity) {
        throw new GraphQLError('Too much quantity');
      }

      const shopPayment = await prisma.shopPayment.upsert({
        ...query,
        where: { id: id ?? '' },
        create: {
          user: { connect: { uid: userUid } },
          shopItem: { connect: { id: shopItem.id } },
          quantity,
          paymentMethod: paymentMethod as PaymentMethodPrisma,
        },
        update: {
          user: { connect: { uid: userUid } },
          shopItem: { connect: { id: shopItem.id } },
          quantity,
          paymentMethod: paymentMethod as PaymentMethodPrisma,
        },
      });

      await prisma.logEntry.create({
        data: {
          area: 'shop payment',
          action: 'create',
          target: shopPayment.id,
          message: `${shopItem.name} (x${quantity}) for ${userUid}`,
          user: user ? { connect: { id: user.id } } : undefined,
        },
      });

      return shopPayment;
    },
  }),
);

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
      const creating = !shopPaymentId;
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

      if (creating) {
        if (shopPayment.quantity > shopPayment.shopItem.stock) {
          throw new GraphQLError('Not enough stock');
        }
      }

      return true;
    },
    async resolve(query, _, { shopPaymentId, paymentMethod, phone }, { user }) {
      if (!user) throw new GraphQLError('User not found');

      const shopPayment = await prisma.shopPayment.findUnique({
        where: { id: shopPaymentId },
        include: {
          shopItem: { include: { group: true, lydiaAccount: true } },
          lydiaTransaction: true,
        },
      });
      if (!shopPayment) throw new GraphQLError('Shop payment not found');
      if (!paymentMethod) throw new GraphQLError('Payment method not found');
      if (!phone) throw new GraphQLError('Phone not found');

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
  phone?: string,
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
            `Attempt to pay ${shopPayment.shopItem.groupId} ${
              shopPayment.shopItem.price * shopPayment.quantity
            } from ${from} by ${by}: not implemented`,
          ),
        );
      });
    }
  }
}

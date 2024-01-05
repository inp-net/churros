import { builder, prisma } from '#lib';
import {
  Visibility,
  type Group,
  type LydiaAccount,
  type LydiaTransaction,
  type PaymentMethod as PaymentMethodPrisma,
  type ShopItem,
  type ShopPayment,
} from '@prisma/client';
import { GraphQLError } from 'graphql';
import { onBoard } from '../auth.js';
import { payShopPaymentViaLydia } from '../services/lydia.js';
import { PaymentMethodEnum } from './registrations.js';
import { DateTimeScalar } from './scalars.js';

export const ShopPaymentType = builder.prismaObject('ShopPayment', {
  fields: (t) => ({
    id: t.exposeID('id'),
    user: t.relation('user'),
    paid: t.exposeBoolean('paid'),
    quantity: t.exposeInt('quantity'),
    totalPrice: t.exposeInt('totalPrice'),
    shopItem: t.relation('shopItem'),
    paymentMethod: t.expose('paymentMethod', { type: PaymentMethodEnum }),
    createdAt: t.expose('createdAt', { type: DateTimeScalar }),
    updatedAt: t.expose('updatedAt', { type: DateTimeScalar }),
  }),
});

builder.queryField('shopPayments', (t) =>
  t.prismaField({
    type: [ShopPaymentType],
    args: {
      shopItemId: t.arg.id(),
    },
    async authScopes(_, { shopItemId }, { user }) {
      if (!user) return false;

      const shopItem = await prisma.shopItem.findUniqueOrThrow({
        where: { id: shopItemId },
        include: {
          group: {
            include: {
              members: {
                include: {
                  member: true,
                },
                where: {
                  member: {
                    id: user.id,
                  },
                },
              },
            },
          },
        },
      });

      if (!shopItem) return false;

      if (!onBoard(shopItem.group.members[0])) return false;

      return true;
    },
    async resolve(query, _, { shopItemId }) {
      return prisma.shopPayment.findMany({
        ...query,
        where: {
          shopItem: {
            id: shopItemId,
          },
        },
        include: {
          user: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    },
  }),
);

builder.queryField('orders', (t) =>
  t.prismaField({
    type: [ShopPaymentType],
    args: {
      groupUid: t.arg.string({ required: false }),
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
              uid: groupUid ?? undefined,
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
    async authScopes(_, { shopItemId }, { user }) {
      if (!user) return false;

      const shopItem = await prisma.shopItem.findUniqueOrThrow({
        where: { id: shopItemId },
        include: {
          group: {
            include: {
              members: {
                include: {
                  member: true,
                },
                where: {
                  member: {
                    id: user.id,
                  },
                },
              },
              studentAssociation: {
                include: {
                  school: true,
                },
              },
            },
          },
        },
      });

      switch (shopItem.visibility) {
        case Visibility.Private: {
          if (!onBoard(shopItem.group.members[0])) return false;

          break;
        }

        case Visibility.Public:
        case Visibility.Unlisted: {
          break;
        }

        case Visibility.GroupRestricted: {
          if (shopItem.group.members.length > 0) break;

          return false;
        }

        case Visibility.SchoolRestricted: {
          if (shopItem.group.studentAssociation?.school.uid === user.schoolUid) break;

          return false;
        }

        default: {
          throw new GraphQLError('Something went wrong');
        }
      }

      return true;
    },
    async resolve(query, _, { id, userUid, shopItemId, quantity, paymentMethod }, { user }) {
      const shopItem = await prisma.shopItem.findUniqueOrThrow({
        where: { id: shopItemId },
        include: {
          group: true,
          lydiaAccount: true,
          shopPayments: {
            where: {
              paid: true,
            },
          },
        },
      });

      const stockLeft =
        shopItem.stock - shopItem.shopPayments.reduce((acc, curr) => acc + curr.quantity, 0);

      const userLeft =
        shopItem.max -
        shopItem.shopPayments.reduce(
          (acc, curr) => acc + (curr.userId === userUid ? curr.quantity : 0),
          0,
        );

      if (stockLeft < quantity) throw new GraphQLError('Not enough stock');
      else if (userLeft < quantity) throw new GraphQLError('Too much quantity');

      const shopPayment = await prisma.shopPayment.upsert({
        ...query,
        where: { id: id ?? '' },
        create: {
          user: { connect: { uid: userUid } },
          shopItem: { connect: { id: shopItem.id } },
          quantity,
          totalPrice: shopItem.price * quantity,
          paymentMethod: paymentMethod as PaymentMethodPrisma,
          paid: shopItem.price === 0,
        },
        update: {
          user: { connect: { uid: userUid } },
          shopItem: { connect: { id: shopItem.id } },
          quantity,
          totalPrice: shopItem.price * quantity,
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
        shopPayment.shopItem.stock -
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

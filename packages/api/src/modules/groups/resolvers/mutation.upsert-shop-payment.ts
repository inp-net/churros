import { builder, prisma } from '#lib';
import { onBoard } from '#permissions';
import { Visibility, type PaymentMethod as PaymentMethodPrisma } from '@prisma/client';
import { GraphQLError } from 'graphql';
import { ShopPaymentType } from '../index.js';

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

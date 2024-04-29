import { builder, prisma } from '#lib';
import { onBoard } from '#permissions';
import { ShopPaymentType } from '../index.js';

builder.queryField('shopPayments', (t) =>
  t.prismaField({
    type: [ShopPaymentType],
    args: {
      shopItemId: t.arg.id(),
    },
    async authScopes(_, { shopItemId }, { user }) {
      if (!user) return false;
      if (user.admin) return true;

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

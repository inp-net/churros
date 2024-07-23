import { builder, prisma } from '#lib';
import { GroupType } from '#modules/groups';
import { ShopPaymentType } from '../index.js';

builder.prismaObjectField(GroupType, 'shopOrders', (t) =>
  t.prismaField({
    type: [ShopPaymentType],
    async resolve(query, { uid: groupUid }, _, { user }) {
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

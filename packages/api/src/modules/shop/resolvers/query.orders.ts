import { builder, prisma } from '#lib';
import { ShopPaymentType } from '../index.js';

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

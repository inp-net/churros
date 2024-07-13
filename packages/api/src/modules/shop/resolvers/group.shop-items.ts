import { builder, prisma } from '#lib';
import { GroupType } from '#modules/groups';
import { ShopItemType } from '../index.js';
import { canListShopItem } from '../utils/permissions.js';

builder.prismaObjectField(GroupType, 'shopItems', (t) =>
  t.prismaConnection({
    type: ShopItemType,
    cursor: 'id',
    async resolve(query, { id: groupId }, _, { user }) {
      const items = await prisma.shopItem.findMany({
        ...query,
        where: { groupId },
        include: {
          group: {
            include: {
              members: {
                include: {
                  member: true,
                },
                where: {
                  member: {
                    id: user?.id,
                  },
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      return items.filter((item) => canListShopItem(item, user));
    },
  }),
);

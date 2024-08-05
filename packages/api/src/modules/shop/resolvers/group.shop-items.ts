import { builder, prisma } from '#lib';
import { GroupType } from '#modules/groups';
import { GraphQLError } from 'graphql';
import { canListShopItem, ShopItemType } from '../index.js';

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
              studentAssociation: {
                select: {
                  schoolId: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      if (!items) throw new GraphQLError('No item found');
      if (user?.admin) return items;
      return items.filter((item) => canListShopItem(user, item));
    },
  }),
);

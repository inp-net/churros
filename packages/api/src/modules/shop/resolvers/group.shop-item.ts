import { builder, ensureGlobalId, prisma } from '#lib';
import { LocalID } from '#modules/global';
import { GroupType } from '#modules/groups';
import { ShopItemType } from '#modules/shop/types';
import { canAccessShopItem } from '../utils/permissions.js';

builder.prismaObjectField(GroupType, 'shopItem', (t) =>
  t.prismaField({
    type: ShopItemType,
    nullable: true,
    description: 'Article de la boutique du groupe',
    args: {
      id: t.arg({ type: LocalID }),
    },
    async authScopes(group, { id }, { user }) {
      const item = await prisma.shopItem.findUniqueOrThrow({
        where: {
          id: ensureGlobalId(id, 'ShopItem'),
          groupId: group.id,
        },
      });
      return canAccessShopItem(user, { ...item, group });
    },
    async resolve(query, group, { id }) {
      return prisma.shopItem.findUnique({
        ...query,
        where: {
          id: ensureGlobalId(id, 'ShopItem'),
          groupId: group.id,
        },
      });
    },
  }),
);

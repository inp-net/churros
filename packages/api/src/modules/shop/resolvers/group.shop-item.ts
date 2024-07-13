import { builder, prisma } from '#lib';
import { GroupType } from '#modules/groups';
import { ShopItemType } from '#modules/shop/types';
import { GraphQLError } from 'graphql';
import { canAccessShopItem } from '../utils/permissions.js';

builder.prismaObjectField(GroupType, 'shopItem', (t) =>
  t.prismaField({
    type: ShopItemType,
    nullable: true,
    args: {
      // TODO use a (local) ID instead
      slug: t.arg.string(),
    },
    async authScopes(group, { slug }, { user }) {
      const item = await prisma.shopItem.findFirst({
        where: { slug },
      });
      if (!item) throw new GraphQLError('Article introuvable');
      return canAccessShopItem({ group, ...item }, user);
    },
    async resolve(query, group, { slug }) {
      return prisma.shopItem.findFirst({
        ...query,
        where: { slug, groupId: group.id },
      });
    },
  }),
);

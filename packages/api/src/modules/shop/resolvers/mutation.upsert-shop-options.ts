import { builder, prisma } from '#lib';
import { userIsOnBoardOf } from '#permissions';
import { GraphQLError } from 'graphql';
import { ShopItemOptionInput } from '../index.js';

builder.mutationField('upsertShopOptions', (t) =>
  t.field({
    type: 'Boolean',
    args: {
      shopItemId: t.arg.string(),
      itemOptions: t.arg({ type: [ShopItemOptionInput] }),
    },
    async authScopes(_, { shopItemId }, { user }) {
      const shopItem = await prisma.shopItem.findUnique({
        where: { id: shopItemId },
        select: { group: { select: { uid: true } } },
      });
      if (!shopItem) throw new Error('Shop item not found');
      return Boolean(user?.admin || userIsOnBoardOf(user, shopItem.group.uid));
    },
    async resolve(_, { shopItemId, itemOptions }) {
      for (const itemOption of itemOptions) {
        let Option;
        if (itemOption.id) {
          Option = await prisma.shopItemOption.update({
            where: { id: itemOption.id },
            data: {
              name: itemOption.name,
              options: itemOption.options,
              required: itemOption.required,
              otherToggle: itemOption.otherToggle,
            },
          });
          if (!Option) throw new GraphQLError('Failed to update shop item option');
        } else {
          Option = await prisma.shopItemOption.create({
            data: {
              name: itemOption.name,
              options: itemOption.options,
              shopItem: { connect: { id: shopItemId } },
              required: itemOption.required,
              otherToggle: itemOption.otherToggle,
            },
          });
          if (!Option) throw new GraphQLError('Failed to create shop item option');
        }
      }
      return true;
    },
  }),
);

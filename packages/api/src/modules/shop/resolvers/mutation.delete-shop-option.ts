import { builder, prisma } from '#lib';
import { userIsOnBoardOf } from '#permissions';

builder.mutationField('deleteShopOption', (t) =>
  t.field({
    type: 'Boolean',
    args: {
      optionIds: t.arg.stringList(),
    },
    async authScopes(_, { optionIds }, { user }) {
      const option = await prisma.shopItemOption.findUnique({
        where: { id: optionIds[0] },
        select: { shopItem: { select: { group: { select: { uid: true } } } } },
      });
      if (!option) throw new Error('Shop option not found');
      return Boolean(user?.admin || userIsOnBoardOf(user, option.shopItem.group.uid));
    },
    async resolve(_, { optionIds }) {
      for (const id of optionIds) {
        const deletedOption = await prisma.shopItemOption.delete({ where: { id } });
        if (!deletedOption) throw new Error('Failed to delete shop option');
      }
      return true;
    },
  }),
);

import { builder, log, prisma, storageRoot } from '#lib';
import { userIsOnBoardOf } from '#permissions';
import { GraphQLError } from 'graphql';
import { unlink } from 'node:fs/promises';
import path from 'node:path';

builder.mutationField('deleteShopItem', (t) =>
  t.field({
    type: 'Boolean',
    errors: {},
    args: {
      itemId: t.arg.id(),
      groupUid: t.arg.string(),
    },
    authScopes: (_, { groupUid }, { user }) =>
      Boolean(user?.admin || userIsOnBoardOf(user, groupUid)),
    async resolve(_, { itemId }, { user }) {
      const shopItem = await prisma.shopItem.findUniqueOrThrow({
        where: { id: itemId },
        include: {
          shopPayments: true,
          pictures: true,
        },
      });

      if (!shopItem) throw new GraphQLError('Item not found');

      if (shopItem.shopPayments && shopItem.shopPayments.length > 0)
        throw new GraphQLError('You cannot delete an item where someone has placed an order on');

      //Delete all pictures of the item if there are any (let's save some Giga-Octets)
      const root = storageRoot();
      for (const picture of shopItem.pictures) {
        await unlink(path.join(root, picture.path));
        await prisma.picture.delete({ where: { id: picture.id } });
      }

      await prisma.shopItem.delete({
        where: { id: itemId },
      });

      await log(
        'group',
        'delete',
        { message: `Suppression de l'article ${shopItem.name} par ${user?.uid}` },
        itemId,
        user,
      );

      return true;
    },
  }),
);

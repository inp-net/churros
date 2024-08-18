import { builder, log, prisma, storageRoot } from '#lib';
import { userIsOnBoardOf } from '#permissions';
import { GraphQLError } from 'graphql';
import { unlink } from 'node:fs/promises';
import path from 'node:path';

builder.mutationField('deleteItemPicture', (t) =>
  t.field({
    type: 'Boolean',
    args: {
      itemId: t.arg.string(),
      pictureId: t.arg.string(),
      groupUid: t.arg.string(),
    },
    authScopes: (_, { groupUid }, { user }) =>
      Boolean(user?.admin || userIsOnBoardOf(user, groupUid)),
    async resolve(_, { itemId, pictureId, groupUid }, { user }) {
      if (!(user?.admin || userIsOnBoardOf(user, groupUid)))
        throw new GraphQLError('You do not have the rights to delete this picture');
      const pictureFile = await prisma.picture.findUniqueOrThrow({
        where: { id: pictureId },
        select: { path: true },
      });
      const root = storageRoot();
      if (pictureFile) await unlink(path.join(root, pictureFile.path));
      await prisma.picture.delete({ where: { id: pictureId } });
      await prisma.shopItem.update({
        where: { id: itemId },
        data: { pictures: { disconnect: { id: pictureId } } },
      });
      await log('shop', 'update', { message: `Suppression de la photo` }, itemId, user);
      return true;
    },
  }),
);

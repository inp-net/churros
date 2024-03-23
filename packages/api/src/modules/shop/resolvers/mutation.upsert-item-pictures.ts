import { builder, prisma, updatePicture } from '#lib';
import { userIsOnBoardOf } from '#permissions';
import { GraphQLError } from 'graphql';
import { PictureType } from '../index.js';

builder.mutationField('updateItemPicture', (t) =>
  t.field({
    type: PictureType,
    args: {
      itemId: t.arg.string(),
      groupUid: t.arg.string(),
      file: t.arg({ type: 'File' }),
    },
    authScopes: (_, { groupUid }, { user }) =>
      Boolean(user?.admin || user?.groups.some(({ group }) => group.uid === groupUid)),
    async resolve(_, { itemId, file, groupUid }, { user }) {
      if (!(user?.admin || userIsOnBoardOf(user, groupUid)))
        throw new GraphQLError('You do not have the rights to update this picture');
      await prisma.logEntry.create({
        data: {
          area: 'shop',
          action: 'update',
          target: itemId,
          message: `Updated item ${itemId} pictures`,
          user: user ? { connect: { id: user.id } } : undefined,
        },
      });
      let picture = await prisma.picture.create({
        data: { path: '' },
      });
      await updatePicture({
        resource: 'photos',
        folder: 'photos',
        extension: 'png',
        file: file,
        identifier: picture.id,
      });

      await prisma.shopItem.update({
        where: { id: itemId },
        data: {
          pictures: {
            connect: {
              id: picture.id,
            },
          },
        },
      });
      picture = await prisma.picture.findFirstOrThrow({
        where: {
          id: picture.id,
        },
      });
      return picture;
    },
  }),
);

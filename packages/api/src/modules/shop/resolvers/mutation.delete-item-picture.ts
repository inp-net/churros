import { builder, prisma } from '#lib';
import { userIsOnBoardOf } from '#permissions';
import { GraphQLError } from 'graphql';
import { unlink } from 'node:fs/promises';
import path from 'node:path';

builder.mutationField('deleteItemPicture', (t) =>
  t.field({
    type: 'Boolean',
    args: {
      id: t.arg.string(),
      pictureId: t.arg.string(),
      groupUid: t.arg.string(),
    },
    authScopes: (_, { groupUid }, { user }) =>
      Boolean(user?.admin || user?.groups.some(({ group }) => group.uid === groupUid)),
    async resolve(_, { id, pictureId, groupUid }, { user }) {
      if (!userIsOnBoardOf(user, groupUid))
        throw new GraphQLError('What tf are you trying to do mate ?');
      const pictureFile = await prisma.picture.findUniqueOrThrow({
        where: { id: pictureId },
        select: { path: true },
      });
      const root = new URL(process.env.STORAGE).pathname;
      if (pictureFile) await unlink(path.join(root, pictureFile.path));
      await prisma.picture.delete({ where: { id: pictureId } });
      await prisma.shopItem.update({
        where: { id },
        data: { pictures: { disconnect: { id: pictureId } } },
      });
      await prisma.logEntry.create({
        data: {
          area: 'shop',
          action: 'update',
          target: id,
          message: `Suppression de la photo`,
          user: user ? { connect: { id: user.id } } : undefined,
        },
      });
      return true;
    },
  }),
);

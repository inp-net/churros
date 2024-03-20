import { builder, prisma, updatePicture } from '#lib';
import { userIsOnBoardOf } from '#permissions';
import { GraphQLError } from 'graphql';

builder.mutationField('upsertItemPictures', (t) =>
  t.field({
    type: 'String',
    args: {
      id: t.arg.string(),
      groupUid: t.arg.string(),
      files: t.arg({ type: 'File' }),
    },
    authScopes: (_, { groupUid }, { user }) =>
      Boolean(user?.admin || user?.groups.some(({ group }) => group.uid === groupUid)),
    async resolve(_, { id, files, groupUid }, { user }) {
      if (!userIsOnBoardOf(user, groupUid))
        throw new GraphQLError('What tf are you trying to do mate ?');
      await prisma.logEntry.create({
        data: {
          area: 'shop',
          action: 'update',
          target: id,
          message: `Updated item ${id} pictures`,
          user: user ? { connect: { id: user.id } } : undefined,
        },
      });
      return updatePicture({
        resource: 'group',
        folder: 'shop',
        extension: 'png',
        file: files[0],
        identifier: id,
      });
    },
  }),
);

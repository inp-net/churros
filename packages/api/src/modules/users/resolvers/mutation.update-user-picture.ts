import { builder, prisma, updatePicture } from '#lib';
import { FileScalar } from '#modules/global';

builder.mutationField('updateUserPicture', (t) =>
  t.field({
    type: 'String',
    args: {
      uid: t.arg.string(),
      file: t.arg({ type: FileScalar }),
    },
    authScopes: (_, { uid }, { user }) => Boolean(user?.canEditUsers || uid === user?.uid),
    async resolve(_, { uid, file }, { user }) {
      await prisma.logEntry.create({
        data: {
          area: 'user',
          action: 'update',
          target: user?.id ?? '',
          message: `Updated user ${uid} picture`,
          user: user ? { connect: { id: user.id } } : undefined,
        },
      });
      return updatePicture({
        resource: 'user',
        folder: 'users',
        extension: 'png',
        file,
        identifier: uid,
      });
    },
  }),
);

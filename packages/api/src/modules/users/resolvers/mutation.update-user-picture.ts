import { builder, log, objectValuesFlat, prisma, updatePicture } from '#lib';
import { FileScalar } from '#modules/global';
import { userIsAdminOf } from '#permissions';

builder.mutationField('updateUserPicture', (t) =>
  t.field({
    type: 'String',
    args: {
      uid: t.arg.string(),
      file: t.arg({ type: FileScalar }),
    },
    async authScopes(_, { uid }, { user }) {
      const studentAssociations = objectValuesFlat(
        await prisma.user.findUnique({
          where: { uid },
          select: {
            major: {
              select: { schools: { select: { studentAssociations: { select: { id: true } } } } },
            },
          },
        }),
      );

      return Boolean(userIsAdminOf(user, studentAssociations) || uid === user?.uid);
    },
    async resolve(_, { uid, file }, { user }) {
      await log('user', 'update', { message: `Updated user ${uid} picture` }, user?.id ?? '', user);
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

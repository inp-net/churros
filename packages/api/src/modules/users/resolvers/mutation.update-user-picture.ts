import { builder, objectValuesFlat, prisma, updatePicture } from '#lib';
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

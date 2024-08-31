import { builder, log, objectValuesFlat, prisma, storageRoot } from '#lib';
import { unlink } from 'node:fs/promises';
import path from 'node:path';
import { userIsAdminOf } from '../../../permissions/index.js';

builder.mutationField('deleteUserPicture', (t) =>
  t.field({
    type: 'Boolean',
    args: { uid: t.arg.string() },
    async authScopes(_, { uid }, { user }) {
      const studentAssociationsIds = objectValuesFlat(
        await prisma.user.findUniqueOrThrow({
          where: { uid },
          select: {
            major: {
              select: { schools: { select: { studentAssociations: { select: { id: true } } } } },
            },
          },
        }),
      );

      return Boolean(userIsAdminOf(user, studentAssociationsIds) || uid === user?.uid);
    },
    async resolve(_, { uid }, { user: me }) {
      const { pictureFile } = await prisma.user.findUniqueOrThrow({
        where: { uid },
        select: { pictureFile: true },
      });

      const root = storageRoot();

      if (pictureFile) await unlink(path.join(root, pictureFile));

      await prisma.user.update({
        where: { uid },
        data: { pictureFile: '' },
      });
      await log('user', 'update', { message: `Deleted user ${uid} picture` }, uid, me);
      return true;
    },
  }),
);

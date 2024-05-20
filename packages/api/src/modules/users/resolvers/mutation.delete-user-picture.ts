import { builder, objectValuesFlat, prisma } from '#lib';

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
    async resolve(_, { uid }) {
      const { pictureFile } = await prisma.user.findUniqueOrThrow({
        where: { uid },
        select: { pictureFile: true },
      });

      const root = new URL(process.env.STORAGE).pathname;

      if (pictureFile) await unlink(path.join(root, pictureFile));

      await prisma.user.update({
        where: { uid },
        data: { pictureFile: '' },
      });
      await prisma.logEntry.create({
        data: {
          area: 'user',
          action: 'update',
          target: uid,
          message: `Deleted user ${uid} picture`,
          user: { connect: { uid } },
        },
      });
      return true;
    },
  }),
);

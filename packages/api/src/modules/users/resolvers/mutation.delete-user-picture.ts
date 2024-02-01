import { builder, prisma } from '#lib';

import { unlink } from 'node:fs/promises';
import path from 'node:path';

builder.mutationField('deleteUserPicture', (t) =>
  t.field({
    type: 'Boolean',
    args: { uid: t.arg.string() },
    authScopes: (_, { uid }, { user }) => Boolean(user?.canEditUsers || uid === user?.uid),
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

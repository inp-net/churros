import { builder, objectValuesFlat, prisma } from '#lib';

import { unlink } from 'node:fs/promises';
import path from 'node:path';
import { userIsAdminOf, userIsGroupEditorOf } from '../../../permissions/index.js';

/** Delete the club's picture */
builder.mutationField('deleteGroupPicture', (t) =>
  t.field({
    type: 'Boolean',
    args: { uid: t.arg.string(), dark: t.arg.boolean() },
    async authScopes(_, { uid }, { user }) {
      const studentAssociationIds = objectValuesFlat(
        await prisma.group.findUniqueOrThrow({
          where: { uid },
          select: { studentAssociationId: true },
        }),
      );

      return Boolean(
        userIsAdminOf(user, studentAssociationIds) ||
          userIsGroupEditorOf(user, studentAssociationIds) ||
          uid === user?.uid,
      );
    },
    async resolve(_, { uid, dark }, { user }) {
      const { pictureFile } = await prisma.group.findUniqueOrThrow({
        where: { uid },
        select: { pictureFile: true },
      });

      const root = new URL(process.env.STORAGE).pathname;

      if (pictureFile) await unlink(path.join(root, pictureFile));

      await prisma.group.update({
        where: { uid },
        data: { [dark ? 'pictureFileDark' : 'pictureFile']: '' },
      });
      await prisma.logEntry.create({
        data: {
          area: 'group',
          action: 'update',
          target: uid,
          message: `Suppression de la photo ${dark ? 'sombre' : 'claire'}`,
          user: { connect: { id: user?.id } },
        },
      });
      return true;
    },
  }),
);

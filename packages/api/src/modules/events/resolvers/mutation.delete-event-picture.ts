import { builder, prisma } from '#lib';

import { unlink } from 'node:fs/promises';
import { join } from 'node:path';
import { canEditEvent } from '../utils/permissions.js';

builder.mutationField('deleteEventPicture', (t) =>
  t.field({
    type: 'Boolean',
    args: {
      id: t.arg.id(),
    },
    async authScopes(_, { id }, { user }) {
      const event = await prisma.event.findUniqueOrThrow({
        where: { id },
        include: { managers: true },
      });
      return canEditEvent(user, event);
    },
    async resolve(_, { id }) {
      const { pictureFile } = await prisma.event.findUniqueOrThrow({
        where: { id },
        select: { pictureFile: true },
      });

      const root = new URL(process.env.STORAGE).pathname;

      if (pictureFile) await unlink(join(root, pictureFile));
      await prisma.event.update({ where: { id }, data: { pictureFile: '' } });
      return true;
    },
  }),
);

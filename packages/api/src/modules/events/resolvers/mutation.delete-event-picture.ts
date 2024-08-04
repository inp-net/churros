import { builder, prisma, storageRoot } from '#lib';
import { EventType } from '#modules/events/types';
import { canEditEvent, canEditEventPrismaIncludes } from '#modules/events/utils';
import { unlink } from 'node:fs/promises';
import { join } from 'node:path';

builder.mutationField('deleteEventPicture', (t) =>
  t.prismaField({
    type: EventType,
    args: {
      // no localID here, we'll have less stuff to adapt on the frontend once picture stuff is moved into its own module with a single updatePicture mutation (kinda like links)
      id: t.arg.id(),
    },
    async authScopes(_, { id }, { user }) {
      const event = await prisma.event.findUniqueOrThrow({
        where: { id },
        include: canEditEventPrismaIncludes,
      });

      return canEditEvent(event, user);
    },
    async resolve(query, _, { id }) {
      const { pictureFile } = await prisma.event.findUniqueOrThrow({
        where: { id },
        select: { pictureFile: true },
      });

      const root = storageRoot();
      if (pictureFile) await unlink(join(root, pictureFile));
      return prisma.event.update({ ...query, where: { id }, data: { pictureFile: '' } });
    },
  }),
);

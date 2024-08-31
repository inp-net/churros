import { builder, prisma, updatePicture } from '#lib';
import { EventType } from '#modules/events/types';
import { FileScalar } from '#modules/global';
import { canEditEvent, canEditEventPrismaIncludes } from '../utils/index.js';

builder.mutationField('updateEventPicture', (t) =>
  t.prismaField({
    type: EventType,
    args: {
      // no localID here, we'll have less stuff to adapt on the frontend once picture stuff is moved into its own module with a single updatePicture mutation (kinda like links)
      id: t.arg.id(),
      file: t.arg({ type: FileScalar }),
    },
    async authScopes(_, { id }, { user }) {
      const event = await prisma.event.findUniqueOrThrow({
        where: { id },
        include: canEditEventPrismaIncludes,
      });

      return canEditEvent(event, user);
    },
    async resolve(query, _, { id, file }) {
      await updatePicture({
        resource: 'event',
        folder: 'events',
        extension: 'jpg',
        file,
        identifier: id,
      });
      return prisma.event.findUniqueOrThrow({ ...query, where: { id } });
    },
  }),
);

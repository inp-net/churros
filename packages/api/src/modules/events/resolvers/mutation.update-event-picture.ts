import { builder, prisma, updatePicture } from '#lib';
import { FileScalar } from '#modules/global';
import { canEdit } from '../utils/permissions.js';

builder.mutationField('updateEventPicture', (t) =>
  t.field({
    type: 'String',
    args: {
      id: t.arg.id(),
      file: t.arg({ type: FileScalar }),
    },
    async authScopes(_, { id }, { user }) {
      const event = await prisma.event.findUniqueOrThrow({
        where: { id },
        include: { managers: true },
      });
      return canEdit(event, user);
    },
    async resolve(_, { id, file }) {
      return updatePicture({
        resource: 'event',
        folder: 'events',
        extension: 'jpg',
        file,
        identifier: id,
      });
    },
  }),
);

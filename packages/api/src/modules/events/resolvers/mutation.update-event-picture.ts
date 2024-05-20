import { builder, objectValuesFlat, prisma, updatePicture } from '#lib';
import { FileScalar } from '#modules/global';
import { userIsAdminOf } from '#permissions';
import { canEdit } from '../utils/index.js';

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
        include: { managers: true, group: true },
      });
      return userIsAdminOf(user, objectValuesFlat(event.group)) || canEdit(event, user);
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

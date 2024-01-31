import { builder, prisma, updatePicture } from '#lib';
import { FileScalar } from '#modules/global';

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
      });

      return Boolean(
        // Who can edit this event?
        // The author
        user?.id === event.authorId ||
          // Other authors of the group
          user?.groups.some(
            ({ groupId, canEditArticles }) => canEditArticles && groupId === event.groupId,
          ),
      );
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

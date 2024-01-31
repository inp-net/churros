import { builder, prisma, updatePicture } from '#lib';
import { FileScalar } from '#modules/global';

builder.mutationField('updateArticlePicture', (t) =>
  t.field({
    type: 'String',
    args: {
      id: t.arg.id(),
      file: t.arg({ type: FileScalar }),
    },
    async authScopes(_, { id }, { user }) {
      const article = await prisma.article.findUniqueOrThrow({
        where: { id },
      });
      if (user?.canEditGroups) return true;

      return Boolean(
        // Who can edit this article?
        // Admins
        user?.admin ||
          // The author
          user?.id === article.authorId ||
          // Other authors of the group
          user?.groups.some(
            ({ groupId, canEditArticles }) => canEditArticles && groupId === article.groupId,
          ),
      );
    },
    async resolve(_, { id, file }, { user }) {
      await prisma.logEntry.create({
        data: {
          area: 'article',
          action: 'update',
          target: id,
          message: `Article ${id} picture updated`,
          user: user ? { connect: { id: user.id } } : undefined,
        },
      });
      return updatePicture({
        resource: 'article',
        folder: 'articles',
        extension: 'jpg',
        file,
        identifier: id,
      });
    },
  }),
);

import { builder, log, prisma, updatePicture } from '#lib';
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
      await log('article', 'update', { message: `Article ${id} picture updated` }, id, user);
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

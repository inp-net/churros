import { builder, prisma, updatePicture } from '#lib';
import { FileScalar } from '#modules/global';
import { canEditArticle } from '../utils/permissions.js';

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
      return canEditArticle(user, article);
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

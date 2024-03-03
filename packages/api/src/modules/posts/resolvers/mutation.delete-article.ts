import { builder, prisma, publish } from '#lib';
import { canEditArticle } from '../utils/permissions.js';

builder.mutationField('deleteArticle', (t) =>
  t.field({
    type: 'Boolean',
    args: { id: t.arg.id() },
    async authScopes(_, { id }, { user }) {
      const article = await prisma.article.findUniqueOrThrow({ where: { id } });
      return canEditArticle(user, article);
    },
    async resolve(_, { id }, { user }) {
      await prisma.article.delete({ where: { id } });

      await prisma.logEntry.create({
        data: {
          area: 'article',
          action: 'delete',
          target: id,
          message: `Article ${id} deleted`,
          user: user ? { connect: { id: user.id } } : undefined,
        },
      });
      publish(id, 'deleted', id);
      return true;
    },
  }),
);

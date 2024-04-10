import { builder, prisma, UnauthorizedError } from '#lib';

import { ArticleType, canSeeArticle } from '../index.js';

builder.queryField('article', (t) =>
  t.prismaField({
    type: ArticleType,
    args: {
      id: t.arg.id(),
    },
    async resolve(query, _, { id }, { user }) {
      const article = await prisma.article.findUniqueOrThrow({
        ...query,
        where: { id },
        include: { group: { include: { studentAssociation: true } } },
      });

      if (!canSeeArticle(user, article)) {
        throw new UnauthorizedError();
      }

      return article;
    },
  }),
);

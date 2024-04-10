import { builder, prisma } from '#lib';
import { GroupType } from '#modules/groups';
import { prismaQueryAccessibleArticles } from '#permissions';
import { ArticleType } from '../types/article.js';

builder.prismaObjectField(GroupType, 'article', (t) =>
  t.prismaField({
    type: ArticleType,
    args: {
      slug: t.arg.string(),
    },
    resolve: async (query, { id }, { slug }, { user }) =>
      prisma.article.findFirstOrThrow({
        ...query,
        where: {
          ...prismaQueryAccessibleArticles(user, 'can'),
          uid: slug,
          groupId: id,
        },
      }),
  }),
);

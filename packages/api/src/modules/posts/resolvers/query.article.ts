import { builder, prisma } from '#lib';

import { prismaQueryAccessibleArticles } from '#permissions';
import { ArticleType } from '../index.js';

builder.queryField('article', (t) =>
  t.prismaField({
    type: ArticleType,
    smartSubscription: true,
    args: {
      groupUid: t.arg.string(),
      uid: t.arg.string(),
    },
    resolve: async (query, _, { uid, groupUid }, { user }) =>
      prisma.article.findFirstOrThrow({
        ...query,
        where: {
          ...prismaQueryAccessibleArticles(user, 'can'),
          uid,
          group: { uid: groupUid },
        },
      }),
  }),
);

// TODO rename to articles
import { builder, prisma, subscriptionName } from '#lib';
import {} from '#modules/global';
import { Visibility } from '@prisma/client';
import { ArticleType } from '../index.js';
import { visibleArticlesPrismaQuery } from '#permissions';

builder.queryField('homepage', (t) =>
  t.prismaConnection({
    description: 'Gets the homepage articles, customized if the user is logged in.',
    type: ArticleType,
    cursor: 'id',
    smartSubscription: true,
    subscribe(subs) {
      subs.register(subscriptionName('Article', 'created'));
    },
    async resolve(query, _, {}, { user }) {
      if (!user) {
        return prisma.article.findMany({
          ...query,
          where: { publishedAt: { lte: new Date() }, visibility: Visibility.Public },
          orderBy: { publishedAt: 'desc' },
        });
      }

      return prisma.article.findMany({
        ...query,
        where: visibleArticlesPrismaQuery(user, 'wants'),
        orderBy: { publishedAt: 'desc' },
      });
    },
  }),
);

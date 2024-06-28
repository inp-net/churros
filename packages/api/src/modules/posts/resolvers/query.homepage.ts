// TODO rename to articles
import { builder, prisma, subscriptionName } from '#lib';
import { prismaQueryAccessibleArticles, prismaQueryVisibleEvents } from '#permissions';
import { Visibility } from '@churros/db/prisma';
import { ArticleType } from '../index.js';

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
          where: {
            publishedAt: { lte: new Date() },
            visibility: Visibility.Public,
            OR: [
              { eventId: null },
              { AND: [{ eventId: { not: null } }, { event: { visibility: Visibility.Public } }] },
            ],
          },
          orderBy: { publishedAt: 'desc' },
        });
      }

      return prisma.article.findMany({
        ...query,
        where: {
          AND: [
            prismaQueryAccessibleArticles(user, 'wants'),
            {
              OR: [
                { eventId: null },
                {
                  AND: [{ eventId: { not: null } }, { event: prismaQueryVisibleEvents(user) }],
                },
              ],
            },
          ],
        },
        orderBy: { publishedAt: 'desc' },
      });
    },
  }),
);

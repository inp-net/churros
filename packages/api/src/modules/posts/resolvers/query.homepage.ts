// TODO rename to articles
import { builder, prisma, subscriptionName } from '#lib';
import { prismaQueryAccessibleArticles, userCanAccessEvent } from '#permissions';
import { Visibility } from '@prisma/client';
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

      const articles = await prisma.article.findMany({
        ...query,
        where: prismaQueryAccessibleArticles(user, 'wants'),
        orderBy: { publishedAt: 'desc' },
      });
      const articlesToReturn = [];
      for (const article of articles) {
        if (article.eventId) {
          const linkedEvent = await prisma.event.findFirstOrThrow({
            where: { id: article.eventId },
            include: {
              coOrganizers: { include: { studentAssociation: { include: { school: true } } } },
              group: { include: { studentAssociation: { include: { school: true } } } },
              managers: { include: { user: true } },
              tickets: true,
            },
          });
          if (await userCanAccessEvent(linkedEvent, user)) articlesToReturn.push(article);
        }
      }
      return articlesToReturn;
    },
  }),
);

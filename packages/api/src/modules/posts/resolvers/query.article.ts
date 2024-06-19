import { builder, prisma } from '#lib';
import { prismaQueryAccessibleArticles, prismaQueryVisibleEvents } from '#permissions';
import { GraphQLError } from 'graphql';
import { ArticleType } from '../index.js';

builder.queryField('article', (t) =>
  t.prismaField({
    type: ArticleType,
    smartSubscription: true,
    args: {
      groupUid: t.arg.string(),
      uid: t.arg.string(),
    },
    async resolve(query, _, { uid, groupUid }, { user }) {
      const article = await prisma.article.findFirstOrThrow({
        ...query,
        where: {
          AND: [
            prismaQueryAccessibleArticles(user, 'can'),
            {
              uid,
              group: { uid: groupUid },
              OR: [
                { eventId: null },
                {
                  AND: [{ eventId: { not: null } }, { event: prismaQueryVisibleEvents(user) }],
                },
              ],
            },
          ],
        },
      });
      if (!article) throw new GraphQLError('Post introuvable');
      return article;
    },
  }),
);

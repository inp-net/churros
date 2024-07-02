import { builder, prisma } from '#lib';
import { prismaQueryAccessibleArticles, prismaQueryVisibleEvents } from '#permissions';
import { GraphQLError } from 'graphql';
import { ArticleType } from '../index.js';
import { UIDScalar } from '#modules/global';

builder.queryField('article', (t) =>
  t.prismaField({
    type: ArticleType,
    smartSubscription: true,
    args: {
      group: t.arg({ type: UIDScalar }),
      slug: t.arg.string(),
    },
    async resolve(query, _, { slug, group: groupUid }, { user }) {
      const article = await prisma.article.findFirstOrThrow({
        ...query,
        where: {
          AND: [
            prismaQueryAccessibleArticles(user, 'can'),
            {
              slug,
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

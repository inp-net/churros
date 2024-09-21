import { builder, ensureGlobalId, graphinx, localID, prisma } from '#lib';
import { UIDScalar } from '#modules/global';
import { prismaQueryAccessibleArticles, prismaQueryVisibleEvents } from '#permissions';
import { GraphQLError } from 'graphql';
import { LocalID } from '../../global/types/local-id.js';
import { ArticleType } from '../index.js';

builder.queryField('articleID', (t) =>
  t.field({
    ...graphinx('posts'),
    type: LocalID,
    nullable: true,
    description:
      "Récupérer l'ID d'un article à partir de son groupe et de son slug. Pensé pour les redirections d'URLs anciennes.",
    deprecationReason: 'Utilisez `article` à la place',
    args: {
      group: t.arg({ type: UIDScalar }),
      slug: t.arg.string(),
    },
    resolve: async (_, { group, slug }) =>
      prisma.article
        .findFirst({ where: { slug, group: { uid: group } } })
        .then((a) => (a ? localID(a.id) : null)),
  }),
);

builder.queryField('article', (t) =>
  t.prismaField({
    type: ArticleType,
    smartSubscription: true,
    args: {
      id: t.arg({ type: LocalID }),
    },
    async resolve(query, _, { id }, { user }) {
      const article = await prisma.article.findUnique({
        ...query,
        where: {
          id: ensureGlobalId(id, 'Article'),
          AND: [
            prismaQueryAccessibleArticles(user, 'can'),
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
      });
      if (!article) throw new GraphQLError('Post introuvable');
      return article;
    },
  }),
);

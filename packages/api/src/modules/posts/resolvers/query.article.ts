import { builder, prisma } from '#lib';
import { prismaQueryAccessibleArticles, userCanAccessEvent } from '#permissions';
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
          ...prismaQueryAccessibleArticles(user, 'can'),
          uid,
          group: { uid: groupUid },
        },
      });
      if (!article) throw new GraphQLError('Article not found');
      if (article.eventId === '' || article.eventId === null) {
        return article;
      } else {
        const linkedEvent = await prisma.event.findFirstOrThrow({
          where: { id: article.eventId },
          include: {
            coOrganizers: { include: { studentAssociation: { include: { school: true } } } },
            group: { include: { studentAssociation: { include: { school: true } } } },
            managers: { include: { user: true } },
            tickets: true,
          },
        });
        if (await userCanAccessEvent(linkedEvent, user)) return article;
        throw new GraphQLError('You do not have permission to see this article');
      }
    },
  }),
);

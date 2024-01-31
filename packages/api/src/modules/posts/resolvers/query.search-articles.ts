import { builder, fullTextSearch, prisma } from '#lib';

import { visibleArticlesPrismaQuery } from '#permissions';
import { ArticleSearchResultType } from '../index.js';

builder.queryField('searchArticles', (t) =>
  t.field({
    type: [ArticleSearchResultType],
    args: {
      q: t.arg.string(),
      groupUid: t.arg.string({ required: false }),
    },
    async resolve(_, { q, groupUid }, { user }) {
      const group = groupUid
        ? await prisma.group.findUniqueOrThrow({ where: { uid: groupUid } })
        : undefined;
      return fullTextSearch('Article', q, {
        property: 'article',
        resolveObjects: (ids) =>
          prisma.article.findMany({
            where: { AND: [{ id: { in: ids } }, visibleArticlesPrismaQuery(user, 'can')] },
          }),
        fuzzy: ['title', 'body'],
        highlight: ['title', 'body'],
        htmlHighlights: ['title', 'body'],
        additionalClauses: group ? { groupId: group.id } : {},
      });
    },
  }),
);

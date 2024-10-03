import { builder, fullTextSearch, prisma, type Context } from '#lib';

import { prismaQueryAccessibleArticles } from '#permissions';
import type { Group } from '@churros/db/prisma';
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
      return searchArticles(q, group, user);
    },
  }),
);

export async function searchArticles(q: string, group: Group | undefined, user: Context['user']) {
  return fullTextSearch('Article', q, {
    property: 'article',
    resolveObjects: (ids) =>
      prisma.article.findMany({
        where: { AND: [{ id: { in: ids } }, prismaQueryAccessibleArticles(user, 'can')] },
      }),
    fuzzy: ['title', 'body'],
    highlight: ['title', 'body'],
    htmlHighlights: ['title', 'body'],
    additionalClauses: group ? { groupId: group.id } : {},
  });
}

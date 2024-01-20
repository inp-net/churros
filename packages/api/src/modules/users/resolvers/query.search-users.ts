import { builder, fullTextSearch, prisma } from '#lib';
import {} from '#modules/global';
import { UserSearchResultType } from '../index.js';

/** Searches for user on all text fields. */
builder.queryField('searchUsers', (t) =>
  t.field({
    type: [UserSearchResultType],
    args: { q: t.arg.string(), similarityCutoff: t.arg.float({ required: false }) },
    authScopes: { student: true },
    async resolve(_, { q, similarityCutoff }) {
      return await searchUsers(q, similarityCutoff ?? undefined);
    },
  }),
);
async function searchUsers(q: string, similarityCutoff = 0.08) {
  return await fullTextSearch('User', q, {
    property: 'user',
    resolveObjects: (ids) => prisma.user.findMany({ where: { id: { in: ids } } }),
    similarityCutoff,
    fuzzy: ['firstName', 'lastName', 'nickname', 'email', 'uid'],
    highlight: ['description'],
    htmlHighlights: ['description'],
  });
}

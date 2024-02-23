import { builder, fullTextSearch, prisma } from '#lib';

import { GroupSearchResultType } from '../index.js';

builder.queryField('searchGroups', (t) =>
  t.field({
    type: [GroupSearchResultType],
    args: { q: t.arg.string(), similarityCutoff: t.arg.float({ required: false }) },
    authScopes: { loggedIn: true },
    async resolve(_, { q, similarityCutoff }) {
      return searchGroups(q, similarityCutoff ?? undefined);
    },
  }),
);

export function searchGroups(q: string, similarityCutoff = 0.2) {
  return fullTextSearch('Group', q, {
    property: 'group',
    resolveObjects: (ids) => prisma.group.findMany({ where: { id: { in: ids } } }),
    similarityCutoff,
    fuzzy: ['name', 'uid'],
    highlight: ['description'],
    htmlHighlights: ['description'],
  });
}

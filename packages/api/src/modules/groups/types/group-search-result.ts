import { builder, type SearchResult } from '#lib';

import type { Group } from '@prisma/client';

export const GroupSearchResultType = builder
  .objectRef<SearchResult<{ group: Group }, ['description']>>('GroupSearchResult')
  .implement({
    fields: (t) => ({
      id: t.exposeID('id'),
      group: t.prismaField({
        type: 'Group',
        resolve: (_, { group }) => group,
      }),
      rank: t.exposeFloat('rank', { nullable: true }),
      similarity: t.exposeFloat('similarity'),
      highlightedDescription: t.string({
        resolve: ({ highlights }) => highlights.description,
      }),
    }),
  });

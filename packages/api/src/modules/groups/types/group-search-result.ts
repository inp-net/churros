import { builder, type SearchResult } from '#lib';
import {} from '#modules/global';
import type { Group } from '@prisma/client';
import {} from '../index.js';

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

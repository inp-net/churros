import { builder, type SearchResult } from '#lib';
import {} from '#modules/global';
import type { User } from '@prisma/client';
import {} from '../index.js';

export const UserSearchResultType = builder
  .objectRef<SearchResult<{ user: User }, ['description']>>('UserSearchResult')
  .implement({
    fields: (t) => ({
      user: t.prismaField({
        type: 'User',
        resolve: (_, { user }) => user,
      }),
      id: t.exposeID('id'),
      similarity: t.exposeFloat('similarity'),
      rank: t.exposeFloat('rank', { nullable: true }),
      highlightedDescription: t.string({
        resolve: ({ highlights }) => highlights.description,
      }),
    }),
  });

import { builder, type SearchResult } from '#lib';

import { type Document } from '@churros/db/prisma';

export const DocumentSearchResultType = builder
  .objectRef<SearchResult<{ document: Document }>>('DocumentSearchResult')
  .implement({
    fields: (t) => ({
      document: t.prismaField({
        type: 'Document',
        resolve: (_, { document }) => document,
      }),
      id: t.exposeID('id'),
      rank: t.exposeFloat('rank', { nullable: true }),
      similarity: t.exposeFloat('similarity'),
    }),
  });

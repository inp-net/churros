import { builder, type SearchResult } from '#lib';
import { } from '#modules/global';
import { type Document } from '@prisma/client';
import { } from '../index.js';

export const DocumentSearchResultType = builder
  .objectRef<SearchResult<{ document: Document }>>('DocumentSearchResult')
  .implement({
    fields: (t) => ({
      document: t.prismaField({
        type: 'Document',
        resolve: (_, { document }) => document,
      }),
      id: t.exposeID('id'),
      rank: t.expose('rank', { type: 'Int', nullable: true }),
      similarity: t.exposeFloat('similarity'),
    }),
  });

import { builder, type SearchResult } from '#lib';

import type { Event } from '@prisma/client';

export const EventSearchResultType = builder
  .objectRef<SearchResult<{ event: Event }, ['description', 'title']>>('EvenSearchResult')
  .implement({
    fields: (t) => ({
      event: t.prismaField({
        type: 'Event',
        resolve: (_, { event }) => event,
      }),
      id: t.exposeID('id'),
      similarity: t.exposeFloat('similarity'),
      rank: t.exposeFloat('rank', { nullable: true }),
      highlightedTitle: t.string({
        resolve: ({ highlights }) => highlights.title,
      }),
    }),
  });

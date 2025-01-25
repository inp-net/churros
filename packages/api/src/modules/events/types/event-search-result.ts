import { builder, type SearchResult } from '#lib';

import type { Event } from '@churros/db/prisma';

export const EventSearchResultType = builder
  .objectRef<SearchResult<{ event: Event }, ['description', 'title']>>('EventSearchResult')
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

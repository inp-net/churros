import { builder, type SearchResult } from '#lib';

import type { Article } from '@churros/db/prisma';

export const ArticleSearchResultType = builder
  .objectRef<SearchResult<{ article: Article }, ['body', 'title']>>('ArticleSearchResult')
  .implement({
    fields: (t) => ({
      article: t.prismaField({
        type: 'Article',
        resolve: (_, { article }) => article,
      }),
      id: t.exposeID('id'),
      similarity: t.exposeFloat('similarity'),
      rank: t.exposeFloat('rank', { nullable: true }),
      highlightedTitle: t.string({
        resolve: ({ highlights }) => highlights.title,
      }),
    }),
  });

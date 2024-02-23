import { builder, type SearchResult } from '#lib';

import type { Article } from '@prisma/client';

// TODO rename to article-search-result

export const ArticleSearchResultType = builder
  .objectRef<SearchResult<{ article: Article }, ['body', 'title']>>('ArticleSearchResultType')
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

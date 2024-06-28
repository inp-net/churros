import { builder, prisma, type SearchResult } from '#lib';
import type { Answer } from '@churros/db/prisma';
import { AnswerType } from './answer.js';

export const AnswerSearchResultType = builder
  .objectRef<SearchResult<{ answer: Answer }>>('AnswerSearchResult')
  .implement({
    fields: (t) => ({
      answer: t.prismaField({
        type: AnswerType,
        resolve: async (query, { answer: { id } }) => {
          return prisma.answer.findUniqueOrThrow({
            ...query,
            where: { id },
          });
        },
      }),
      id: t.exposeID('id'),
      similarity: t.exposeFloat('similarity'),
      rank: t.exposeFloat('rank', { nullable: true }),
    }),
  });

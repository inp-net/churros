import { builder, fullTextSearch, prisma } from '#lib';
import { AnswerSearchResultType } from '../types/answer-search-result.js';
import { FormType } from '../types/form.js';

builder.prismaObjectField(FormType, 'searchAnswers', (t) =>
  t.field({
    type: [AnswerSearchResultType],
    args: {
      q: t.arg.string({ description: 'La recherche' }),
      similarityCutoff: t.arg.float({ required: false }),
    },
    resolve: async (_, { q, similarityCutoff }) => searchAnswers(q, similarityCutoff ?? undefined),
  }),
);

async function searchAnswers(q: string, similarityCutoff = 0.04) {
  return await fullTextSearch('Answer', q, {
    property: 'answer',
    resolveObjects: async (ids) =>
      prisma.answer.findMany({
        where: { id: { in: ids } },
      }),
    similarityCutoff,
    // TODO allow searchAnswers to take 0 fuzzy-searched columns
    fuzzy: ['bookingId'],
    highlight: [],
    htmlHighlights: [],
  });
}

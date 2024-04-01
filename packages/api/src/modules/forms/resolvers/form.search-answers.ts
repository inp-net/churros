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
    resolve: async ({ id }, { q, similarityCutoff }) =>
      searchAnswers(q, id, similarityCutoff ?? undefined),
  }),
);

async function searchAnswers(q: string, formId: string, similarityCutoff = 0.08) {
  const answerers = await fullTextSearch('User', q, {
    property: 'user',
    resolveObjects: async (ids) =>
      prisma.user.findMany({
        where: { id: { in: ids } },
        include: { formAnswers: { where: { question: { section: { formId } } } } },
      }),
    similarityCutoff,
    fuzzy: ['firstName', 'lastName', 'nickname', 'email', 'uid', 'phone'],
    highlight: [],
    htmlHighlights: [],
  });
  return answerers.flatMap(({ user, ...other }) =>
    user.formAnswers.map((answer) => ({
      ...other,
      id: answer.id,
      answer,
    })),
  );
}

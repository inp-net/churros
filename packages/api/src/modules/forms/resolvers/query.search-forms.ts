import { builder, fullTextSearch, prisma } from '#lib';
import { FormSearchResultType } from '../types/form-search-result.js';

builder.queryField('searchForms', (t) =>
  t.field({
    type: [FormSearchResultType],
    description: 'Recherche des formulaires',
    args: {
      q: t.arg.string({ description: 'La recherche' }),
      similarityCutoff: t.arg.float({ required: false }),
    },
    resolve: async (_, { q, similarityCutoff }) => searchForms(q, similarityCutoff ?? undefined),
  }),
);

async function searchForms(q: string, similarityCutoff = 0.04) {
  return await fullTextSearch('Form', q, {
    property: 'form',
    resolveObjects: (ids) => prisma.form.findMany({ where: { id: { in: ids } } }),
    similarityCutoff,
    fuzzy: ['title', 'description'],
    highlight: ['description'],
    htmlHighlights: ['description'],
  });
}

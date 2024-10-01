import { builder, fullTextSearch, prisma, yearTier } from '#lib';

import { DocumentSearchResultType } from '../index.js';

builder.queryField('searchDocuments', (t) =>
  t.field({
    type: [DocumentSearchResultType],
    authScopes: { canAccessDocuments: true },
    args: {
      majorUid: t.arg.string(),
      yearTier: t.arg.int({ required: true }),
      forApprentices: t.arg.boolean({ required: true }),
      q: t.arg.string(),
    },
    async resolve(_, { q, ...filters }) {
      return searchDocuments(q, filters);
    },
  }),
);

export async function searchDocuments(
  q: string,
  filters: {
    majorUid?: string;
    yearTier?: number;
    forApprentices?: boolean;
  },
) {
  return fullTextSearch('Document', q, {
    property: 'document',
    resolveObjects: (ids) =>
      prisma.document.findMany({
        where: {
          subject: {
            // eslint-disable-next-line unicorn/no-null
            ...(filters.yearTier ? { OR: [{ yearTier }, { yearTier: null }] } : {}),
            forApprentices: filters.forApprentices,
            majors: filters.majorUid
              ? {
                  some: {
                    uid: filters.majorUid,
                  },
                }
              : undefined,
          },
          id: { in: ids },
        },
      }),
    fuzzy: ['title'],
    highlight: ['title', 'description'],
    htmlHighlights: ['description'],
  });
}

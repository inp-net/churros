import { builder, fullTextSearch, prisma } from '#lib';

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
    async resolve(_, { majorUid, yearTier, forApprentices, q }) {
      return fullTextSearch('Document', q, {
        property: 'document',
        resolveObjects: (ids) =>
          prisma.document.findMany({
            where: {
              subject: {
                // eslint-disable-next-line unicorn/no-null
                OR: [{ yearTier }, { yearTier: null }],
                forApprentices,
                majors: {
                  some: {
                    uid: majorUid,
                  },
                },
              },
              id: { in: ids },
            },
          }),
        fuzzy: ['title'],
        highlight: ['title', 'description'],
        htmlHighlights: ['description'],
      });
    },
  }),
);

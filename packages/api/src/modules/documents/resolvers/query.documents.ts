import { builder, prisma } from '#lib';

import { DocumentType } from '../index.js';

builder.queryField('documents', (t) =>
  t.prismaConnection({
    type: DocumentType,
    cursor: 'id',
    authScopes(_, {}, { user }) {
      return Boolean(user?.admin || user?.canAccessDocuments);
    },
    async resolve(query) {
      return prisma.document.findMany({
        ...query,
        orderBy: { updatedAt: 'desc' },
      });
    },
  }),
);

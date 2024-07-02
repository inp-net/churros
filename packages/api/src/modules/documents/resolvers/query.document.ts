import { builder, prisma } from '#lib';

import { DocumentType } from '../index.js';

builder.queryField('document', (t) =>
  t.prismaField({
    type: DocumentType,
    args: {
      subject: t.arg.id({ required: true }),
      slug: t.arg.string(),
    },
    authScopes(_, {}, { user }) {
      return Boolean(user?.admin || user?.canAccessDocuments);
    },
    async resolve(query, _, { subject, slug }) {
      return prisma.document.findUniqueOrThrow({
        ...query,
        where: {
          subjectId_slug: { subjectId: subject, slug },
        },
      });
    },
  }),
);

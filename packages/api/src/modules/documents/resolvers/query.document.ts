import { builder, prisma } from '#lib';

import { DocumentType } from '../index.js';

builder.queryField('document', (t) =>
  t.prismaField({
    type: DocumentType,
    args: {
      subjectUid: t.arg.string(),
      subjectYearTier: t.arg.int({ required: true }),
      subjectForApprentices: t.arg.boolean(),
      documentUid: t.arg.string(),
    },
    authScopes(_, {}, { user }) {
      return Boolean(user?.admin || user?.canAccessDocuments);
    },
    async resolve(query, _, { subjectUid, documentUid, subjectYearTier, subjectForApprentices }) {
      /* eslint-disable unicorn/no-null */
      const subject = await prisma.subject.findFirstOrThrow({
        where: {
          OR: [
            { uid: subjectUid, yearTier: subjectYearTier, forApprentices: subjectForApprentices },
            { uid: subjectUid, yearTier: null, forApprentices: subjectForApprentices },
          ],
        },
      });
      /* eslint-enable unicorn/no-null */
      return prisma.document.findUniqueOrThrow({
        ...query,
        where: {
          subjectId_uid: { subjectId: subject.id, uid: documentUid },
        },
      });
    },
  }),
);

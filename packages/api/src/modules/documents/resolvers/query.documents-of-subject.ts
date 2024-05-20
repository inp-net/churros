import { builder, objectValuesFlat, prisma } from '#lib';

import { userIsAdminOf } from '#permissions';
import { DocumentType } from '../index.js';
// TODO rename to subject.documents

builder.queryField('documentsOfSubject', (t) =>
  t.prismaConnection({
    type: DocumentType,
    cursor: 'id',
    args: {
      subjectUid: t.arg.string({ required: true }),
      yearTier: t.arg.int({ required: true }),
      forApprentices: t.arg.boolean({ required: true }),
    },
    async authScopes(_, { subjectUid }, { user }) {
      const studentAssociationIds: string[] = objectValuesFlat(
        await prisma.subject.findFirst({
          where: {
            uid: subjectUid,
          },
          select: {
            minors: {
              select: {
                majors: {
                  select: {
                    schools: { select: { studentAssociations: { select: { id: true } } } },
                  },
                },
              },
            },
          },
        }),
      );

      return Boolean(userIsAdminOf(user, studentAssociationIds) || user?.canAccessDocuments);
    },
    async resolve(query, _, { subjectUid, yearTier, forApprentices }) {
      /* eslint-disable unicorn/no-null */
      const subject = await prisma.subject.findFirstOrThrow({
        where: {
          OR: [
            { uid: subjectUid, yearTier, forApprentices },
            { uid: subjectUid, yearTier: null, forApprentices },
          ],
        },
      });
      /* eslint-enable unicorn/no-null */
      return prisma.document.findMany({
        ...query,
        where: {
          subjectId: subject.id,
        },
        orderBy: [{ type: 'asc' }, { schoolYear: 'desc' }, { title: 'asc' }],
      });
    },
  }),
);

import { builder, objectValuesFlat, prisma } from '#lib';
import { DocumentType } from '#modules/documents';
import { userIsAdminOf } from '#permissions';
import { SubjectType } from '../index.js';

builder.prismaObjectField(SubjectType, 'documents', (t) =>
  t.relatedConnection('documents', {
    type: DocumentType,
    cursor: 'id',
    async authScopes({ id }, _, { user }) {
      // TODO maybe possible with global includes on SubjectType?
      const studentAssociationIds: string[] = objectValuesFlat(
        await prisma.subject.findUniqueOrThrow({
          where: {
            id,
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
    query: {
      orderBy: [{ type: 'asc' }, { schoolYear: 'desc' }, { title: 'asc' }],
    },
  }),
);

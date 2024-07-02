import { builder, objectValuesFlat, prisma } from '#lib';
import { userIsAdminOf } from '#permissions';
import dichotomid from 'dichotomid';
import slugify from 'slug';
import { DocumentType, DocumentTypeEnum } from '../index.js';

builder.mutationField('upsertDocument', (t) =>
  t.prismaField({
    type: DocumentType,
    errors: {},
    args: {
      id: t.arg.id({ required: false }),
      schoolYear: t.arg.int({ required: true }),
      title: t.arg.string({ required: true }),
      description: t.arg.string({ required: true }),
      subject: t.arg.id({ required: true }),
      type: t.arg({ type: DocumentTypeEnum, required: true }),
    },
    async authScopes(_, { subject }, { user }) {
      const studentAssociationIds: string[] = objectValuesFlat(
        await prisma.subject.findFirst({
          where: {
            id: subject,
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
    async resolve(query, _, { id, title, schoolYear, subject: subjectId, ...data }, { user }) {
      const uidBase = `${slugify(title)}${schoolYear ? `-${schoolYear}` : ''}`;
      const uidNumber = await dichotomid(
        async (n) =>
          !(await prisma.document.findUnique({
            where: {
              subjectId_slug: { subjectId, slug: `${uidBase}${n > 1 ? `-${n}` : ''}` },
            },
          })),
      );
      const slug = `${uidBase}${uidNumber > 1 ? `-${uidNumber}` : ''}`;
      const upsertData = {
        title,
        schoolYear,
        ...data,
        subject: {
          connect: { id: subjectId },
        },
      };
      return prisma.document.upsert({
        ...query,
        where: { id: id ?? '' },
        create: { ...upsertData, slug, uploader: { connect: { id: user?.id ?? '' } } },
        update: upsertData,
      });
    },
  }),
);

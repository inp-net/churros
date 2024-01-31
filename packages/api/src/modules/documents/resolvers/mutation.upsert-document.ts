import { builder, prisma } from '#lib';

import dichotomid from 'dichotomid';
import { GraphQLError } from 'graphql';
import slug from 'slug';
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
      subjectUid: t.arg.string({ required: true }),
      subjectYearTier: t.arg.int({ required: false }),
      subjectForApprentices: t.arg.boolean({ required: true }),
      type: t.arg({ type: DocumentTypeEnum, required: true }),
    },
    authScopes(_, {}, { user }) {
      return Boolean(user?.admin || user?.canAccessDocuments);
    },
    async resolve(
      query,
      _,
      { id, subjectUid, title, schoolYear, subjectYearTier, subjectForApprentices, ...data },
      { user },
    ) {
      const subject = await prisma.subject.findFirst({
        where: {
          // uid_yearTier_forApprentices: {
          uid: subjectUid,
          yearTier: subjectYearTier,
          forApprentices: subjectForApprentices,
          // },
        },
      });
      if (!subject) throw new GraphQLError('Matière introuvable');
      const uidBase = `${slug(title)}${schoolYear ? `-${schoolYear}` : ''}`;
      const uidNumber = await dichotomid(
        async (n) =>
          !(await prisma.document.findUnique({
            where: {
              subjectId_uid: { subjectId: subject.id, uid: `${uidBase}${n > 1 ? `-${n}` : ''}` },
            },
          })),
      );
      const uid = `${uidBase}${uidNumber > 1 ? `-${uidNumber}` : ''}`;
      const upsertData = {
        title,
        schoolYear,
        ...data,
        subject: {
          connect: { id: subject.id },
        },
      };
      return prisma.document.upsert({
        ...query,
        where: { id: id ?? '' },
        create: { ...upsertData, uid, uploader: { connect: { id: user?.id ?? '' } } },
        update: upsertData,
      });
    },
  }),
);

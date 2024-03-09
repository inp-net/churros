import { builder, prisma } from '#lib';
import { DocumentType } from '#modules/documents';
import { DateTimeScalar } from '#modules/global';

export const SubjectType = builder.prismaObject('Subject', {
  fields: (t) => ({
    id: t.exposeID('id'),
    name: t.exposeString('name'),
    shortName: t.exposeString('shortName'),
    emoji: t.exposeString('emoji'),
    uid: t.exposeString('uid'),
    nextExamAt: t.expose('nextExamAt', { type: DateTimeScalar, nullable: true }),
    majors: t.relation('majors'),
    minors: t.relation('minors'),
    links: t.relation('links'),
    unitId: t.exposeID('unitId', { nullable: true }),
    unit: t.relation('unit', { nullable: true }),
    apogeeCode: t.exposeString('apogeeCode', { nullable: true }),
    semester: t.exposeInt('semester', { nullable: true }),
    yearTier: t.exposeInt('yearTier', { nullable: true }),
    forApprentices: t.exposeBoolean('forApprentices'),
    documents: t.relatedConnection('documents', {
      type: DocumentType,
      cursor: 'id',
    }),
    documentsCount: t.int({
      async resolve({ id }) {
        return prisma.document.count({ where: { subject: { id } } });
      },
    }),
  }),
});

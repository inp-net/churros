import { builder, prisma } from '#lib';
import { DateTimeScalar } from '#modules/global';

export const SubjectType = builder.prismaObject('Subject', {
  fields: (t) => ({
    id: t.exposeID('id'),
    name: t.exposeString('name'),
    shortName: t.exposeString('shortName'),
    emoji: t.exposeString('emoji'),
    uid: t.exposeString('slug', {
      deprecationReason: 'Use `slug` instead. This field was never universally unique.',
    }),
    slug: t.exposeString('slug', {
      description: 'Un nom lisible sans espaces, adaptés pour des URLs.',
    }),
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
    documentsCount: t.int({
      async resolve({ id }) {
        return prisma.document.count({ where: { subject: { id } } });
      },
    }),
  }),
});

import { builder, prisma } from '#lib';
import { MajorType, SubjectType } from '../index.js';

builder.prismaObjectField(MajorType, 'subjects', (t) =>
  t.prismaField({
    type: [SubjectType],
    args: {
      yearTier: t.arg.int({ required: false }),
      forApprentices: t.arg.boolean({ required: false }),
    },
    authScopes: () => true,
    async resolve(query, { id }, { yearTier, forApprentices }) {
      // XXX should become uniqueOrThrow at some point when all majors have uids
      // const major = await prisma.major.findFirstOrThrow({ where: { uid } });
      return prisma.subject.findMany({
        ...query,
        where: {
          ...(forApprentices !== null && forApprentices !== undefined ? { forApprentices } : {}),
          OR: [
            {
              yearTier,
              majors: { some: { id } },
            },
            {
              minors: {
                some: {
                  ...(yearTier ? { yearTier } : {}),
                  majors: { some: { id } },
                },
              },
            },
          ],
        },
        orderBy: [{ nextExamAt: 'asc' }, { semester: 'asc' }, { name: 'asc' }],
      });
    },
  }),
);

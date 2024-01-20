import { builder, prisma } from '#lib';
import { SubjectType } from '../index.js';
// TODO rename to major.subjects

builder.queryField('subjectsOfMajor', (t) =>
  t.prismaField({
    type: [SubjectType],
    args: {
      uid: t.arg.string({ required: true }),
      yearTier: t.arg.int({ required: false }),
      forApprentices: t.arg.boolean({ required: false }),
    },
    authScopes: () => true,
    async resolve(query, _, { uid, yearTier, forApprentices }) {
      // XXX should become uniqueOrThrow at some point when all majors have uids
      const major = await prisma.major.findFirstOrThrow({ where: { uid } });
      return prisma.subject.findMany({
        ...query,
        where: {
          ...(forApprentices !== null && forApprentices !== undefined ? { forApprentices } : {}),
          OR: [
            {
              yearTier,
              majors: {
                some: {
                  id: major.id,
                },
              },
            },
            {
              minors: {
                some: {
                  ...(yearTier ? { yearTier } : {}),
                  majors: {
                    some: {
                      id: major.id,
                    },
                  },
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

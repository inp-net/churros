import { builder, prisma } from '#lib';
import { SubjectType } from '../index.js';
// TODO rename to minor.subjects
builder.queryField('subjectsOfMinor', (t) =>
  t.prismaField({
    type: [SubjectType],
    args: {
      uid: t.arg.string({ required: true }),
      yearTier: t.arg.int({ required: true }),
    },
    authScopes: () => true,
    async resolve(query, _, { uid, yearTier }) {
      const minor = await prisma.minor.findUniqueOrThrow({
        where: { uid_yearTier: { uid, yearTier } },
      });
      return prisma.subject.findMany({
        ...query,
        where: {
          minors: {
            some: {
              id: minor.id,
            },
          },
        },
        orderBy: [{ nextExamAt: 'asc' }, { semester: 'asc' }, { name: 'asc' }],
      });
    },
  }),
);

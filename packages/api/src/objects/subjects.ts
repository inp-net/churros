import { builder } from '../builder.js';
import { prisma } from '../prisma.js';
import { DocumentType } from './documents.js';
import { DateTimeScalar } from './scalars.js';

export const SubjectType = builder.prismaObject('Subject', {
  fields: (t) => ({
    id: t.exposeID('id'),
    name: t.exposeString('name'),
    shortName: t.exposeString('shortName'),
    uid: t.exposeString('uid'),
    nextExamAt: t.expose('nextExamAt', { type: DateTimeScalar, nullable: true }),
    majors: t.relation('majors'),
    minors: t.relation('minors'),
    links: t.relation('links'),
    unitId: t.exposeID('unitId', { nullable: true }),
    unit: t.relation('unit', { nullable: true }),
    semester: t.exposeInt('semester', { nullable: true }),
    yearTier: t.exposeInt('yearTier', { nullable: true }),
    forApprentices: t.exposeBoolean('forApprentices'),
    documents: t.relatedConnection('documents', {
      type: DocumentType,
      cursor: 'id',
    }),
    documentsCount: t.int({
      async resolve({ id }) {
        return prisma.document.count({
          where: {
            subject: {
              id,
            },
          },
        });
      },
    }),
  }),
});

builder.queryField('subjects', (t) =>
  t.prismaField({
    type: [SubjectType],
    authScopes: () => true,
    async resolve(query) {
      return prisma.subject.findMany({
        ...query,
      });
    },
  }),
);

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

builder.queryField('subject', (t) =>
  t.prismaField({
    type: SubjectType,
    args: {
      uid: t.arg.string(),
      yearTier: t.arg.int(),
    },
    authScopes: () => true,
    async resolve(query, _, { uid, yearTier }) {
      return prisma.subject.findFirstOrThrow({
        ...query,
        /* eslint-disable unicorn/no-null */
        where: {
          OR: [
            { uid, yearTier },
            { uid, yearTier: null },
          ],
        },
        /* eslint-enable unicorn/no-null */
      });
    },
  }),
);

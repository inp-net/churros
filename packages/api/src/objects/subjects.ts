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
  t.prismaConnection({
    type: SubjectType,
    cursor: 'id',
    args: {
      uid: t.arg.string({ required: true }),
    },
    authScopes: () => true,
    async resolve(query, _, { uid }) {
      const minor = await prisma.minor.findUniqueOrThrow({ where: { uid } });
      return prisma.subject.findMany({
        ...query,
        where: {
          minors: {
            some: {
              id: minor.id,
            },
          },
        },
        orderBy: { name: 'asc' },
      });
    },
  }),
);

builder.queryField('subjectsOfMajor', (t) =>
  t.prismaConnection({
    type: SubjectType,
    cursor: 'id',
    args: {
      uid: t.arg.string({ required: true }),
      yearTier: t.arg.int({ required: false }),
    },
    authScopes: () => true,
    async resolve(query, _, { uid, yearTier }) {
      // XXX should become uniqueOrThrow at some point when all majors have uids
      const major = await prisma.major.findFirstOrThrow({ where: { uid } });
      return prisma.subject.findMany({
        ...query,
        where: {
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
        orderBy: { name: 'asc' },
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

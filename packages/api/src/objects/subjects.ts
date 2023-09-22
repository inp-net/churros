import { builder } from '../builder.js';
import { prisma } from '../prisma.js';
import { DocumentType } from './documents.js';
import { DateTimeScalar } from './scalars.js';

export const SubjectType = builder.prismaNode('Subject', {
  id: { field: 'id' },
  fields: (t) => ({
    name: t.exposeString('name'),
    uid: t.exposeString('uid'),
    nextExamAt: t.expose('nextExamAt', { type: DateTimeScalar, nullable: true }),
    majors: t.relation('majors'),
    minors: t.relation('minors'),
    documents: t.relatedConnection('documents', {
      type: DocumentType,
      cursor: 'id',
    }),
  }),
});

builder.queryField('subjects', (t) =>
  t.prismaConnection({
    type: SubjectType,
    cursor: 'id',
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

builder.queryField('subjectsOfMajor', t => t.prismaConnection({
    type: SubjectType,
    cursor: 'id',
    args: {
        uid: t.arg.string({ required: true }),
    },
    authScopes: () => true,
    async resolve(query, _, { uid }) {
        // XXX should become uniqueOrThrow at some point when all majors have uids
        const major = await prisma.major.findFirstOrThrow({ where: { uid } });
        return prisma.subject.findMany({
            ...query,
            where: {
                OR: [
            {    majors: {
                    some: {
                        id: major.id,
                    },
                },
            }, {
                minors: {
                    some: {
                        majors: {
                            some: {
                                id: major.id,
                            },
                        },
                    },
                },
            }
            ]
            },
            orderBy: { name: 'asc' },
        });
    }
}))

builder.queryField('subject', (t) =>
  t.prismaField({
    type: SubjectType,
    args: {
      uid: t.arg.string(),
    },
    authScopes: () => true,
    async resolve(query, _, { uid }) {
      return prisma.subject.findUniqueOrThrow({
        ...query,
        where: { uid },
      });
    },
  }),
);

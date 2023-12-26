import { builder, prisma } from '#lib';

export const MinorType = builder.prismaNode('Minor', {
  id: { field: 'id' },
  fields: (t) => ({
    name: t.exposeString('name'),
    shortName: t.exposeString('shortName'),
    uid: t.exposeString('uid'),
    yearTier: t.exposeInt('yearTier'),
    subjects: t.relation('subjects'),
    majors: t.relation('majors'),
    users: t.relation('users'),
  }),
});

builder.queryField('minors', (t) =>
  t.prismaConnection({
    type: MinorType,
    cursor: 'id',
    authScopes() {
      return true;
    },
    async resolve(query) {
      return prisma.minor.findMany({
        ...query,
      });
    },
  }),
);

builder.queryField('minorsOfMajor', (t) =>
  t.prismaConnection({
    type: MinorType,
    cursor: 'id',
    args: {
      uid: t.arg.string({ required: true }),
    },
    authScopes() {
      return true;
    },
    async resolve(query, _, { uid }) {
      // XXX should become uniqueOrThrow at some point when all majors have uids
      const major = await prisma.major.findFirstOrThrow({ where: { uid } });
      return prisma.minor.findMany({
        ...query,
        where: {
          majors: {
            some: {
              id: major.id,
            },
          },
        },
        orderBy: { name: 'asc' },
      });
    },
  }),
);

builder.queryField('minor', (t) =>
  t.prismaField({
    type: MinorType,
    args: {
      id: t.arg.id(),
    },
    authScopes: () => true,
    async resolve(query, _, { id }) {
      return prisma.minor.findUniqueOrThrow({
        ...query,
        where: { id },
      });
    },
  }),
);

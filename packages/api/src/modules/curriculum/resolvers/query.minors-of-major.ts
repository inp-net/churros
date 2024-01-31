import { builder, prisma } from '#lib';
import { MinorType } from '../index.js';
// TODO rename to major.minors

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

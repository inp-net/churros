import { builder, prisma } from '#lib';
import { MinorType } from '../index.js';

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

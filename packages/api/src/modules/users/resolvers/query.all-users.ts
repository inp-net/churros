import { builder, prisma } from '#lib';

import { UserType } from '../index.js';
// TODO maybe rename to query.users.ts ?

builder.queryField('allUsers', (t) =>
  t.prismaConnection({
    type: UserType,
    authScopes: { student: true },
    cursor: 'id',
    async resolve(query) {
      return prisma.user.findMany({
        ...query,
        orderBy: { uid: 'asc' },
      });
    },
  }),
);

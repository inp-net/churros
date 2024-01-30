import { builder, prisma } from '#lib';

import { UserType } from '../index.js';
// TODO maybe rename to query.users.ts ?

builder.queryField('allUsers', (t) =>
  t.withAuth({ student: true }).prismaConnection({
    type: UserType,
    async resolve(query) {
      return prisma.user.findMany({
        ...query,
        orderBy: { uid: 'asc' },
      });
    },
    cursor: 'id',
  }),
);

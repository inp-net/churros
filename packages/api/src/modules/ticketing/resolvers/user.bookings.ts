import { builder, prisma } from '#lib';

import { fullName, UserType } from '#modules/users';
import { GraphQLError } from 'graphql';
import { RegistrationType } from '../index.js';

builder.prismaObjectField(UserType, 'bookings', (t) =>
  t.prismaConnection({
    type: RegistrationType,
    cursor: 'id',
    args: {
      forUserOnly: t.arg.boolean({ required: false }),
    },
    authScopes({ uid: userUid }, _, { user }) {
      if (!user) throw new GraphQLError('User not found');
      return Boolean(user.admin || user.uid === userUid);
    },
    async resolve(query, { uid: userUid }, { forUserOnly }, { user: me }) {
      if (!me) throw new GraphQLError('Not logged in');
      const user = await prisma.user.findUnique({ where: { uid: userUid } });
      if (!user) throw new GraphQLError('User not found');
      return prisma.registration.findMany({
        ...query,
        where: {
          OR: [
            { author: { uid: userUid }, ...(forUserOnly ? { beneficiary: '' } : {}) },
            { beneficiary: userUid },
            { beneficiary: fullName(user) },
            { authorEmail: user.email },
          ],
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    },
  }),
);

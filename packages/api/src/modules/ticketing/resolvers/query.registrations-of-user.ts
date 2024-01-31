import { builder, prisma } from '#lib';

import { fullName } from '#modules/users';
import { GraphQLError } from 'graphql';
import { RegistrationType } from '../index.js';
// TODO rename to user.bookings
builder.queryField('registrationsOfUser', (t) =>
  t.prismaConnection({
    type: RegistrationType,
    cursor: 'id',
    args: {
      userUid: t.arg.string(),
      forUserOnly: t.arg.boolean({ required: false }),
    },
    authScopes(_, { userUid }, { user }) {
      if (!user) throw new GraphQLError('User not found');
      return Boolean(user.admin || user.uid === userUid);
    },
    async resolve(query, _, { userUid, forUserOnly }, { user: me }) {
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

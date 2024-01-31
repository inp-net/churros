import { builder, prisma } from '#lib';

import { GraphQLError } from 'graphql';
import { UserType } from '../index.js';
// TODO merge with query.user

builder.queryField('userByEmail', (t) =>
  t.prismaField({
    type: UserType,
    args: { email: t.arg.string() },
    authScopes: { loggedIn: true },
    async resolve(query, _, { email }) {
      const user = await prisma.user.findUnique({ ...query, where: { email } });
      if (!user) throw new GraphQLError('Utilisateur·ice introuvable');
      return user;
    },
  }),
);

import { builder, prisma } from '#lib';

import { GraphQLError } from 'graphql';
import { UserType } from '../index.js';

/** Gets a user from its id. */
builder.queryField('user', (t) =>
  t.withAuth({ loggedIn: true }).prismaField({
    type: UserType,
    args: { uid: t.arg.string() },
    async resolve(query, _, { uid }) {
      const user = await prisma.user.findUnique({ ...query, where: { uid } });
      if (!user) throw new GraphQLError('Utilisateur·ice introuvable');
      return user;
    },
  }),
);

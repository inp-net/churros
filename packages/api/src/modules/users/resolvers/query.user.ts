import { builder, prisma } from '#lib';

import { GraphQLError } from 'graphql';
import { UserType } from '../index.js';

/** Gets a user from its id. */
builder.queryField('user', (t) =>
  t.withAuth({ loggedIn: true }).prismaField({
    type: UserType,
    args: { uid: t.arg.string({ required: false }), id: t.arg.id({ required: false }) },
    validate: [
      [
        ({ uid, id }) => Boolean(uid || id),
        { message: "Vous devez fournir l'identifiant ou l'UID de l'utilisateur·ice" },
      ],
    ],
    async resolve(query, _, { uid, id }) {
      if (!uid && !id)
        throw new GraphQLError("Vous devez fournir l'identifiant ou l'UID de l'utilisateur·ice");
      const user = await prisma.user.findUnique({
        ...query,
        where: {
          id: id ?? undefined,
          uid: uid ?? undefined,
        },
      });
      if (!user) throw new GraphQLError('Utilisateur·ice introuvable');
      return user;
    },
  }),
);

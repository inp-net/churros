import { builder, prisma } from '#lib';
import { prismaQueryAccessibleArticles } from '#permissions';
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
    async resolve(query, _, { uid, id }, { user }) {
      if (!uid && !id)
        throw new GraphQLError("Vous devez fournir l'identifiant ou l'UID de l'utilisateur·ice");
      const userToReturn = await prisma.user.findUnique({
        ...query,
        where: {
          id: id ?? undefined,
          uid: uid ?? undefined,
        },
        include: { articles: { where: prismaQueryAccessibleArticles(user, 'wants') } },
      });
      if (!userToReturn) throw new GraphQLError('Utilisateur·ice introuvable');
      return userToReturn;
    },
  }),
);

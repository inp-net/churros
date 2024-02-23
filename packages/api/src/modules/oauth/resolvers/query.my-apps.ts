import { builder, prisma } from '#lib';

import { GraphQLError } from 'graphql';

// TODO rename to my-third-party-apps

builder.queryField('myApps', (t) =>
  t.prismaField({
    type: ['ThirdPartyApp'],
    authScopes: { loggedIn: true },
    async resolve(query, _, __, { user }) {
      if (!user) throw new GraphQLError('Not logged in');
      const boardIn = await prisma.group.findMany({
        where: {
          members: {
            some: {
              member: { id: user.id },
              OR: [
                {
                  president: true,
                },
                {
                  vicePresident: true,
                },
                {
                  secretary: true,
                },
                {
                  treasurer: true,
                },
              ],
            },
          },
        },
      });
      return prisma.thirdPartyApp.findMany({
        ...query,
        where: {
          ownerId: {
            in: boardIn.map((g) => g.id),
          },
        },
      });
    },
  }),
);

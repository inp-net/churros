import { builder, prisma } from '#lib';
import {} from '#modules/global';
import { UserType } from '#modules/users';
import { ThirdPartyApp } from '../index.js';

builder.prismaObjectField(UserType, 'authorizedApps', (t) =>
  t.prismaField({
    type: [ThirdPartyApp],
    authScopes: { loggedIn: true },
    description: 'Applications tierces autorisées à accéder à ce compte utilisateur',
    resolve: async (query, _, {}, { user }) => {
      if (!user) return [];
      return prisma.thirdPartyApp.findMany({
        ...query,
        where: {
          credentials: {
            some: {
              ownerId: user.id,
            },
          },
        },
      });
    },
  }),
);

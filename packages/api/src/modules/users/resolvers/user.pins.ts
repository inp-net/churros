import { builder, prisma, UnauthorizedError } from '#lib';
import { PinType, UserType } from '#modules/users/types';

builder.prismaObjectField(UserType, 'pins', (t) =>
  t.prismaField({
    type: [PinType],
    description: "Les accès rapides de l'utilisateur·rice",
    authScopes: {
      $granted: 'me',
    },
    async resolve(query, _, {}, { user }) {
      if (!user) throw new UnauthorizedError();
      return prisma.pin.findMany({
        ...query,
        where: {
          userId: user.id,
        },
        orderBy: { updatedAt: 'asc' },
      });
    },
  }),
);

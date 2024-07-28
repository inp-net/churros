import { builder, prisma, UnauthorizedError } from '#lib';
import { PinType } from '../types/pin.js';

builder.mutationField('pin', (t) =>
  t.prismaField({
    type: PinType,
    description:
      'Épingle une page pour en faire un accès rapide. Si la page est déjà épinglée, ne fait rien. Voir `unpin` pour retirer une page épinglée.',
    args: {
      path: t.arg.string({ description: 'Chemin de la page à épingler' }),
    },
    authScopes: { loggedIn: true },
    async resolve(query, _, { path }, { user }) {
      if (!user) throw new UnauthorizedError();
      return prisma.pin.upsert({
        ...query,
        where: {
          userId_path: {
            path,
            userId: user.id,
          },
        },
        update: {},
        create: {
          path,
          user: {
            connect: {
              id: user.id,
            },
          },
        },
      });
    },
  }),
);

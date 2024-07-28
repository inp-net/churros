import { builder, prisma } from '#lib';

builder.queryField('pinned', (t) =>
  t.boolean({
    description: "Si la page donnée est épinglée par l'utilisateur·ice connecté·e",
    args: {
      path: t.arg.string({ description: 'Chemin de la page' }),
    },
    async resolve(_, { path }, { user }) {
      if (!user) return false;
      return Boolean(
        await prisma.pin.findUnique({
          where: {
            userId_path: {
              userId: user.id,
              path,
            },
          },
        }),
      );
    },
  }),
);

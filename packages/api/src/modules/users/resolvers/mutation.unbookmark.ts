import { builder, prisma, UnauthorizedError } from '#lib';
import { PrismaClientKnownRequestError } from '@churros/db/prisma/runtime/library';
import { BookmarkType } from '../types/index.js';

builder.mutationField('unbookmark', (t) =>
  t.prismaField({
    type: BookmarkType,
    nullable: true,
    description: "Enlève une page de l'accès rapide",
    args: {
      path: t.arg.string({ description: 'Chemin de la page à désépingler' }),
    },
    authScopes: { loggedIn: true },
    async resolve(query, _, { path }, { user }) {
      if (!user) throw new UnauthorizedError();
      return prisma.bookmark
        .delete({
          ...query,
          where: {
            userId_path: {
              userId: user.id,
              path,
            },
          },
        })
        .catch((error) => {
          if (error instanceof PrismaClientKnownRequestError && error.code === 'P2025') return null;

          throw error;
        });
    },
  }),
);

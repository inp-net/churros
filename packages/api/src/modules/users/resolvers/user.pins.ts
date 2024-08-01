import { builder, prisma, UnauthorizedError } from '#lib';
import { BookmarkType, UserType } from '#modules/users/types';

builder.prismaObjectField(UserType, 'bookmarks', (t) =>
  t.prismaField({
    type: [BookmarkType],
    description: "Les accès rapides de l'utilisateur·rice",
    authScopes: {
      $granted: 'me',
    },
    async resolve(query, _, {}, { user }) {
      if (!user) throw new UnauthorizedError();
      return prisma.bookmark.findMany({
        ...query,
        where: {
          userId: user.id,
        },
        orderBy: { updatedAt: 'asc' },
      });
    },
  }),
);

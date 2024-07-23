import { builder, prisma } from '#lib';
import { UserType } from '#modules/users';
import { GroupType, prismaQueryCanCreatePostsOn } from '../index.js';

builder.prismaObjectField(UserType, 'canCreatePostsOn', (t) =>
  t.prismaField({
    type: [GroupType],
    description: "Groupes sur lesquels l'utilisateur·ice peut créer des posts",
    async resolve(query, user, _) {
      return prisma.group.findMany({
        ...query,
        where: prismaQueryCanCreatePostsOn(user),
      });
    },
  }),
);

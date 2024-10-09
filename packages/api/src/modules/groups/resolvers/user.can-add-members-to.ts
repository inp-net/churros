import { builder, prisma } from '#lib';
import { GroupType } from '#modules/groups/types';
import { prismaQueryCanEditGroupMembersOf } from '#modules/groups/utils';
import { UserType } from '#modules/users';

builder.prismaObjectField(UserType, 'canAddMembersTo', (t) =>
  t.prismaField({
    type: [GroupType],
    description: "Groupes auxquels l'utilisateur·ice peut ajouter des membres",
    async resolve(query, user) {
      return prisma.group.findMany({
        ...query,
        where: prismaQueryCanEditGroupMembersOf(user),
      });
    },
  }),
);

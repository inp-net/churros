import { builder, prisma } from '#lib';
import { GroupType } from '#modules/groups';
import { canCreateThemesPrismaQuery } from '#modules/themes/utils';
import { UserType } from '#modules/users';

builder.prismaObjectField(UserType, 'canCreateThemesOn', (t) =>
  t.prismaField({
    type: [GroupType],
    description: "Groupes sur lesquels l'utilisateur·ice peut créer des thèmes",
    async resolve(query, user) {
      return prisma.group.findMany({
        ...query,
        where: canCreateThemesPrismaQuery(user),
      });
    },
  }),
);

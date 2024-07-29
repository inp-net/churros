import { builder, prisma } from '#lib';
import {
  StudentAssociationType,
  prismaQueryCanCreateGroupsOn,
} from '#modules/student-associations';
import { UserType } from '#modules/users';

builder.prismaObjectField(UserType, 'canCreateGroupsOn', (t) =>
  t.prismaField({
    description: "AEs sur lesquelles l'utilisateur·ice peut créer des groupes",
    type: [StudentAssociationType],
    async resolve(query, user) {
      return prisma.studentAssociation.findMany({
        ...query,
        where: prismaQueryCanCreateGroupsOn(user),
      });
    },
  }),
);

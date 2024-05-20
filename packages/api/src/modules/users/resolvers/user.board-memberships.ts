import { builder, prisma } from '#lib';
import { GroupMemberType } from '../../groups/index.js';
import { UserType } from '../types/user.js';

builder.prismaObjectField(UserType, 'boardMemberships', (t) =>
  t.prismaField({
    type: [GroupMemberType],
    description: "Les affiliations de l'utilisateur à des groupes dont iel est au bureau",
    authScopes: () => true,
    resolve: async (query, { id }) =>
      prisma.groupMember.findMany({
        ...query,
        where: {
          memberId: id,
          OR: [
            {
              president: true,
            },
            {
              secretary: true,
            },
            {
              vicePresident: true,
            },
            {
              treasurer: true,
            },
          ],
        },
      }),
  }),
);

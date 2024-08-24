import { builder, prisma } from '#lib';
import { GroupType } from '#modules/groups';

builder.prismaObjectField(GroupType, 'pagesCount', (t) =>
  t.int({
    description: 'Nombre de pages associées au groupe',
    resolve: async ({ id }) => {
      return prisma.page.count({
        where: { groupId: id },
      });
    },
  }),
);

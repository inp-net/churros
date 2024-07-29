import { builder, prisma } from '#lib';
import { UserType } from '#modules/users';
import { GroupType, prismaQueryCanCreateEventsOn } from '../index.js';

builder.prismaObjectField(UserType, 'canCreateEventsOn', (t) =>
  t.prismaField({
    type: [GroupType],
    description: "Groupes sur lesquels l'utilisateur·ice peut créer des évènements",
    async resolve(query, user, _) {
      return prisma.group.findMany({
        ...query,
        where: prismaQueryCanCreateEventsOn(user),
      });
    },
  }),
);

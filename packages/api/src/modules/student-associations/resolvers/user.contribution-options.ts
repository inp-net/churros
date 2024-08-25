import { builder, prisma } from '#lib';
import { ContributionOptionType } from '#modules/student-associations/types';
import { UserType } from '#modules/users';

builder.prismaObjectField(UserType, 'contributionOptions', (t) =>
  t.prismaField({
    type: [ContributionOptionType],
    description: "Options de cotisations que l'utilisateur·ice connecté·e peut utiliser.",
    async resolve(query, { id }) {
      return prisma.contributionOption.findMany({
        ...query,
        where: {
          offeredIn: {
            majors: {
              some: {
                students: {
                  some: { id },
                },
              },
            },
          },
        },
      });
    },
  }),
);

import { ContributionOptionType } from '../index.js';
import {} from '#modules/global';
import { builder, prisma } from '#lib';

builder.queryField('contributionOptions', (t) =>
  t.prismaField({
    type: [ContributionOptionType],
    authScopes(_, {}, { user }) {
      return Boolean(user);
    },
    async resolve(query, _, {}, { user }) {
      return prisma.contributionOption.findMany({
        ...query,
        where: {
          offeredIn: {
            majors: {
              some: {
                students: {
                  some: {
                    id: user?.id,
                  },
                },
              },
            },
          },
        },
      });
    },
  }),
);

import { builder, prisma } from '#lib';

import { ContributionOptionType } from '../index.js';

builder.prismaObjectField('User', 'contributesWith', (t) =>
  t.prismaField({
    type: [ContributionOptionType],
    resolve: async (query, { id }) =>
      prisma.contributionOption.findMany({
        ...query,
        where: {
          contributions: {
            some: {
              userId: id,
              paid: true,
            },
          },
        },
      }),
  }),
);

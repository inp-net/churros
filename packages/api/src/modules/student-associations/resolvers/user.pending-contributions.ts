import { builder, prisma } from '#lib';

builder.prismaObjectField('User', 'pendingContributions', (t) =>
  t.prismaField({
    type: ['ContributionOption'],
    resolve: async (query, { id }) =>
      prisma.contributionOption.findMany({
        ...query,
        where: {
          contributions: {
            some: {
              userId: id,
              paid: false,
            },
          },
        },
      }),
  }),
);

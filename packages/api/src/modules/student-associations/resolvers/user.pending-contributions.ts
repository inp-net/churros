import { builder, prisma } from '#lib';
import {} from '#modules/global';
import {} from '../index.js';

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

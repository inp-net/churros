import { builder, prisma } from '#lib';

import { StudentAssociationType } from '../index.js';

builder.prismaObjectField('User', 'contributesTo', (t) =>
  t.prismaField({
    type: [StudentAssociationType],
    resolve: async (query, { id }) =>
      prisma.studentAssociation.findMany({
        ...query,
        where: {
          contributionOptions: {
            some: {
              contributions: {
                some: {
                  userId: id,
                  paid: true,
                },
              },
            },
          },
        },
      }),
  }),
);

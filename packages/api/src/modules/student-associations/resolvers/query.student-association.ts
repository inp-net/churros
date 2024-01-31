import { builder, prisma } from '#lib';

import { StudentAssociationType } from '../index.js';

builder.queryField('studentAssociations', (t) =>
  t.prismaField({
    type: [StudentAssociationType],
    authScopes(_, {}, { user }) {
      return Boolean(user);
    },
    args: {
      canContributeOnly: t.arg.boolean({ required: false }),
    },
    async resolve(query, _, { canContributeOnly }, { user }) {
      return prisma.studentAssociation.findMany({
        ...query,
        where:
          canContributeOnly && user?.major
            ? {
                contributionOptions: {
                  some: {
                    offeredIn: {
                      majors: {
                        some: {
                          id: user.major.id,
                        },
                      },
                    },
                  },
                },
              }
            : {},
        orderBy: { updatedAt: 'desc' },
      });
    },
  }),
);

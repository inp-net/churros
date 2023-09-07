import { builder } from '../builder.js';
import { prisma } from '../prisma.js';

export const ContributionOptionType = builder.prismaObject('ContributionOption', {
  fields: (t) => ({
    id: t.exposeID('id'),
    name: t.exposeString('name'),
    price: t.exposeFloat('price'),
    paysFor: t.relation('paysFor'),
    offeredIn: t.relation('offeredIn'),
  }),
});

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
  })
);

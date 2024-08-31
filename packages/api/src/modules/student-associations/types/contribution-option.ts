import { builder, prisma, toHtml } from '#lib';
import { canMarkContributionAsPaid } from '#modules/student-associations/utils';
import type { Prisma } from '@churros/db/prisma';

export const ContributionOptionPrismaIncludes = {
  ...canMarkContributionAsPaid.prismaIncludes,
} as const satisfies Prisma.ContributionOptionInclude;

export const ContributionOptionType = builder.prismaNode('ContributionOption', {
  id: { field: 'id' },
  include: ContributionOptionPrismaIncludes,
  fields: (t) => ({
    name: t.exposeString('name'),
    price: t.exposeFloat('price'),
    descriptionHtml: t.string({
      resolve: async ({ description }) => toHtml(description),
    }),
    paysFor: t.relation('paysFor'),
    offeredIn: t.relation('offeredIn'),
    canMarkAsPaid: t.boolean({
      description: 'On peut marquer une cotisation de cette option comme payée',
      async resolve(option, _, { user }) {
        return canMarkContributionAsPaid(user, option);
      },
    }),
    paidBy: t.boolean({
      description: 'Une personne paye une cotisation avec cette option',
      args: {
        uid: t.arg.string({
          // type: UIDScalar, //TODO
          description: "UID de l'utilisateur·ice",
        }),
      },
      authScopes: { loggedIn: true },
      async resolve(option, { uid }) {
        return Boolean(
          await prisma.contribution.count({
            where: {
              optionId: option.id,
              user: { uid },
            },
          }),
        );
      },
    }),
  }),
});

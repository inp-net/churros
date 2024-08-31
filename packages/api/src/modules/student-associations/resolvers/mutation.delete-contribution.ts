import { builder, ensureGlobalId, log, prisma } from '#lib';
import { LocalID } from '#modules/global';
import { ContributionOptionType } from '#modules/student-associations/types';
import { canMarkContributionAsPaid } from '#modules/student-associations/utils';

builder.mutationField('deleteContribution', (t) =>
  t.prismaField({
    type: ContributionOptionType,
    description: 'Supprimer une cotisation',
    errors: {},
    args: {
      option: t.arg({ type: LocalID }),
      // user: t.arg({ type: UIDScalar }), //TODO
      user: t.arg.string(),
    },
    async authScopes(_, { option }, { user: me }) {
      return canMarkContributionAsPaid(
        me,
        await prisma.contributionOption.findUniqueOrThrow({
          where: { id: ensureGlobalId(option, 'ContributionOption') },
          include: canMarkContributionAsPaid.prismaIncludes,
        }),
      );
    },
    async resolve(query, _, { option, user: userUid }, { user: me }) {
      const user = await prisma.user.findUniqueOrThrow({ where: { uid: userUid } });
      await log(
        'student-associations',
        'delete-contribution',
        { option, user },
        ensureGlobalId(option, 'ContributionOption'),
        me,
      );
      return prisma.contributionOption.update({
        ...query,
        where: { id: ensureGlobalId(option, 'ContributionOption') },
        data: {
          contributions: {
            delete: {
              optionId_userId: {
                userId: user.id,
                optionId: ensureGlobalId(option, 'ContributionOption'),
              },
            },
          },
        },
      });
    },
  }),
);

import { builder, ensureGlobalId, log, prisma } from '#lib';
import { LocalID, UIDScalar } from '#modules/global';
import { ContributionOptionType } from '#modules/student-associations/types';
import { canMarkContributionAsPaid } from '#modules/student-associations/utils';

builder.mutationField('markContributionAsPaid', (t) =>
  t.prismaField({
    type: ContributionOptionType,
    description: 'Marquer une cotisation comme payée.',
    errors: {},
    args: {
      option: t.arg({ type: LocalID }),
      user: t.arg({ type: UIDScalar }),
      create: t.arg.boolean({
        defaultValue: false,
        description:
          "Créer la cotisation si elle n'existe pas (et immédiatement la marquer comme payée)",
      }),
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
    async resolve(query, _, args, { user: me }) {
      const user = await prisma.user.findUniqueOrThrow({ where: { uid: args.user } });
      const optionId = ensureGlobalId(args.option, 'ContributionOption');
      await log('student-associations', 'mark-contribution-as-paid', args, optionId, me);
      return prisma.contributionOption.update({
        ...query,
        where: { id: optionId },
        data: {
          contributions: args.create
            ? {
                upsert: {
                  where: {
                    optionId_userId: {
                      userId: user.id,
                      optionId: optionId,
                    },
                  },
                  update: {
                    paid: true,
                  },
                  create: {
                    userId: user.id,
                    paid: true,
                  },
                },
              }
            : {
                update: {
                  where: {
                    optionId_userId: {
                      userId: user.id,
                      optionId: optionId,
                    },
                  },
                  data: {
                    paid: true,
                  },
                },
              },
        },
      });
    },
  }),
);

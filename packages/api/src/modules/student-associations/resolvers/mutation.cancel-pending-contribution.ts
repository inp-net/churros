import { builder, prisma } from '#lib';

import { cancelLydiaTransaction } from '#modules/payments';

// TODO maybe query to get list of all contributors of a student association
builder.mutationField('cancelPendingContribution', (t) =>
  t.field({
    type: 'Boolean',
    args: {
      optionId: t.arg.id(),
    },
    authScopes(_, {}, { user }) {
      return Boolean(user);
    },
    async resolve(_, { optionId }, { user }) {
      if (!user) return false;

      const contribution = await prisma.contribution.findUnique({
        where: {
          optionId_userId: {
            userId: user.id,
            optionId,
          },
        },
        include: {
          transaction: true,
          option: {
            include: {
              beneficiary: true,
            },
          },
        },
      });

      if (contribution?.transaction?.requestId && contribution.option.beneficiary?.vendorToken) {
        await cancelLydiaTransaction(
          contribution.transaction,
          contribution.option.beneficiary.vendorToken,
        );
      }

      await prisma.contribution.delete({
        where: {
          optionId_userId: {
            userId: user.id,
            optionId,
          },
        },
      });

      await prisma.logEntry.create({
        data: {
          area: 'contribution',
          action: 'delete',
          target: optionId,
          message: `Deleted contribution ${optionId}`,
          user: { connect: { id: user.id } },
        },
      });
      return true;
    },
  }),
);

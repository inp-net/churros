import { builder, prisma } from '#lib';

import { cancelLydiaTransaction, sendLydiaPaymentRequest } from '#modules/payments';
import { GraphQLError } from 'graphql';

builder.mutationField('contribute', (t) =>
  t.field({
    type: 'Boolean',
    errors: {},
    args: {
      optionId: t.arg.id(),
      phone: t.arg.string(),
    },
    authScopes(_, {}, { user }) {
      return Boolean(user);
    },
    async resolve(_, { optionId, phone }, { user }) {
      if (!user) return false;

      const contributionOption = await prisma.contributionOption.findUnique({
        where: { id: optionId },
        include: { beneficiary: true, offeredIn: { include: { majors: true } } },
      });

      if (!contributionOption) throw new GraphQLError('Option de cotisation introuvable');
      if (!contributionOption.beneficiary) {
        throw new GraphQLError(
          "Aucun compte Lydia bénéficiare n'est associé à cette option de cotisation",
        );
      }

      if (!contributionOption.offeredIn.majors.some((major) => user.major?.id === major.id))
        throw new GraphQLError("Cette option de cotisation n'est pas offerte à votre école");

      // eslint-disable-next-line prefer-const
      let { transaction, ...contribution } = await prisma.contribution.upsert({
        where: {
          optionId_userId: {
            userId: user.id,
            optionId: contributionOption.id,
          },
        },
        create: {
          option: { connect: { id: contributionOption.id } },
          paid: false,
          user: {
            connect: { id: user.id },
          },
        },
        update: {},
        include: {
          transaction: true,
        },
      });

      if (!transaction) {
        transaction = await prisma.lydiaTransaction.create({
          data: {
            contribution: { connect: { id: contribution.id } },
            phoneNumber: phone,
          },
        });
      }

      if (transaction.requestId && transaction.requestUuid)
        await cancelLydiaTransaction(transaction, contributionOption.beneficiary.vendorToken);

      const details = await sendLydiaPaymentRequest(
        `Cotisation pour ${contributionOption.name}`,
        contributionOption.price,
        phone,
        contributionOption.beneficiary.vendorToken,
      );

      await prisma.lydiaTransaction.update({
        where: { id: transaction.id },
        data: {
          phoneNumber: phone,
          ...details,
        },
      });

      await prisma.logEntry.create({
        data: {
          area: 'contribution',
          action: 'create',
          target: optionId,
          message: JSON.stringify(contributionOption),
          user: { connect: { id: user.id } },
        },
      });

      return true;
    },
  }),
);

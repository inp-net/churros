import { GraphQLError } from 'graphql';
import { builder } from '../builder.js';
import { prisma } from '../prisma.js';
import { DateTimeScalar } from './scalars.js';
import { cancelLydiaTransaction, sendLydiaPaymentRequest } from '../services/lydia.js';

export const StudentAssociationType = builder.prismaObject('StudentAssociation', {
  fields: (t) => ({
    id: t.exposeID('id'),
    createdAt: t.expose('createdAt', { type: DateTimeScalar }),
    updatedAt: t.expose('updatedAt', { type: DateTimeScalar }),
    schoolId: t.exposeID('schoolId'),
    name: t.exposeString('name'),
    links: t.relation('links'),
    school: t.relation('school'),
    groups: t.relation('groups'),
  }),
});

builder.queryField('studentAssociations', (t) =>
  t.prismaField({
    type: [StudentAssociationType],
    authScopes(_, {}, { user }) {
      return Boolean(user);
    },
    async resolve(query) {
      return prisma.studentAssociation.findMany({
        ...query,
        orderBy: { updatedAt: 'desc' },
      });
    },
  })
);

builder.queryField('studentAssociation', (t) =>
  t.prismaField({
    type: StudentAssociationType,
    args: {
      id: t.arg.id(),
    },
    authScopes(_, {}, { user }) {
      return Boolean(user);
    },
    async resolve(query, _, { id }) {
      return prisma.studentAssociation.findUniqueOrThrow({
        ...query,
        where: { id },
      });
    },
  })
);

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
      if (!contributionOption.beneficiary)
        {throw new GraphQLError(
          "Aucun compte Lydia bénéficiare n'est associé à cette option de cotisation"
        );}

      if (!contributionOption.offeredIn.majors.some((major) => user.major.id === major.id))
        throw new GraphQLError("Cette option de cotisation n'est pas offerte à votre école");

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
        contributionOption.beneficiary.vendorToken
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
  })
);

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
          contribution.option.beneficiary.vendorToken
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
  })
);

// TODO maybe query to get list of all contributors of a student association

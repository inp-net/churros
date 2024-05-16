import { builder, prisma } from '#lib';
import { GraphQLError } from 'graphql';

import { saveUser } from '../index.js';
import { prismaUserFilterForStudentAssociationAdmins } from '../utils/index.js';
// TODO rename to accept-user-candidate

builder.mutationField('acceptRegistration', (t) =>
  t.field({
    authScopes: { admin: true, studentAssociationAdmin: true },
    type: 'Boolean',
    args: { email: t.arg.string() },
    async resolve(_, { email }, { user }) {
      if (!user) throw new GraphQLError("Vous n'êtes pas connecté·e");

      const candidate = await prisma.userCandidate.findUnique({
        where: { email, ...prismaUserFilterForStudentAssociationAdmins(user) },
      });
      if (!candidate) throw new GraphQLError('Candidat·e introuvable');

      await prisma.logEntry.create({
        data: {
          action: 'accept',
          area: 'signups',
          message: `Acceptation de l'inscription de ${email}`,
          user: { connect: { id: user!.id } },
          target: `token ${candidate.token}`,
        },
      });
      await saveUser(candidate);
      return true;
    },
  }),
);

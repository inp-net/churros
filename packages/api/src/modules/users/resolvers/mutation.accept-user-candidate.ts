import { builder, log, prisma } from '#lib';
import { GraphQLError } from 'graphql';

import { Prisma } from '@churros/db/prisma';
import { saveUser, UserCandidateType } from '../index.js';
import { prismaUserFilterForStudentAssociationAdmins } from '../utils/index.js';

builder.mutationField('acceptUserCandidate', (t) =>
  t.prismaField({
    authScopes: { admin: true, studentAssociationAdmin: true },
    errors: {},
    type: UserCandidateType,
    args: { email: t.arg.string() },
    async resolve(query, _, { email }, { user }) {
      if (!user) throw new GraphQLError("Vous n'êtes pas connecté·e");

      const candidate = await prisma.userCandidate.findUnique({
        ...query,
        where: { email, ...prismaUserFilterForStudentAssociationAdmins(user) },
      });
      if (!candidate) throw new GraphQLError('Candidat·e introuvable');

      await log(
        'signup',
        'accept',
        { message: `Acceptation de l'inscription de ${email}`, candidate },
        candidate.id,
        user,
      );

      try {
        await saveUser(candidate);
        return candidate;
      } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002')
          throw new GraphQLError('Il semble que cet·te utilisateur·ice ait déjà un compte.');
        throw error;
      }
    },
  }),
);

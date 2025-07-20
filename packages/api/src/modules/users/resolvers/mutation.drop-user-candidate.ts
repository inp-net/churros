import { builder, log, prisma } from '#lib';
import { UserCandidateType } from '#modules/users/types';
import { GraphQLError } from 'graphql';
import { prismaUserFilterForStudentAssociationAdmins } from '../utils/index.js';

builder.mutationField('dropUserCandidate', (t) =>
  t.prismaField({
    type: UserCandidateType,
    errors: {},
    authScopes: { studentAssociationAdmin: true, admin: true },
    args: { email: t.arg.string() },
    async resolve(query, _, { email }, { user }) {
      if (!user) throw new GraphQLError("Vous n'êtes pas connecté·e");

      let candidate = await prisma.userCandidate.findUnique({
        where: { email, ...prismaUserFilterForStudentAssociationAdmins(user) },
      });
      if (!candidate) throw new GraphQLError('Candidat·e introuvable');

      candidate = await prisma.userCandidate.delete({ ...query, where: { email } });

      await log(
        'signup',
        'drop',
        { message: `Suppression de l'inscription de ${email}` },
        candidate.id,
        user,
      );
      return candidate;
    },
  }),
);

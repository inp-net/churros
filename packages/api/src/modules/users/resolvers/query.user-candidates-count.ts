import { builder, prisma } from '#lib';
import { prismaQueryUserCandidatesForUser } from '#modules/users/utils';

builder.queryField('userCandidatesCount', (t) =>
  t.int({
    description: "Nombre d'inscriptions à valider qui sont validables par la personne connectée",
    async resolve(_, {}, { user }) {
      if (!user?.admin && user?.adminOfStudentAssociations.length === 0) return 0;
      return prisma.userCandidate.count({
        where: prismaQueryUserCandidatesForUser(user),
      });
    },
  }),
);

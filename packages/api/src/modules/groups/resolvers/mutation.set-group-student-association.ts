import { builder, log, prisma } from '#lib';
import { UIDScalar } from '#modules/global';
import { GroupType } from '#modules/groups/types';
import { canChangeGroupStudentAssociation } from '#modules/groups/utils';

builder.mutationField('setGroupStudentAssociation', (t) =>
  t.prismaField({
    type: GroupType,
    errors: {},
    description: "Changer l'AE liée à un groupe",
    args: {
      group: t.arg({ type: UIDScalar }),
      studentAssociation: t.arg({ type: UIDScalar }),
    },
    async authScopes(_, { group }, { user }) {
      return canChangeGroupStudentAssociation(
        user,
        await prisma.group.findUniqueOrThrow({
          where: { uid: group },
          include: canChangeGroupStudentAssociation.prismaIncludes,
        }),
      );
    },
    async resolve(query, _, { group, studentAssociation }, { user }) {
      await log('groups', 'set-student-association', { group, studentAssociation }, group, user);
      return prisma.group.update({
        ...query,
        where: { uid: group },
        data: {
          studentAssociationId: studentAssociation,
        },
      });
    },
  }),
);

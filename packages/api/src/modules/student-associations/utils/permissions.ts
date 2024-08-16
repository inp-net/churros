import type { Context } from '#lib';
import type { Prisma } from '@churros/db/prisma';

export function prismaQueryCanCreateGroupsOn(user: {
  id: string;
}): Prisma.StudentAssociationWhereInput {
  return {
    OR: [{ admins: { some: { id: user.id } } }],
  };
}

export function canContributeTo(
  user: Context['user'],
  studentAssociation: Prisma.StudentAssociationGetPayload<{
    include: typeof canContributeTo.prismaIncludes;
  }>,
) {
  return studentAssociation.contributionOptions.some((option) =>
    user?.major?.schools.some((s) => s.id === option.offeredInId),
  );
}

canContributeTo.prismaIncludes = {
  contributionOptions: true,
} as const satisfies Prisma.StudentAssociationInclude;

export function userContributesTo(
  user: Context['user'],
  studentAssociation: Prisma.StudentAssociationGetPayload<{
    include: typeof userContributesTo.prismaIncludes;
  }>,
) {
  if (!user) return false;
  return studentAssociation.contributionOptions.some((option) =>
    option.contributions.some(({ userId }) => userId === user.id),
  );
}

userContributesTo.prismaIncludes = {
  contributionOptions: {
    include: {
      contributions: true,
    },
  },
} as const satisfies Prisma.StudentAssociationInclude;

export function canEditDetails(
  user: Context['user'],
  studentAssociation: Prisma.StudentAssociationGetPayload<{ include: {} }>,
) {
  if (!user) return false;
  return (
    user.admin || user.adminOfStudentAssociations.some((sa) => sa.id === studentAssociation.id)
  );
}

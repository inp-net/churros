import type { Context } from '#lib';
import { canEditGroup } from '#modules/groups';
import { userIsAdminOf } from '#permissions';
import type { Prisma } from '@churros/db/prisma';

export function canCreateServicesOnStudentAssociation(
  user: Context['user'],
  studentAssociation: Prisma.StudentAssociationGetPayload<{
    include: typeof canCreateServicesOnStudentAssociation.prismaIncludes;
  }>,
): boolean {
  if (!user) return false;
  if (user.admin) return true;
  if (userIsAdminOf(user, studentAssociation.id)) return true;
  return false;
}

canCreateServicesOnStudentAssociation.prismaIncludes =
  {} as const satisfies Prisma.StudentAssociationInclude;

export function canEditService(
  user: Context['user'],
  service: Prisma.ServiceGetPayload<{
    include: typeof canEditService.prismaIncludes;
  }>,
) {
  if (!user) return false;
  if (user.admin) return true;
  if (service.studentAssociation)
    return canCreateServicesOnStudentAssociation(user, service.studentAssociation);

  if (service.group) {
    if (canCreateServicesOnStudentAssociation(user, service.group.studentAssociation)) return true;
    if (canEditGroup(user, service.group)) return true;
  }
  return false;
}

canEditService.prismaIncludes = {
  studentAssociation: {
    include: canCreateServicesOnStudentAssociation.prismaIncludes,
  },
  group: {
    include: {
      ...canEditGroup.prismaIncludes,
      studentAssociation: {
        include: canCreateServicesOnStudentAssociation.prismaIncludes,
      },
    },
  },
} as const satisfies Prisma.ServiceInclude;

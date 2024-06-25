import type { Context } from '#lib';
import { userIsDeveloperOf, userIsOnBoardOf } from '#permissions';
import type { Group, StudentAssociation } from '@centraverse/db/prisma';

export function canListStudentAssociationPages(
  user: Context['user'],
  studentAssociationId: string,
): boolean {
  if (!user) return false;
  return (
    user.admin || user.adminOfStudentAssociations.some(({ id }) => id === studentAssociationId)
  );
}

export function canListGroupPages(user: Context['user'], group: Group): boolean {
  if (!user) return false;

  if (
    group.studentAssociationId &&
    canListStudentAssociationPages(user, group.studentAssociationId)
  )
    return true;

  return user.admin || userIsDeveloperOf(user, group.id) || userIsOnBoardOf(user, group.uid);
}

export function canEditGroupPages(user: Context['user'], group: Group): boolean {
  return canListGroupPages(user, group);
}

export function canEditStudentAssociationPages(
  user: Context['user'],
  studentAssociationId: string,
): boolean {
  return canListStudentAssociationPages(user, studentAssociationId);
}

export function canEditPage(
  user: Context['user'],
  page: {
    group: null | Group;
    studentAssociation: null | StudentAssociation;
  },
): boolean {
  if (!user) return false;

  if (page.studentAssociation?.id)
    return canListStudentAssociationPages(user, page.studentAssociation.id);

  if (page.group) return canListGroupPages(user, page.group);

  return user.admin;
}

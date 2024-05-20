import type { Context } from '#lib';

export function onBoard(
  permissions:
    | { president: boolean; treasurer: boolean; vicePresident: boolean; secretary: boolean }
    | undefined
    | null,
): boolean {
  if (!permissions) return false;
  return (
    permissions.president ||
    permissions.treasurer ||
    permissions.vicePresident ||
    permissions.secretary
  );
}

// TODO allow  these functions to take a groupId as an alternative to groupUid

export function userIsPresidentOf(user: Context['user'], groupUid: string): boolean {
  return Boolean(
    user?.groups.some(({ group: { uid }, president }) => uid === groupUid && president),
  );
}

export function userIsTreasurerOf(user: Context['user'], groupUid: string): boolean {
  return Boolean(
    user?.groups.some(({ group: { uid }, treasurer }) => uid === groupUid && treasurer),
  );
}

export function userIsOnBoardOf(user: Context['user'], groupUid: string): boolean {
  return Boolean(
    user?.groups.some(
      ({ group: { uid }, ...permissions }) => uid === groupUid && onBoard(permissions),
    ),
  );
}

export function userIsMemberOf(user: Context['user'], groupUid: string): boolean {
  return Boolean(user?.groups.some(({ group: { uid } }) => uid === groupUid));
}

export function userIsDeveloperOf(user: Context['user'], groupUid: string): boolean {
  return Boolean(
    user?.groups.some(({ group: { uid }, isDeveloper }) => groupUid === uid && isDeveloper),
  );
}

export function userIsAdminOf(
  user: Context['user'],
  studentAssociationId: string[] | string | null = null,
): boolean {
  if (user?.admin) return true;
  if (!studentAssociationId) return false;

  return Boolean(
    user?.adminOfStudentAssociations.some(({ id }) => {
      return Array.isArray(studentAssociationId)
        ? studentAssociationId.includes(id)
        : studentAssociationId === id;
    }),
  );
}

/**
 * Check if a user has permission to edit a group
 *
 * @param user
 * @param studentAssociationId the id of the student association that the group belongs to
 */
export function userIsGroupEditorOf(
  user: Context['user'],
  studentAssociationId: string[] | string | undefined | null,
): boolean {
  if (user?.admin) return true;
  if (!studentAssociationId) return false;

  return Boolean(
    user?.canEditGroups.some(({ id: GroupEditorStudentAssociationIds }) => {
      return Array.isArray(studentAssociationId)
        ? studentAssociationId.includes(GroupEditorStudentAssociationIds)
        : studentAssociationId === GroupEditorStudentAssociationIds;
    }),
  );
}

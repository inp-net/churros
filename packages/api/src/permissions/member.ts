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
// TODO also accept group.id
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

export function membership(user: Context['user'], groupUid: string) {
  return user?.groups.find(({ group: { uid } }) => uid === groupUid);
}

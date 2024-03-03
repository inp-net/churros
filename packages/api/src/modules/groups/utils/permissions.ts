import type { Context } from '#lib';
import { membership, userIsOnBoardOf } from '#permissions';

export function canCreateSubgroups(user: Context['user'], group: { uid: string }): boolean {
  if (!user) return false;
  return user.admin || user.canEditGroups || userIsOnBoardOf(user, group.uid);
}

export function canEditMembers(user: Context['user'], group: { uid: string }): boolean {
  if (!user) return false;
  return Boolean(
    user.admin ||
      user.canEditGroups ||
      userIsOnBoardOf(user, group.uid) ||
      membership(user, group.uid)?.canEditMembers,
  );
}

export const canEditDetails = canCreateSubgroups;

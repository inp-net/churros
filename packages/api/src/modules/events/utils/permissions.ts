import type { Context } from '#lib';
import { canScanBookings } from '#modules/ticketing';
import type { Event, EventManager, Group } from '@prisma/client';
import { onBoard } from '../../../permissions/member.js';

export function canEdit(event: Event & { managers: EventManager[] }, user: Context['user']) {
  if (user?.admin) return true;
  if (user?.canEditGroups) return true;
  if (event.authorId === user?.id) return true;

  const membership = user?.groups.find(({ group }) => group.id === event.groupId);
  if (membership?.canEditArticles) return true;

  const managementship = event.managers.find((m) => m.userId === user?.id);
  if (managementship?.canEdit) return true;

  return false;
}

export function canEditManagers(
  event: Event & { managers: EventManager[] },
  user: Context['user'],
) {
  if (user?.admin) return true;
  if (event.authorId === user?.id) return true;

  const membership = user?.groups.find(({ group }) => group.id === event.groupId);
  if (onBoard(membership)) return true;

  const managementship = event.managers.find((m) => m.userId === user?.id);
  if (managementship?.canEditPermissions) return true;

  return false;
}

export function canSeeBookings(event: Event & { managers: EventManager[] }, user: Context['user']) {
  return canScanBookings(event, user) || canEdit(event, user);
}

export function canCreateEvent(group: Group, user: Context['user']) {
  if (user?.admin) return true;

  const membership = user?.groups.find((g) => g.group.id === group.id);
  if (membership?.canEditArticles) return true;
  if (onBoard(membership)) return true;

  return false;

export function canCreateEvents(user: Context['user'], group: { id: string }) {
  if (!user) return false;
  return (
    // Admins
    user.admin ||
    // Group managers
    user.canEditGroups ||
    // Authors of the group
    user.groups.some((g) => g.group.id === group.id && g.canEditArticles)
  );
}

export function canEditEvent(
  user: Context['user'],
  {
    authorId,
    groupId,
    managers,
  }: {
    authorId: string | null;
    groupId: string;
    managers: Array<{ canEdit: boolean; userId: string }>;
  },
) {
  if (!user) return false;
  return (
    // Admins
    user.admin ||
    // Group managers
    user.canEditGroups ||
    // The author
    authorId === user.id ||
    // Other authors of the group
    user.groups.some((g) => g.group.id === groupId && g.canEditArticles) ||
    // Event managers
    managers.some((m) => m.userId === user.id && m.canEdit)
  );
}

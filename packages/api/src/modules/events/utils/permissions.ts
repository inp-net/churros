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
}

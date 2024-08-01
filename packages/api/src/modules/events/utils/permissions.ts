import { type Context } from '#lib';
import { onBoard, userIsAdminOf, userIsGroupEditorOf } from '#permissions';
import type { Event, EventManager, Group, Prisma } from '@churros/db/prisma';

export function canCreateEvents(
  user: Context['user'],
  groupUid: Group,
  level: 'can' | 'wants' = 'can',
) {
  if (level === 'can' && user?.admin) return true;
  if (level === 'can' && userIsAdminOf(user, groupUid.studentAssociationId)) return true;

  const membership = user?.groups.find((g) => g.group.id === groupUid.id);
  if (membership?.canEditArticles) return true;
  if (onBoard(membership)) return true;

  return false;
}

export const canEditEventPrismaIncludes = {
  managers: true,
  group: true,
} satisfies Prisma.EventInclude;

export function canEditEvent(
  event: Prisma.EventGetPayload<{ include: typeof canEditEventPrismaIncludes }>,
  user: Context['user'],
) {
  if (userIsAdminOf(user, event.group.studentAssociationId)) return true;
  if (userIsGroupEditorOf(user, event.group.studentAssociationId)) return true;
  if (event.authorId === user?.id) return true;

  const membership = user?.groups.find(({ group }) => group.id === event.groupId);
  if (membership?.canEditArticles) return true;

  const managementship = event.managers.find((m) => m.userId === user?.id);
  return !!managementship?.canEdit;
}

export function canEditManagers(
  event: Event & { managers: EventManager[]; group: Group },
  user: Context['user'],
) {
  if (userIsAdminOf(user, event.group.studentAssociationId)) return true;
  if (event.authorId === user?.id) return true;

  const membership = user?.groups.find(({ group }) => group.id === event.groupId);
  if (onBoard(membership)) return true;

  const managementship = event.managers.find((m) => m.userId === user?.id);
  return !!managementship?.canEditPermissions;
}
export function canCreateEvent(group: Group, user: Context['user']) {
  if (userIsAdminOf(user, group.studentAssociationId)) return true;

  const membership = user?.groups.find((g) => g.group.id === group.id);
  if (membership?.canEditArticles) return true;
  if (onBoard(membership)) return true;

  return false;
}

export function canSeeEventLogs(
  event: Event & { managers: EventManager[]; group: Group },
  user: Context['user'],
): boolean {
  return canEditEvent(event, user);
}

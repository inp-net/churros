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

export const canEditManagersPrismaIncludes = {
  managers: true,
  group: true,
} satisfies Prisma.EventInclude;

export function canEditManagers(
  event: Prisma.EventGetPayload<{ include: typeof canEditManagersPrismaIncludes }>,
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

export function canAccessEvent(
  user: Context['user'],
  event: Prisma.EventGetPayload<{ include: typeof canAccessEvent.prismaIncludes }>,
) {
  if (canEditEvent(event, user)) return true;

  switch (event.visibility) {
    case 'Unlisted':
    case 'Public': {
      return true;
    }
    case 'SchoolRestricted': {
      if (!user) return false;
      return [event.group, ...event.coOrganizers].some(({ studentAssociation: { school } }) =>
        user.major?.schools.some((s) => s.uid === school.uid),
      );
    }
    case 'GroupRestricted': {
      if (!user) return false;
      // TODO handle subgroups
      return [event.group, ...event.coOrganizers].some(({ groupId }) =>
        user.groups.some((g) => g.groupId === groupId),
      );
    }
    case 'Private': {
      return false;
    }
  }
}

canAccessEvent.prismaIncludes = {
  ...canEditEventPrismaIncludes,
  group: { include: { studentAssociation: { include: { school: true } } } },
  coOrganizers: { include: { studentAssociation: { include: { school: true } } } },
} as const satisfies Prisma.EventInclude;

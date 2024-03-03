import type { Context } from '#lib';

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

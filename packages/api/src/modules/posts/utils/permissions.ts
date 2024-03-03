import type { Context } from '#lib';

export function canEditArticle(
  user: Context['user'],
  { authorId, groupId }: { groupId: string; authorId: string | null },
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
    user.groups.some((g) => g.group.id === groupId && g.canEditArticles)
  );
}

export function canCreateArticles(user: Context['user'], group: { id: string }) {
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

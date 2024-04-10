import type { Context } from '#lib';
import { Visibility, type Article, type Group, type StudentAssociation } from '@prisma/client';

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

export function canSeeArticle(
  user: Context['user'],
  article: Article & { group: Group & { studentAssociation?: StudentAssociation | null } },
) {
  if (article.visibility === Visibility.Public || article.visibility === Visibility.Unlisted)
    return true;
  if (!user) return false;
  if (article.authorId === user.id) return true;
  if (user.admin) return true;

  if (article.visibility === Visibility.GroupRestricted) {
    const userIsMemberOfGroupFamily = user.groups.some(
      (g) => g.group.familyId === article.group.familyId,
    );
    const userisMemberOfThisGroup = user.groups.some((g) => g.group.id === article.groupId);

    return userIsMemberOfGroupFamily || userisMemberOfThisGroup;
  }

  if (article.visibility === Visibility.SchoolRestricted) {
    return user.major?.schools.some((s) => s.id === article.group.studentAssociation?.schoolId);
  }

  return false;
}

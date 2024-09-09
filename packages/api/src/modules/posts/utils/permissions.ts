import type { Context } from '#lib';
import { canCreatePostsOn } from '#modules/groups';
import { userIsAdminOf, userIsGroupEditorOf } from '#permissions';
import type { Prisma } from '@churros/db/prisma';

export function canEditArticle(
  oldArticle: Prisma.ArticleGetPayload<{ include: typeof canEditArticle.prismaIncludes }>,
  newArticle: {
    authorId: string | null;
    group: null | Prisma.GroupGetPayload<{
      include: typeof canCreatePostsOn.prismaIncludes;
    }>;
  },
  user: Context['user'],
): boolean {
  if (!user) return false;
  if (user.admin) return true;
  if (userIsGroupEditorOf(user, oldArticle.group.studentAssociation.id)) return true;
  if (userIsAdminOf(user, oldArticle.group.studentAssociation.id)) return true;

  // No editing authorless articles, except for people above
  if (!oldArticle.authorId) return false;
  // Same for changing the author, except when it's the user themselves
  if (oldArticle.authorId !== newArticle.authorId && newArticle.authorId !== user.id) return false;

  // Changing the group of an article
  if (newArticle.group && oldArticle.groupId !== newArticle.group?.id) {
    // We must be able to edit the old article
    if (!canEditArticle(oldArticle, oldArticle, user)) return false;
    // We must be able to create articles on the new group
    if (!canCreatePostsOn(user, newArticle.group)) return false;
  }

  // Authors can always edit their own articles
  if (oldArticle.authorId === user.id) return true;

  // Group permissions can edit articles in their groups
  if (
    user.groups.some(
      ({ groupId, canEditArticles }) => canEditArticles && groupId === oldArticle.groupId,
    )
  )
    return true;

  return false;
}

canEditArticle.prismaIncludes = {
  author: true,
  group: {
    include: {
      ...canCreatePostsOn.prismaIncludes,
    },
  },
} as const satisfies Prisma.ArticleInclude;

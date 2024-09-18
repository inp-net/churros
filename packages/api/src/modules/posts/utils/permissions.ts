import type { Context } from '#lib';
import { canCreatePostsOn } from '#modules/groups';
import { userIsAdminOf, userIsGroupEditorOf } from '#permissions';
import type { Prisma } from '@churros/db/prisma';

export function canEditArticle(
  article: Prisma.ArticleGetPayload<{ include: typeof canEditArticle.prismaIncludes }>,
  changes: {
    authorId: string | null;
    group: null | Prisma.GroupGetPayload<{
      include: typeof canCreatePostsOn.prismaIncludes;
    }>;
  },
  user: Context['user'],
): boolean {
  if (!user) return false;
  if (user.admin) return true;
  if (userIsGroupEditorOf(user, article.group.studentAssociation.id)) return true;
  if (userIsAdminOf(user, article.group.studentAssociation.id)) return true;

  // No editing authorless articles, except for people above
  if (!article.authorId) return false;
  // Same for changing the author, except when it's the user themselves
  if (article.authorId !== changes.authorId && changes.authorId !== user.id) return false;

  // Changing the group of an article
  if (changes.group && article.groupId !== changes.group?.id) {
    // We must be able to edit the old article
    if (!canEditArticle(article, article, user)) return false;
    // We must be able to create articles on the new group
    if (!canCreatePostsOn(user, changes.group)) return false;
  }

  // Authors can always edit their own articles
  if (article.authorId === user.id) return true;

  // Group permissions can edit articles in their groups
  if (
    user.groups.some(
      ({ groupId, canEditArticles }) => canEditArticles && groupId === article.groupId,
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

canEditArticle.prismaNewGroupIncludes = canCreatePostsOn.prismaIncludes;

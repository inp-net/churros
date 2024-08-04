import type { Context } from '#lib';
import type { Prisma } from '@churros/db/prisma';

export const canEditArticlePrismaIncludes = {} as const satisfies Prisma.ArticleInclude;

export function canEditArticle(
  oldArticle: { authorId: string | null; groupId: string },
  newArticle: { authorId: string | null; groupId: string },
  user: Context['user'],
): boolean {
  if (!user) return false;
  return (
    // Spoofing is disallowed
    ((newArticle.authorId === user.id &&
      // To set their-self or remove the author, the user must be allowed to write articles
      newArticle.authorId === oldArticle.authorId) ||
      user.groups.some(
        ({ groupId, canEditArticles }) => canEditArticles && groupId === oldArticle.groupId,
      )) &&
    // Who can edit this article?
    // The author
    (user.id === oldArticle.authorId ||
      // Other authors of the group
      user.groups.some(
        ({ groupId, canEditArticles }) => canEditArticles && groupId === oldArticle.groupId,
      ))
  );
}

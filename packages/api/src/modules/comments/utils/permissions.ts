import { type Context } from '#lib';
import { userIsAdminOf, userIsOnBoardOf } from '#permissions';
import type { Prisma } from '@churros/db/prisma';

export function canEditComment(
  user: Context['user'],
  comment: Prisma.CommentGetPayload<{ include: typeof canEditComment.prismaIncludes }>,
) {
  if (!user) return false;
  if (user.admin) return true;
  if (!comment.author) return false;
  if (user.id === comment.authorId) return true;

  // Allow board members to edit comments made on their group's resources
  if (comment.article?.group && userIsOnBoardOf(user, comment.article.group.uid)) return true;

  // Allow student association admins to edit comments made:
  // - by their students
  // - on their resources
  return userIsAdminOf(
    user,
    [
      ...(comment.author.major?.schools.flatMap((school) =>
        school.studentAssociations.map((sa) => sa.id),
      ) ?? []),
      comment.article?.group.studentAssociationId,
    ].filter((v) => v !== undefined),
  );
}

canEditComment.prismaIncludes = {
  article: {
    include: {
      group: true,
    },
  },
  author: {
    include: {
      major: {
        include: {
          schools: {
            include: {
              studentAssociations: true,
            },
          },
        },
      },
    },
  },
} as const satisfies Prisma.CommentInclude;

import { builder, log, prisma, publish } from '#lib';
import { CommentType } from '#modules/comments/types';
import { canEditComment } from '../utils/permissions.js';

builder.mutationField('deleteComment', (t) =>
  t.prismaField({
    type: CommentType,
    args: {
      id: t.arg.id(),
    },
    async authScopes(_, { id }, { user }) {
      const comment = await prisma.comment.findUniqueOrThrow({
        where: { id },
        include: canEditComment.prismaIncludes,
      });
      return canEditComment(user, comment);
    },
    async resolve(query, _, { id }) {
      const repliesCount = await prisma.comment.count({ where: { inReplyToId: id } });
      await log('comments', 'delete', { repliesCount }, id);

      const comment = await (repliesCount > 0
        ? prisma.comment.update({
            ...query,
            where: { id },
            data: { body: '_Commentaire supprimé_', author: { disconnect: true } },
          })
        : prisma.comment.delete({
            ...query,
            where: { id },
          }));

      publish(id, 'deleted', id, comment.articleId ?? comment.documentId ?? undefined);

      return comment;
    },
  }),
);

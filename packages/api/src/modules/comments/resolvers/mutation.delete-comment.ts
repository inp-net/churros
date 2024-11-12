import { builder, ensureGlobalId, log, prisma, publish } from '#lib';
import { CommentType } from '#modules/comments/types';
import { LocalID } from '#modules/global';
import { canEditComment } from '../utils/permissions.js';

builder.mutationField('deleteComment', (t) =>
  t.prismaField({
    type: CommentType,
    errors: {},
    args: {
      id: t.arg({ type: LocalID }),
    },
    async authScopes(_, { id }, { user }) {
      const comment = await prisma.comment.findUniqueOrThrow({
        where: { id: ensureGlobalId(id, 'Comment') },
        include: canEditComment.prismaIncludes,
      });
      return canEditComment(user, comment);
    },
    async resolve(query, _, { id }) {
      id = ensureGlobalId(id, 'Comment');
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
